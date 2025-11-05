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


export function requireEnv(name: string): string {
  const v = process.env[name];
  envChecker(v, name);
  return v as string;
}


export function initEnv(options?: { path?: string }) {
  const dotenv = require("dotenv") as typeof import("dotenv");
  return dotenv.config({ path: options?.path });
}
