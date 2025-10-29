// shared/src/middleware/errorHandler.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { HttpError } from "../errors/HttpError";

/**
 * Centralized Express error handler to use in every service
 * Always responds with consistent shape.
 */
export const errorHandler: ErrorRequestHandler =(err: unknown, req: Request, res: Response, next: NextFunction)=> {
  // If already an HttpError, trust it
  if (err instanceof HttpError) {
    const payload = {
      status: err.status,
      code: err.code,
      message: err.safe ? err.message : "Internal server error",
      details: err.details ?? null,
      navigate: err.navigate ?? null,
    };
    // Log with service logger (replace console with your logger)
    console.error(`[HttpError] ${req.method} ${req.url} ->`, {
      message: err.message,
      status: err.status,
      code: err.code,
      details: err.details,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
    return res.status(err.status).json(payload);
  }

  // handle known runtime errors (mongoose validation, multer, typeorm, etc.)
  // You can add more mappings below:
  const anyErr = err as any;

  // Example: Mongoose validation error
  if (anyErr && anyErr.name === "ValidationError" && anyErr.errors) {
    const details: Record<string, string> = {};
    for (const k of Object.keys(anyErr.errors)) {
      details[k] = anyErr.errors[k].message || anyErr.errors[k].toString();
    }
    const he = new HttpError(400, "Validation failed", { code: "VALIDATION_ERROR", details });
    return errorHandler(he, req, res, next); // reuse http flow
  }

  // Multer file upload error
  if (anyErr && anyErr.code && typeof anyErr.code === "string" && anyErr.code.startsWith("LIMIT_")) {
    const he = new HttpError(400, anyErr.message || "File upload error", { code: "UPLOAD_ERROR", details: anyErr });
    return errorHandler(he, req, res, next);
  }

  // Default fallback: log and return generic 500
  console.error("[UnhandledError]", req.method, req.url, anyErr);
  const he = new HttpError(500, "Internal server error", { code: "INTERNAL_ERROR", safe: false });
  return errorHandler(he, req, res, next);
}
