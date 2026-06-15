import rateLimit from 'express-rate-limit';
import { redis } from '../config/redis';
import { env } from '../config/env';

/**
 * Rate limiter store باستخدام Redis
 */
class RedisStore {
  private prefix = 'rl:';

  async increment(key: string): Promise<{ totalHits: number; resetTime: Date | undefined }> {
    const redisKey = this.prefix + key;
    const hits = await redis.incr(redisKey);

    // أول request → نحدد expiry
    if (hits === 1) {
      await redis.expire(redisKey, env.RATE_LIMIT_WINDOW_MS / 1000);
    }

    const ttl = await redis.ttl(redisKey);
    const resetTime = ttl > 0 ? new Date(Date.now() + ttl * 1000) : undefined;

    return { totalHits: hits, resetTime };
  }

  async decrement(key: string): Promise<void> {
    const redisKey = this.prefix + key;
    await redis.decr(redisKey);
  }

  async resetKey(key: string): Promise<void> {
    const redisKey = this.prefix + key;
    await redis.del(redisKey);
  }
}

/**
 * Rate limiter عام — 100 requests / 15 دقيقة
 */
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore() as any,
});

/**
 * Rate limiter للـ Auth endpoints — 10 requests / 15 دقيقة
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 10,
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  store: new RedisStore() as any,
});

/**
 * Rate limiter للـ Conference registration — 5 requests / ساعة
 */
export const conferenceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة
  max: 5,
  message: 'Too many registration attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore() as any,
});

/**
 * Rate limiter للـ Search — 30 requests / دقيقة
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة
  max: 30,
  message: 'Too many search requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore() as any,
});
