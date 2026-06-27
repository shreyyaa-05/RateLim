import * as analyticsService from '../services/analyticsService.js';

/**
 * GET /api/analytics
 * Retrieves sliding-window traffic analytics data.
 */
export const getAnalyticsData = (req, res, next) => {
  try {
    const data = analyticsService.getAnalytics();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
