import { getStrategy } from '../strategies/index.js';
import { getPolicyForEndpoint } from '../services/policyService.js';

/**
 * Extensible rate-limiting middleware factory.
 * Resolves the selected rate-limiting strategy (e.g., 'fixed-window')
 * dynamically at runtime based on the requested endpoint policy cache,
 * fallback middleware options, or global defaults.
 */
export const fixedWindowRateLimiter = (options = {}) => {
  return async (req, res, next) => {
    // Normalize path by stripping trailing slash
    let endpoint = req.baseUrl + req.path;
    if (endpoint.length > 1 && endpoint.endsWith('/')) {
      endpoint = endpoint.slice(0, -1);
    }

    if (req.user?.role === 'Admin') {
      return next();
    }

    // Retrieve active policy for this endpoint from cache
    const policy = getPolicyForEndpoint(endpoint);
    const hasDbPolicy = !!policy;

    const roleDefaults = {
      Guest: { limit: 20, window: 60 },
      Student: { limit: 100, window: 60 },
      Premium: { limit: 1000, window: 60 }
    };

    let strategyName;
    let limit;
    let windowDuration;
    let enabled;

    if (hasDbPolicy) {
      strategyName = policy.algorithm;
      limit = policy.maxRequests;
      windowDuration = policy.windowInSeconds;
      enabled = policy.enabled;
    } else {
      strategyName = options.strategy || 'fixed-window';
      enabled = options.enabled ?? true;
      
      if (options.maxRequests !== undefined || options.windowInSeconds !== undefined) {
        limit = options.maxRequests ?? (parseInt(process.env.RATE_LIMIT_MAX, 10) || 100);
        windowDuration = options.windowInSeconds ?? (parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60);
      } else if (req.user) {
        const role = req.user.role || 'Guest';
        const roleConfig = roleDefaults[role] || roleDefaults.Guest;
        limit = roleConfig.limit;
        windowDuration = roleConfig.window;
      } else {
        limit = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;
        windowDuration = parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60;
      }
    }

    // If rate limiting is disabled for this endpoint, bypass
    if (!enabled) {
      return next();
    }

    const identifier = req.user?.id || req.ip || 'unknown';

    try {
      // Resolve strategy function at runtime
      const strategy = getStrategy(strategyName);
      const result = await strategy(identifier, { maxRequests: limit, windowInSeconds: windowDuration });

      const resetValue = result.reset ?? (Math.ceil(Date.now() / 1000) + (result.retryAfter || windowDuration));

      // Set standard rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', resetValue);

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
