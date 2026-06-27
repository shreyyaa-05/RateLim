import { getStrategy } from '../strategies/index.js';

/**
 * Extensible rate-limiting middleware factory.
 * Resolves the selected rate-limiting strategy (e.g., 'fixed-window')
 * and delegates the request check to it.
 * 
 * @param {Object} options Configuration options
 * @param {string} [options.strategy='fixed-window'] Rate-limiting strategy name
 * @param {number} options.maxRequests Maximum requests allowed in the window
 * @param {number} options.windowInSeconds Window duration in seconds
 */
export const fixedWindowRateLimiter = (options = {}) => {
  const strategyName = options.strategy || 'fixed-window';
  const limit = options.maxRequests ?? parseInt(process.env.RATE_LIMIT_MAX, 10);
  const windowDuration = options.windowInSeconds ?? parseInt(process.env.RATE_LIMIT_WINDOW, 10);

  if (limit === undefined || isNaN(limit)) {
    throw new Error('Rate limiter option "maxRequests" (or RATE_LIMIT_MAX environment variable) must be configured.');
  }
  if (windowDuration === undefined || isNaN(windowDuration)) {
    throw new Error('Rate limiter option "windowInSeconds" (or RATE_LIMIT_WINDOW environment variable) must be configured.');
  }

  // Resolve strategy function at creation time
  const strategy = getStrategy(strategyName);

  return async (req, res, next) => {
    const ip = req.ip || 'unknown';

    try {
      const result = await strategy(ip, { maxRequests: limit, windowInSeconds: windowDuration });

      // Set standard rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);

      if (!result.isAllowed) {
        res.setHeader('Retry-After', result.retryAfter);
        
        return res.status(429).json({
          status: 'error',
          statusCode: 429,
          message: 'Too Many Requests',
          retryAfter: result.retryAfter,
        });
      }

      next();
    } catch (error) {
      // Fail-open: log errors and allow request to proceed
      console.error(`[Rate Limiter] Strategy "${strategyName}" failed for IP ${ip}:`, error.message);
      next();
    }
  };
};
