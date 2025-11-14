export * from "./HttpError";
export * from "./errorHandler";

export const BadRequestError = (message = "Bad request", opts?: any) =>
  new (require("./HttpError").HttpError)(400, message, { code: "BAD_REQUEST", ...opts });

export const NotFoundError = (message = "Not found", opts?: any) =>
  new (require("./HttpError").HttpError)(404, message, { code: "NOT_FOUND", ...opts });

export const UnauthorizedError = (message = "Unauthorized", opts?: any) =>
  new (require("./HttpError").HttpError)(401, message, { code: "UNAUTHORIZED", ...opts });

export const ForbiddenError = (message = "Forbidden", opts?: any) =>
  new (require("./HttpError").HttpError)(403, message, { code: "FORBIDDEN", ...opts });

export const InternalError = (message = "Internal server error", opts?: any) =>
  new (require("./HttpError").HttpError)(500, message, { code: "INTERNAL_ERROR", safe: false, ...opts });

export const ConflictError = (message = "Conflict Error", opts?: any) =>
  new (require("./HttpError").HttpError)(409, message, { code: "CONFLICT_ERROR", ...opts });
