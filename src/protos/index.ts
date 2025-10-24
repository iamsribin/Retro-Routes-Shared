import path from "path";
import { loadSync } from "@grpc/proto-loader";
import * as grpc from "@grpc/grpc-js";

function loadProto(protoFileName: string) {
  const def = loadSync(path.join(__dirname, protoFileName));
  return grpc.loadPackageDefinition(def);
}

export const userProto = loadProto("user.proto");
export const driverProto = loadProto("driver.proto");
export const bookingProto = loadProto("booking.proto");
export const paymentProto = loadProto("payment.proto");
export const realtimeProto = loadProto("realtime.proto");
