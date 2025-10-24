export const EXCHANGE = "retro.routes";

export const QUEUES = {
  realtime: {
    bookingRequest: "realtime.bookingRequest",
    driverDocExpired: "realtime.driverDocExpired",
    driverStartRide: "realtime.driverStartRide",
    cancelRide: "realtime.cancelRide",
    rideCompleted: "realtime.rideCompleted",
    paymentCompleted: "realtime.payment_completed",
    dlq: "realtime.dlq"
  },
  driver: {
    rejection: "driver.rejection",
    timeout: "driver.timeout"
  },
  booking: {
    driverAcceptance: "booking.driverAcceptance",
    statusUpdate: "booking.statusUpdate",
    driverAssigned: "booking.driverAssigned"
  },
  user: {
    notification: "user.notification"
  }
} as const;

type QueueBinding = { queue: string; routingKey: string };

export const BINDINGS: QueueBinding[] = [
  { queue: QUEUES.booking.driverAcceptance, routingKey: "driver.acceptance" },
  { queue: QUEUES.realtime.bookingRequest, routingKey: "booking.request" },
  { queue: QUEUES.realtime.driverStartRide, routingKey: "driver.startRide" },
  { queue: QUEUES.realtime.driverDocExpired, routingKey: "driver.doc.expired" },
  { queue: QUEUES.realtime.cancelRide, routingKey: "cancel.ride" },
  { queue: QUEUES.realtime.rideCompleted, routingKey: "ride.completed" },
  { queue: QUEUES.realtime.paymentCompleted, routingKey: "payment.completed" },
  { queue: QUEUES.driver.rejection, routingKey: "driver.rejection" },
  { queue: QUEUES.driver.timeout, routingKey: "driver.timeout" },
  { queue: QUEUES.booking.statusUpdate, routingKey: "booking.status.update" },
  { queue: QUEUES.booking.driverAssigned, routingKey: "booking.driver.assigned" },
  { queue: QUEUES.user.notification, routingKey: "user.notification" },
];
