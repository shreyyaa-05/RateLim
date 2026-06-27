import * as requestService from '../services/requestService.js';

/**
 * GET /api/requests
 * Retrieves recent request logs in descending order.
 */
export const getRequests = (req, res, next) => {
  try {
    const logs = requestService.getRequestLogs();
    return res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};
