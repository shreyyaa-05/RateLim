import { redisClient } from '../config/redis.js';

/**
 * Fixed Window Counter rate-limiting strategy.
 * 
 * @param {string} ip Client IP address
 * @param {Object} options Strategy configuration options
 * @param {number} options.maxRequests Maximum requests allowed in the window
 * @param {number} options.windowInSeconds Window duration in seconds
 * @returns {Promise<Object>} Rate limiting decision and metadata
 */
export const fixedWindowStrategy = async (ip, options) => {
  const limit = options.maxRequests;
  const windowDuration = options.windowInSeconds;
  const key = `rate_limit:fixed:${ip}`;

  // Gracefully fail-open if Redis client is not connected
  if (!redisClient.isOpen || !redisClient.isReady) {
    console.warn(`[Rate Limiter] Redis connection is down. Bypassing rate limiting for IP: ${ip}`);
    return {
      isAllowed: true,
      limit,
      remaining: limit,
      retryAfter: 0
    };
  }

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
  const isAllowed = count <= limit;
  const retryAfter = ttl > 0 ? ttl : windowDuration;

  return {
    isAllowed,
    limit,
    remaining,
    retryAfter
  };
};
