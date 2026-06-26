import { redisClient } from '../config/redis.js';

/**
 * Fixed Window Counter rate-limiting middleware.
 * Uses Redis to store atomic counters with TTL expiration per IP.
 */
export const fixedWindowRateLimiter = async (req, res, next) => {
  const limit = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;
  const windowDuration = parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60; // in seconds

  const ip = req.ip || 'unknown';
  const key = `rate_limit:fixed:${ip}`;

  // Gracefully fail-open if Redis client is not connected
  if (!redisClient.isOpen || !redisClient.isReady) {
    console.warn(`[Rate Limiter] Redis connection is down. Bypassing rate limiting for IP: ${ip}`);
    return next();
  }

  try {
    const count = await redisClient.incr(key);
    let ttl = await redisClient.ttl(key);

    if (count === 1) {
      await redisClient.expire(key, windowDuration);
      ttl = windowDuration;
    } else if (ttl === -1) {
      // Safeguard: If the key somehow exists without a TTL, associate one
      await redisClient.expire(key, windowDuration);
      ttl = windowDuration;
    }

    const remaining = Math.max(0, limit - count);

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (count > limit) {
      const retryAfter = ttl > 0 ? ttl : windowDuration;
      res.setHeader('Retry-After', retryAfter);
      
      return res.status(429).json({
        status: 'error',
        statusCode: 429,
        message: 'Too Many Requests',
        retryAfter,
      });
    }

    next();
  } catch (error) {
    // Fail-open: log Redis errors and allow request to proceed
    console.error(`[Rate Limiter] Redis operation failed for IP ${ip}:`, error.message);
    next();
  }
};
