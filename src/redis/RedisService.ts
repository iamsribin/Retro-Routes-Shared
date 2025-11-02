import Redis from "ioredis";
import {
  GEO_KEY,
  GEO_KEY_RIDE,
  HEARTBEAT_PREFIX,
  ONLINE_DRIVER_DETAILS_PREFIX,
  RIDE_DRIVER_DETAILS_PREFIX,
} from "../constants/redis-keys";
import { DriverDetails } from "./types";

/**
 * RedisService
 * - Singleton wrapper around ioredis
 * - Methods mirror your helper functions, but on a class instance so you can DI / mock easily
 */
export class RedisService {
  private static instance: RedisService | null = null;
  private redis: Redis;

  // private to enforce singleton
  private constructor(redisClient: Redis) {
    this.redis = redisClient;
    this.redis.on("error", (err) => {
      console.error("Redis error:", err);
    });
  }

  /**
   * init must be called once at service bootstrap (or call getInstance() which will auto-init from env)
   * @param redisUrl optional redis connection url
   */
  public static init(url?: string) {
    if (this.instance) return this.instance;
    if (!url) {
      throw new Error("REDIS_URL is not set. Provide url to RedisService.init(url).");
    }
    const client = new Redis(url);
    this.instance = new RedisService(client);
    return this.instance;
  }

  /**
   * Returns the singleton instance. If not initialized, will attempt to init from process.env.REDIS_URL.
   */
  public static getInstance() {
 if (!this.instance) {
    throw new Error("RedisService not initialized. Call RedisService.init(url) first.");
    }
    return this.instance as RedisService;
  }

  // expose raw client for advanced ops
  public raw() {
    return this.redis;
  }

  // ping / health
  public async ping() {
    return this.redis.ping();
  }

  // HEARTBEAT
  public async setHeartbeat(driverId: string, ttlSeconds = 120) {
    const key = `${HEARTBEAT_PREFIX}${driverId}`;
    await this.redis.set(key, Date.now().toString(), "EX", ttlSeconds);
  }

  public async isDriverOnline(driverId: string) {
    const key = `${HEARTBEAT_PREFIX}${driverId}`;
    const val = await this.redis.get(key);
    return !!val;
  }

  // DRIVER DETAILS
  public async setDriverDetails(driverDetails: DriverDetails, isRide = false, ttlSeconds = 120) {
    const prefix = isRide ? RIDE_DRIVER_DETAILS_PREFIX : ONLINE_DRIVER_DETAILS_PREFIX;
    const key = `${prefix}${driverDetails.driverId}`;
    await this.redis.set(key, JSON.stringify(driverDetails), "EX", ttlSeconds);
    return this.getDriverDetails(driverDetails.driverId, isRide);
  }

  public async getDriverDetails(driverId: string, isRide = false) {
    const prefix = isRide ? RIDE_DRIVER_DETAILS_PREFIX : ONLINE_DRIVER_DETAILS_PREFIX;
    const key = `${prefix}${driverId}`;
    const val = await this.redis.get(key);
    return val ? (JSON.parse(val) as DriverDetails) : null;
  }

  public async removeOnlineDriver(driverId: string, isRide = false) {
    const prefix = isRide ? RIDE_DRIVER_DETAILS_PREFIX : ONLINE_DRIVER_DETAILS_PREFIX;
    const key = `${HEARTBEAT_PREFIX}${driverId}`;
    const detailsKey = `${prefix}${driverId}`;
    await this.redis.del([key, detailsKey]);
    await this.redis.zrem(GEO_KEY, driverId);
    if (isRide) {
      await this.redis.zrem(GEO_KEY_RIDE, driverId);
    }
  }

  // GEO
  public async addDriverGeo(driverId: string, lng: number, lat: number, isRide = false) {
    const key = isRide ? GEO_KEY_RIDE : GEO_KEY;
    await this.redis.geoadd(key, lng, lat, driverId);
  }

  public async getDriverGeo(driverId: string, isRide = false) {
    const key = isRide ? GEO_KEY_RIDE : GEO_KEY;
    const pos = await this.redis.geopos(key, driverId);
    if (!pos || !pos[0]) return null;
    const [lng, lat] = pos[0] as [string, string];
    return { latitude: parseFloat(lat), longitude: parseFloat(lng) };
  }

  async addBlacklistedToken(token: string, expSeconds: number) {
  await this.redis.set(`blacklist:${token}`, "true", "EX", expSeconds);
}

  public async checkBlacklistedToken(token: string) {
    const isBlacklisted = await this.redis.exists(`blacklist:${token}`);
    return !!isBlacklisted;
  }

  public async removeBlacklistedToken(token: string) {
  const result = await this.redis.del(`blacklist:${token}`);
  return result > 0;
}
}
