import { RequestHandler } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { StatusCode } from "../interfaces/status-code";

export type AccessPayload = JwtPayload & {
  clientId: string;
  role: string;
};


export function verifyAccessToken(secret: string): RequestHandler {
  const s = secret;
  if (!s) {
    // fail fast to avoid silent misconfig
    throw new Error(
      "JWT access token secret missing. Call verifyAccessToken(secret) with a secret or set JWT_ACCESS_TOKEN_SECRET in env."
    );
  }

  return (req, res, next) => {
    try {
      const token =
        req.cookies?.token || req.headers.authorization?.split(" ")[1];

      if (!token) {
        res.status(StatusCode.BadGateway).json({
          success: false,
          message: "No token provided",
        });
        return;
      }

      const decoded = jwt.verify(token, s) as JwtPayload;

      if (decoded.role !== req.headers["x-user-role"]) {
			return res.status(401).json({ error: "Unauthorized access" });
		  }

      req.headers["x-user-payload"] = JSON.stringify({ id: decoded.clientId, role: decoded.role });

      return next();
    } catch (err: unknown) {
      // token expired
      if (err instanceof TokenExpiredError) {
        return res
          .status(401)
          .json({ message: "Token expired", reason: "token_expired" });
      }

      // invalid token or other jwt errors
      return res
        .status(401)
        .json({ message: "Invalid token", reason: "invalid_token" });
    }
  };
}
