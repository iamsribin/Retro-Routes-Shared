// src/middleware/verifyGatewayJwt.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AccessPayload } from "./auth";
import { IRole } from "../interfaces/common-types";


declare global {
  // augment Express Request to carry parsed gateway user
  namespace Express {
    interface Request {
      gatewayUser?: AccessPayload | null;
    }
  }
}

/**
 * Factory middleware to verify gateway-signed JWT.
 * - strict: if true, responds 401 on missing/invalid token; if false, attaches null and calls next().
 * - options.role: optional string or array to require a role match (e.g. 'Driver' or ['Admin','Driver'])
 */
export function verifyGatewayJwt(strict = true, GATEWAY_SECRET:string, options?: { role?: string | string[] }): RequestHandler {
      
    if (!GATEWAY_SECRET) {
     console.warn("GATEWAY_SHARED_SECRET is not set. Gateway JWT verification will fail.");
     }
  
    return (req: Request, res: Response, next: NextFunction) => {
    const raw = (req.headers["x-gateway-jwt"] as string | undefined) ?? null;

    if (!raw) {
      if (strict) return res.status(401).json({ message: "Missing gateway token" });
      req.gatewayUser = null;
      return next();
    }

    try {
      const decoded = jwt.verify(raw, GATEWAY_SECRET as string, { issuer: "api-gateway" }) as AccessPayload;

      // Validate required claims
      if (!decoded || typeof decoded !== "object" || !decoded.id || !decoded.role) {
        if (strict) return res.status(401).json({ message: "Invalid gateway token (claims missing)" });
        req.gatewayUser = null;
        return next();
      }

      const gatewayUser: AccessPayload = {
        id: String(decoded.id),
        role: String(decoded.role) as IRole,
      };

      // optional role check
      if (options?.role) {
        const required = Array.isArray(options.role) ? options.role : [options.role];
        if (!required.includes(gatewayUser.role)) {
          if (strict) return res.status(403).json({ message: "Forbidden: role mismatch" });
          req.gatewayUser = null;
          return next();
        }
      }

      req.gatewayUser = gatewayUser;
      return next();
    } catch (err) {
      // jwt.verify throws for expired/invalid tokens
      const message = (err as Error).message || "Invalid gateway token";
      if (strict) return res.status(401).json({ message: `Invalid gateway token: ${message}` });
      req.gatewayUser = null;
      return next();
    }
  };
}
