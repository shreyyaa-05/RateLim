import { incrementStats } from '../services/dashboardService.js';

/**
 * Middleware that tracks request statistics globally.
 * Intercepts request counts and response status codes (allowed vs blocked)
 * without modifying any rate-limiting logic.
 */
export const statsTracker = (req, res, next) => {
  // Exclude healthcheck routes from stats metrics to avoid noise
  if (req.originalUrl && req.originalUrl.includes('/health')) {
    return next();
  }

  // Increment total request counter
  incrementStats('totalRequests');

  // Monitor response end event
  res.on('finish', () => {
    // Authenticated vs Anonymous statistics
    if (req.user) {
      incrementStats('authenticatedRequests');
    } else {
      incrementStats('anonymousRequests');
    }

    // Blocked vs Allowed statistics
    if (res.statusCode === 429) {
      incrementStats('blockedRequests');
    } else if (res.statusCode >= 200 && res.statusCode < 400) {
      incrementStats('allowedRequests');
    }
  });

  next();
};
