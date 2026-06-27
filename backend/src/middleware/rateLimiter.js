import { getStrategy } from '../strategies/index.js';
import { getPolicyForEndpoint } from '../services/policyService.js';

/**
 * Extensible rate-limiting middleware factory.
 * Resolves the selected rate-limiting strategy (e.g., 'fixed-window')
 * dynamically at runtime based on the requested endpoint policy cache.
 */
export const fixedWindowRateLimiter = (options = {}) => {
  return async (req, res, next) => {
    // Normalize path by stripping trailing slash
    let endpoint = req.baseUrl + req.path;
    if (endpoint.length > 1 && endpoint.endsWith('/')) {
      endpoint = endpoint.slice(0, -1);
    }

    // Retrieve active policy for this endpoint from cache
    const policy = getPolicyForEndpoint(endpoint);

    // If policy is explicitly disabled, bypass rate limiting
    if (!policy.enabled) {
      return next();
    }

    const strategyName = policy.algorithm || 'fixed-window';
    const limit = policy.maxRequests;
    const windowDuration = policy.windowInSeconds;

    const identifier = req.user?.id || req.ip || 'unknown';

    try {
      // Resolve strategy function at runtime
      const strategy = getStrategy(strategyName);
      const result = await strategy(identifier, { maxRequests: limit, windowInSeconds: windowDuration });

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
      console.error(`[Rate Limiter] Strategy "${strategyName}" failed for client ${identifier}:`, error.message);
      next();
    }
  };
};
