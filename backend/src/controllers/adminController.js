import * as adminService from '../services/adminService.js';

/**
 * Expose system health and connections status.
 */
export const getHealth = (req, res, next) => {
  try {
    const health = adminService.getAdminHealth();
    res.status(200).json({
      status: 'success',
      data: health,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Expose aggregated server request statistics.
 */
export const getStats = (req, res, next) => {
  try {
    const stats = adminService.getAdminStats();
    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Expose application configuration defaults and strategies.
 */
export const getConfig = (req, res, next) => {
  try {
    const config = adminService.getAdminConfig();
    res.status(200).json({
      status: 'success',
      data: config,
    });
  } catch (error) {
    next(error);
  }
};
