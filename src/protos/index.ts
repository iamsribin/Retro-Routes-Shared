import path from "path";
import { loadSync } from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";

const PROTO_OPTIONS = {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

function loadPackage(protoFilename: string) {
  const protoPath = path.join(__dirname, protoFilename);
  const packageDef = loadSync(protoPath, PROTO_OPTIONS);
  return grpc.loadPackageDefinition(packageDef) as any;
}

export const userProto = loadPackage("user.proto").user_package;
export const driverProto = loadPackage("driver.proto").driver_package;
export const bookingProto = loadPackage("booking.proto").booking_package;
export const realtimeProto = loadPackage("realtime.proto").realtime_package;
export const paymentProto = loadPackage("payment.proto").payment_package;


export const userServiceDescriptor = userProto?.User?.service ?? null;
export const driverServiceDescriptor = driverProto?.Driver?.service ?? null;
export const bookingDescriptor = bookingProto?.Booking?.service ?? null;
export const realtimeServiceDescriptor = realtimeProto?.Realtime?.service ?? null;
export const paymentServiceDescriptor = paymentProto?.PaymentService.service ?? null; 