export class EnvError extends Error {
  public readonly key: string;
  constructor(key: string, message?: string) {
    super(message ?? `Environment variable ${key} is required but was not provided.`);
    this.key = key;
    this.name = "EnvError";
    Error.captureStackTrace?.(this, EnvError);
  }
}


export function envChecker(value: string | undefined | null, name: string): void {
  if (value === undefined || value === null) {
    throw new EnvError(name);
  }
  if (typeof value === "string" && value.trim() === "") {
    throw new EnvError(name, `Environment variable ${name} is an empty string.`);
  }
}

/**
 * Convenience: return the env value or throw if missing.
 * Allows inline calls like:
 *   const PORT = requireEnv("PORT");
 */
export function requireEnv(name: string): string {
  const v = process.env[name];
  envChecker(v, name);
  return v as string;
}


export function initEnv(options?: { path?: string }) {
  // lazy import so shared package consumers that don't want dotenv don't pay the runtime cost
  // and so tests can mock process.env easily
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require("dotenv") as typeof import("dotenv");
  return dotenv.config({ path: options?.path });
}
