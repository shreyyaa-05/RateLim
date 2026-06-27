import * as dashboardService from '../services/dashboardService.js';

/**
 * GET /api/dashboard/stats
 * Retrieves current dashboard metrics and statuses.
 */
export const getStats = (req, res, next) => {
  try {
    const stats = dashboardService.getDashboardStats();
    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
