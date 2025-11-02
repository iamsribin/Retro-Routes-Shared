import { RedisService } from "./RedisService";

export function createRedisService(redisUrl: string) {
  return RedisService.init(redisUrl);
}

export function getRedisService(): RedisService {
  return RedisService.getInstance();
}
