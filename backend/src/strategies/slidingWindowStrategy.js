import { redisClient } from '../config/redis.js';

/**
 * Sliding Window Log rate-limiting strategy.
 * Uses Redis Sorted Sets (ZSET) to store and prune unique request timestamps.
 * 
 * @param {string} ip Client IP address
 * @param {Object} options Strategy configuration options
 * @param {number} options.maxRequests Maximum requests allowed in the window
 * @param {number} options.windowInSeconds Window duration in seconds
 * @returns {Promise<Object>} Rate limiting decision and metadata
 */
export const slidingWindowStrategy = async (ip, options) => {
  const limit = options.maxRequests;
  const windowDuration = options.windowInSeconds;
  const key = `rate_limit:sliding:${ip}`;

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

  const now = Date.now();
  const minTime = now - windowDuration * 1000;

  try {
    // Run Redis operations atomically in a transaction chain
    const results = await redisClient.multi()
      .zRemRangeByScore(key, '-inf', minTime)
      .zAdd(key, { score: now, value: `${now}-${Math.random()}` })
      .zCard(key)
      .expire(key, windowDuration)
      .exec();

    // results[2] represents the cardinality of the set after inserting the new request
    const count = results[2];
    const remaining = Math.max(0, limit - count);
    const isAllowed = count <= limit;

    let retryAfter = 0;
    if (!isAllowed) {
      // Find the oldest request timestamp in the window to calculate retryAfter
      const oldestMembers = await redisClient.zRange(key, 0, 0);
      if (oldestMembers && oldestMembers.length > 0) {
        const oldestTimestamp = parseFloat(oldestMembers[0].split('-')[0]);
        const nextAllowedTime = oldestTimestamp + windowDuration * 1000;
        retryAfter = Math.max(1, Math.ceil((nextAllowedTime - now) / 1000));
      } else {
        retryAfter = windowDuration;
      }
    }

    return {
      isAllowed,
      limit,
      remaining,
      retryAfter
    };
  } catch (error) {
    // Fail-open: let the middleware catch this error and fail-open
    throw error;
  }
};
