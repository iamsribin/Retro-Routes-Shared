export interface ErrorDetails { [key: string]: any }

export class HttpError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ErrorDetails;
  public readonly navigate?: string;
  public readonly safe: boolean;

  constructor(
    status = 500,
    message = "Internal server error",
    options?: {
      code?: string;
      details?: ErrorDetails;
      navigate?: string;
      safe?: boolean;
    }
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = options?.code ?? `ERR_${status}`;
    this.details = options?.details;
    this.navigate = options?.navigate;
    this.safe = options?.safe ?? (status < 500); 
    Error.captureStackTrace?.(this, this.constructor);
  }
}
