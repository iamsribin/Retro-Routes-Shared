import { RequestHandler } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { StatusCode } from "../interfaces/status-code";

export type AccessPayload = JwtPayload & {
  id: string;
  role: "User" | "Driver" | "Admin";
};

export function generateJwtToken(
  payload: AccessPayload,
  secret: jwt.Secret,
  duration: jwt.SignOptions["expiresIn"] = "1h"
): string {
  const token = jwt.sign({ id: payload.id, role: payload.role }, secret, {
    expiresIn: duration,
  });

  return token;
}

export function verifyToken(token: string, secret: jwt.Secret) {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (err: unknown) {
    throw err;
  }
}


export function verifyAccessToken(secret: string): RequestHandler {
  if (!secret) {
    throw new Error(
      "JWT access token secret missing. Call verifyAccessToken(secret) with a secret or set JWT_ACCESS_TOKEN_SECRET in env."
    );
  }

  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        res.status(StatusCode.Forbidden).json({
          success: false,
          message: "No token provided",
        });
        return;
      }

      const decoded = jwt.verify(token, secret) as JwtPayload;

      if (decoded.role !== req.headers["x-user-role"]) {
        return res.status(StatusCode.Unauthorized).json({ error: "Unauthorized access" });
      }

      req.headers["x-user-payload"] = JSON.stringify({
        id: decoded.id,
        role: decoded.role,
      });

      return next();
    } catch (err: unknown) {
      // token expired
      if (err instanceof TokenExpiredError) {
        return res
          .status(StatusCode.Forbidden)
          .json({ message: "Token expired", reason: "token_expired" });
      }

      // invalid token or other jwt errors
      return res
        .status(StatusCode.Forbidden)
        .json({ message: "Invalid token", reason: "invalid_token" });
    }
  };
}
