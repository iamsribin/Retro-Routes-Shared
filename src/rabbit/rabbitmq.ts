import amqp, { Connection, Channel, ConsumeMessage } from "amqplib";

interface RabbitConfig {
  url: string;
  serviceName: string;
}

interface RetryConfig {
  exchange: string;
  queue: string;
  routingKey: string;
  type?: "topic" | "direct" | "fanout";
  maxRetries?: number;
  retryDelay?: number; // in ms
}

class RabbitMQ {
  private static connection: Awaited<ReturnType<typeof amqp.connect>> | null = null;
  private static channel: Channel | null = null;
  private static isConnected = false;

  public static async connect(config: RabbitConfig) {
    if (this.isConnected && this.connection) return;

    this.connection = await amqp.connect(config.url);
    this.connection.on("error", (err: unknown) => {
      console.error(`[RabbitMQ] Connection error in ${config.serviceName}:`, err);
      this.isConnected = false;
    });

    this.connection.on("close", () => {
      console.warn(`[RabbitMQ] Connection closed in ${config.serviceName}`);
      this.isConnected = false;
    });

    this.channel = await this.connection.createChannel();
    this.isConnected = true;
    console.log(`[RabbitMQ] ✅ Connected (${config.serviceName})`);
  }

  // Core setup: Main + Retry + DLQ
  public static async setupQueues(config: RetryConfig) {
    if (!this.channel) throw new Error("RabbitMQ not connected");

    const { exchange, queue, routingKey, type = "topic", retryDelay = 10000 } = config;

    const retryExchange = `${exchange}.retry`;
    const dlxExchange = `${exchange}.dlx`;
    const retryQueue = `${queue}.retry`;
    const dlq = `${queue}.dlq`;

    // 1️⃣ Declare main exchange + queue
    await this.channel.assertExchange(exchange, type, { durable: true });
    await this.channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: retryExchange, // send to retry exchange on nack
    });
    await this.channel.bindQueue(queue, exchange, routingKey);

    // 2️⃣ Retry exchange + queue (with TTL)
    await this.channel.assertExchange(retryExchange, type, { durable: true });
    await this.channel.assertQueue(retryQueue, {
      durable: true,
      messageTtl: retryDelay,
      deadLetterExchange: exchange, // after TTL, send back to main exchange
    });
    await this.channel.bindQueue(retryQueue, retryExchange, routingKey);

    // 3️⃣ DLX (Dead Letter Exchange + Queue)
    await this.channel.assertExchange(dlxExchange, type, { durable: true });
    await this.channel.assertQueue(dlq, { durable: true });
    await this.channel.bindQueue(dlq, dlxExchange, routingKey);

    console.log(
      `[RabbitMQ] 🧩 Setup complete: ${queue}, Retry: ${retryQueue}, DLQ: ${dlq}`
    );
  }

  // Publisher
  public static async publish(exchange: string, routingKey: string, data: any) {
    if (!this.channel) throw new Error("RabbitMQ not connected");

    const buffer = Buffer.from(JSON.stringify(data));
    this.channel.publish(exchange, routingKey, buffer, { persistent: true });
    console.log(`[RabbitMQ] 📤 Published → ${exchange}:${routingKey}`);
  }

  // Consumer with retry + DLQ logic
  public static async consume(
    queue: string,
    handler: (data: any, msg: ConsumeMessage) => Promise<void> | void,
    maxRetries = 3
  ) {
    if (!this.channel) throw new Error("RabbitMQ not connected");

    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      const headers = msg.properties.headers || {};
      const retryCount = headers["x-retry-count"] || 0;

      try {
        const content = JSON.parse(msg.content.toString());
        await handler(content, msg);
        this.channel!.ack(msg);
      } catch (err) {
        console.error(`[RabbitMQ] ❌ Error processing message from ${queue}:`, err);

        if (retryCount < maxRetries) {
          const nextRetry = retryCount + 1;
          const newHeaders = { ...headers, "x-retry-count": nextRetry };

          // Re-publish to retry exchange with incremented retry count
          this.channel!.publish(
            `${msg.fields.exchange}.retry`,
            msg.fields.routingKey,
            msg.content,
            { headers: newHeaders, persistent: true }
          );
          console.warn(`🔁 Retrying (${nextRetry}/${maxRetries}) → ${queue}`);
        } else {
          // Move to DLQ
          this.channel!.publish(
            `${msg.fields.exchange}.dlx`,
            msg.fields.routingKey,
            msg.content,
            { headers, persistent: true }
          );
          console.error(`☠️ Moved to DLQ after ${maxRetries} retries`);
        }

        this.channel!.ack(msg);
      }
    });

    console.log(`[RabbitMQ] 👂 Listening on queue: ${queue}`);
  }

  public static async close() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.isConnected = false;
      console.log("[RabbitMQ] 🛑 Closed");
    } catch (err) {
      console.error("[RabbitMQ] Error closing:", err);
    }
  }
}

export { RabbitMQ };
