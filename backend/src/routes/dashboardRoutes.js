import express from 'express';
import { getStats } from '../controllers/dashboardController.js';

const router = express.Router();

// Middleware to secure Dashboard endpoints: requires users to be authenticated via JWT
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Unauthorized access. Authentication is required.',
    });
  }
  next();
};

// GET /api/dashboard/stats
router.get('/stats', requireAuth, getStats);

export default router;
