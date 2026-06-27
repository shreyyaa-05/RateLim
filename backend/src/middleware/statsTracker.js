import { incrementStats } from '../services/dashboardService.js';
import { addRequestLog } from '../services/requestService.js';
import { trackRequest } from '../services/analyticsService.js';

/**
 * Middleware that tracks request statistics globally.
 * Intercepts request counts and response status codes (allowed vs blocked)
 * without modifying any rate-limiting logic.
 */
export const statsTracker = (req, res, next) => {
  const start = Date.now();
  
  // Exclude healthcheck routes from stats metrics to avoid noise
  const isHealth = req.originalUrl && req.originalUrl.includes('/health');

  if (!isHealth) {
    // Increment total request counter
    incrementStats('totalRequests');
  }

  // Monitor response end event
  res.on('finish', () => {
    const isAllowed = res.statusCode >= 200 && res.statusCode < 400;
    const isBlocked = res.statusCode === 429;

    if (!isHealth) {
      // Authenticated vs Anonymous statistics
      if (req.user) {
        incrementStats('authenticatedRequests');
      } else {
        incrementStats('anonymousRequests');
      }

      // Blocked vs Allowed statistics
      if (isBlocked) {
        incrementStats('blockedRequests');
      } else if (isAllowed) {
        incrementStats('allowedRequests');
      }

      // Track request in analytics service
      trackRequest(isAllowed, isBlocked);
    }

    // Capture latency and log request for monitoring
    const latency = Date.now() - start;
    const client = req.user?.id || req.ip || 'unknown';

    addRequestLog({
      method: req.method,
      endpoint: req.originalUrl || req.url,
      status: res.statusCode,
      latency,
      client,
      timestamp: new Date().toISOString(),
    });
  });

  next();
};
