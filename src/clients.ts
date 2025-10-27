// import * as grpc from "@grpc/grpc-js";
// import { userProto } from "./protos/index"; 

// /**
//  * Create a grpc client for the User service.
//  * Domain should be e.g. `${process.env.PRO_DOMAIN_USER}:${port}`
//  */
// export function createUserClient(address: string) {
//   const UserCtor = (userProto && (userProto as any).User) || (userProto as any);
//   if (!UserCtor) {
//     throw new Error("shared: user proto not loaded");
//   }

//   return new (UserCtor as any)(address, grpc.credentials.createInsecure());
// }
