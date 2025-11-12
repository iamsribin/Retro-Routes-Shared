import { Channel } from 'amqplib';
import { buildQueueNames } from './rabbitmq.config';

export async function setupQueueWithDLQ(
  channel: Channel,
  exchange: string,
  queueBaseName: string,
  routingKey: string,
) {
  const { main, retry, dlq } = buildQueueNames(queueBaseName);

  // DLQ
  await channel.assertQueue(dlq, { durable: true });

  // Retry queue (messages move here temporarily)
  await channel.assertQueue(retry, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': exchange,
      'x-dead-letter-routing-key': routingKey,
      'x-message-ttl': 10000, 
    },
  });

  // Main queue (sends failed messages to retry)
  await channel.assertQueue(main, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': exchange,
      'x-dead-letter-routing-key': `${routingKey}.retry`,
    },
  });

  // Bind queues
  await channel.bindQueue(main, exchange, routingKey);
  await channel.bindQueue(retry, exchange, `${routingKey}.retry`);
  await channel.bindQueue(dlq, exchange, `${routingKey}.dlq`);

  console.log(`[RabbitMQ] 🧩 DLQ/Retry setup done for ${main}`);
}
