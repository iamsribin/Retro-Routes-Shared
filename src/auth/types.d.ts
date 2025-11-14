import { AccessPayload } from "./auth";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export type AccessPayload = JwtPayload & {
  id: string;
  role: "User" | "Driver" | "Admin";
};