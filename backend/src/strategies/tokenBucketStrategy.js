import { redisClient } from '../config/redis.js';

/**
 * Token Bucket rate-limiting strategy.
 * Uses a Redis Hash to store bucket state and refills tokens over time.
 * 
 * @param {string} ip Client IP address
 * @param {Object} options Strategy configuration options
 * @param {number} options.maxRequests Maximum requests allowed in the window (bucket capacity)
 * @param {number} options.windowInSeconds Window duration in seconds (refill interval)
 * @returns {Promise<Object>} Rate limiting decision and metadata
 */
export const tokenBucketStrategy = async (ip, options) => {
  const limit = options.maxRequests;
  const windowDuration = options.windowInSeconds;
  const now = Date.now();
  const key = `rate_limit:token_bucket:${ip}`;

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

  try {
    const data = await redisClient.hGetAll(key);
    
    let tokens;
    let lastRefillTime;
    let tokensToAdd = 0;

    if (!data || Object.keys(data).length === 0) {
      tokens = limit;
      lastRefillTime = now;
    } else {
      const rawTokens = parseFloat(data.tokens);
      const rawLastRefillTime = parseInt(data.lastRefillTime, 10);
      
      const elapsed = Math.max(0, now - rawLastRefillTime);
      const refillRate = limit / (windowDuration * 1000); // tokens per millisecond
      tokensToAdd = elapsed * refillRate;
      
      tokens = Math.min(limit, rawTokens + tokensToAdd);
      lastRefillTime = tokensToAdd > 0 ? now : rawLastRefillTime;
    }

    const isAllowed = tokens >= 1;
    let remaining = 0;
    let retryAfter = 0;

    if (isAllowed) {
      tokens = tokens - 1;
      await redisClient.hSet(key, {
        tokens: tokens.toString(),
        lastRefillTime: lastRefillTime.toString()
      });
      await redisClient.expire(key, windowDuration * 2);
      remaining = Math.max(0, Math.floor(tokens));
    } else {
      remaining = Math.max(0, Math.floor(tokens));
      if (tokensToAdd > 0) {
        await redisClient.hSet(key, {
          tokens: tokens.toString(),
          lastRefillTime: lastRefillTime.toString()
        });
        await redisClient.expire(key, windowDuration * 2);
      }
      
      const refillRateSeconds = limit / windowDuration; // tokens per second
      const waitTimeSeconds = (1 - tokens) / refillRateSeconds;
      retryAfter = Math.max(1, Math.ceil(waitTimeSeconds));
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
