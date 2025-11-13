export const EXCHANGES = {
  BOOKING: 'booking.exchange',
  PAYMENT: 'payment.exchange',
  DRIVER: 'driver.exchange',
  USER: 'user.exchange',
  NOTIFICATION: 'notification.exchange',
} as const;

export const ROUTING_KEYS = {
  BOOKING_CREATED: 'booking.created',
  BOOKING_CANCELLED: 'booking.cancelled',
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILED: 'payment.failed',
  DRIVER_ASSIGNED: 'driver.assigned',
  DRIVER_LOCATION_UPDATE: 'driver.location.update',
  USER_WALLET_CREATE: 'user.wallet.create',
} as const;

export const QUEUES = {
  BOOKING_SERVICE: 'booking.queue',
  PAYMENT_SERVICE: 'payment.queue',
  DRIVER_SERVICE: 'driver.queue',
  NOTIFICATION_SERVICE: 'notification.queue',
} as const;

// DLQ and retry conventions
export const DLQ_SUFFIX = '.dlq';
export const RETRY_SUFFIX = '.retry';

// Helper to auto-generate DLQ/retry queue names
export function buildQueueNames(base: string) {
  return {
    main: base,
    retry: `${base}${RETRY_SUFFIX}`,
    dlq: `${base}${DLQ_SUFFIX}`,
  };
}
