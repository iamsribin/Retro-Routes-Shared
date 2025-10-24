import * as amqp from "amqplib";
import { EXCHANGE } from "../constants/queues";

/** publish using confirm channel, resolving when broker acknowledges */
export async function publishConfirm(
  ch: amqp.ConfirmChannel,
  routingKey: string,
  payload: any,
  opts: amqp.Options.Publish = { persistent: true }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const content = Buffer.from(JSON.stringify(payload));
    ch.publish(EXCHANGE, routingKey, content, opts, (err, ok) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/** small helper that creates its own confirm channel and publishes once (not recommended for high throughput) */
export async function publishOnce(url: string, routingKey: string, payload: any) {
  const conn = await (await import("./connection")).getConnection(url);
  const ch = await conn.createConfirmChannel();
  await ch.assertExchange(EXCHANGE, "topic", { durable: true });
  await publishConfirm(ch, routingKey, payload);
  await ch.close();
}
