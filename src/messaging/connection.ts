import amqp, { Connection, Channel, ConfirmChannel } from "amqplib";
import { EXCHANGE, QUEUES, BINDINGS } from "../constants/queues";

const DEFAULT_RECONNECT_MS = 1000;
let connection: Connection | null = null;
let connecting = false;
let currentBackoff = DEFAULT_RECONNECT_MS;

export async function initRabbit(url: string): Promise<Connection> {
  if (connection) return connection;
  if (connecting) {
    while (connecting && !connection) {
      await new Promise(res => setTimeout(res, 100));
    }
    if (connection) return connection;
  }

  connecting = true;
  try {
    connection = await amqp.connect(url);
    currentBackoff = DEFAULT_RECONNECT_MS;

    connection.on("close", (err: any) => {
      console.error("RabbitMQ connection closed", err);
      connection = null;
      reconnect(url);
    });

    connection.on("error", (err: any) => {
      console.error("RabbitMQ connection error", err);
    });

    return connection;
  } finally {
    connecting = false;
  }
}

async function reconnect(url: string) {
  try {
    await new Promise(res => setTimeout(res, currentBackoff));
    currentBackoff = Math.min(currentBackoff * 2, 30_000);
    await initRabbit(url);
    console.log("RabbitMQ reconnected");
  } catch (err) {
    console.error("RabbitMQ reconnect failed, retrying...", err);
    setTimeout(() => reconnect(url), currentBackoff);
  }
}

export async function getConnection(url: string): Promise<Connection> {
  if (connection) return connection;
  return initRabbit(url);
}

export async function createChannel(url: string): Promise<Channel> {
  const conn = await getConnection(url);
  const ch = await conn.createChannel();

  await ch.assertExchange(EXCHANGE, "topic", { durable: true });

  const dlx = `${EXCHANGE}.dlx`;
  await ch.assertExchange(dlx, "topic", { durable: true });

  for (const block of Object.values(QUEUES)) {
    for (const queueName of Object.values(block)) {
      if (typeof queueName !== "string") continue;
      const dlqName = `${queueName}.dlq`;

      await ch.assertQueue(dlqName, { durable: true });
      await ch.bindQueue(dlqName, dlx, `${queueName}.#`);

      await ch.assertQueue(queueName, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": dlx
        }
      });
    }
  }

  for (const b of BINDINGS) {
    await ch.bindQueue(b.queue, EXCHANGE, b.routingKey);
  }

  return ch;
}

export async function createConfirmChannel(url: string): Promise<ConfirmChannel> {
  const conn = await getConnection(url);
  const ch = await conn.createConfirmChannel();
  await ch.assertExchange(EXCHANGE, "topic", { durable: true });
  return ch;
}

export async function closeConnection(): Promise<void> {
  try {
    if (connection) {
      await connection.close();
      connection = null;
    }
  } catch (e) {
    console.warn("Error closing RabbitMQ connection", e);
  }
}
