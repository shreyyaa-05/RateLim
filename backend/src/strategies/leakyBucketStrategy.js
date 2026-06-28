import { redisClient } from '../config/redis.js';

/**
 * Leaky Bucket rate-limiting strategy.
 * Uses a Redis Hash to store bucket state and leaks requests at a constant rate.
 * 
 * @param {string} ip Client IP address
 * @param {Object} options Strategy configuration options
 * @param {number} options.maxRequests Maximum requests allowed in the window (bucket capacity)
 * @param {number} options.windowInSeconds Window duration in seconds (leak duration)
 * @returns {Promise<Object>} Rate limiting decision and metadata
 */
export const leakyBucketStrategy = async (ip, options) => {
  const limit = options.maxRequests;
  const windowDuration = options.windowInSeconds;
  const now = Date.now();
  const key = `rate_limit:leaky_bucket:${ip}`;

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

  try {
    const data = await redisClient.hGetAll(key);
    
    let waterLevel;
    let lastLeakTime;
    let leaked = 0;

    if (!data || Object.keys(data).length === 0) {
      waterLevel = 0;
      lastLeakTime = now;
    } else {
      const rawWaterLevel = parseFloat(data.waterLevel);
      const rawLastLeakTime = parseInt(data.lastLeakTime, 10);
      
      const elapsed = Math.max(0, now - rawLastLeakTime);
      const leakRate = limit / (windowDuration * 1000); // units per millisecond
      leaked = elapsed * leakRate;
      
      waterLevel = Math.max(0, rawWaterLevel - leaked);
      lastLeakTime = now;
    }

    const isAllowed = waterLevel + 1 <= limit;
    let remaining = 0;
    let retryAfter = 0;

    if (isAllowed) {
      waterLevel = waterLevel + 1;
      await redisClient.hSet(key, {
        waterLevel: waterLevel.toString(),
        lastLeakTime: lastLeakTime.toString()
      });
      await redisClient.expire(key, windowDuration * 2);
      remaining = Math.max(0, Math.floor(limit - waterLevel));
    } else {
      remaining = 0;
      // If water leaked, save the new level and timestamp to Redis
      if (leaked > 0) {
        await redisClient.hSet(key, {
          waterLevel: waterLevel.toString(),
          lastLeakTime: lastLeakTime.toString()
        });
        await redisClient.expire(key, windowDuration * 2);
      }
      
      const leakRateSeconds = limit / windowDuration; // units per second
      const toLeak = waterLevel + 1 - limit;
      const waitTimeSeconds = toLeak / leakRateSeconds;
      retryAfter = Math.max(1, Math.ceil(waitTimeSeconds));
    }

    const leakRateSeconds = limit / windowDuration; // units per second
    const timeToEmpty = waterLevel / leakRateSeconds;
    const reset = Math.ceil(now / 1000 + timeToEmpty);

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
