import { redisClient } from '../config/redis.js';

/**
 * Sliding Window Counter rate-limiting strategy.
 * Combines counters from the current and previous windows to estimate request rate.
 * 
 * @param {string} ip Client IP address
 * @param {Object} options Strategy configuration options
 * @param {number} options.maxRequests Maximum requests allowed in the window
 * @param {number} options.windowInSeconds Window duration in seconds
 * @returns {Promise<Object>} Rate limiting decision and metadata
 */
export const slidingWindowCounterStrategy = async (ip, options) => {
  const limit = options.maxRequests;
  const windowDuration = options.windowInSeconds;
  const now = Date.now();
  const windowDurationMs = windowDuration * 1000;

  // Gracefully fail-open if Redis client is not connected
  if (!redisClient.isOpen || !redisClient.isReady) {
    console.warn(`[Rate Limiter] Redis connection is down. Bypassing rate limiting for IP: ${ip}`);
    return {
      isAllowed: true,
      limit,
      remaining: limit,
      retryAfter: 0,
      reset: Math.ceil(now / 1000)
    };
  }

  const currentWindowStart = Math.floor(now / windowDurationMs) * windowDurationMs;
  const previousWindowStart = currentWindowStart - windowDurationMs;

  const currentKey = `rate_limit:sliding_counter:${ip}:${currentWindowStart}`;
  const previousKey = `rate_limit:sliding_counter:${ip}:${previousWindowStart}`;

  try {
    // Retrieve counts for current and previous windows
    const currentVal = await redisClient.get(currentKey);
    const previousVal = await redisClient.get(previousKey);

    const currentCount = currentVal ? parseInt(currentVal, 10) : 0;
    const previousCount = previousVal ? parseInt(previousVal, 10) : 0;

    const elapsedTime = now - currentWindowStart;
    const weight = 1 - (elapsedTime / windowDurationMs);
    const estimatedCount = currentCount + (previousCount * weight);

    const isAllowed = estimatedCount + 1 <= limit;
    let remaining = 0;
    let retryAfter = 0;

    if (isAllowed) {
      const newCount = await redisClient.incr(currentKey);
      if (newCount === 1) {
        await redisClient.expire(currentKey, windowDuration * 2);
      }
      remaining = Math.max(0, limit - Math.floor(estimatedCount + 1));
    } else {
      remaining = Math.max(0, limit - Math.floor(estimatedCount));
      const timeToNextWindow = Math.ceil((windowDurationMs - elapsedTime) / 1000);
      if (currentCount >= limit) {
        retryAfter = Math.max(1, timeToNextWindow);
      } else if (previousCount > 0) {
        const neededWeight = (limit - currentCount) / previousCount;
        const neededElapsed = (1 - neededWeight) * windowDurationMs;
        const waitTimeMs = neededElapsed - elapsedTime;
        retryAfter = Math.max(1, Math.ceil(waitTimeMs / 1000));
        if (retryAfter > windowDuration) {
          retryAfter = Math.max(1, timeToNextWindow);
        }
      } else {
        retryAfter = Math.max(1, timeToNextWindow);
      }
    }

    const reset = Math.ceil((currentWindowStart + windowDurationMs) / 1000);

    return {
      isAllowed,
      limit,
      remaining,
      retryAfter,
      reset
    };
  } catch (error) {
    // Fail-open: let the middleware catch this error and fail-open
    throw error;
  }
};
