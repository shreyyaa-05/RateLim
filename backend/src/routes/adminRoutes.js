import express from 'express';
import { getHealth, getStats, getConfig } from '../controllers/adminController.js';

const router = express.Router();

// Middleware to secure Admin endpoints: requires users to be authenticated via JWT
const requireAdminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Unauthorized access. Authentication is required.',
    });
  }
  next();
};

// All sub-routes require admin authentication
router.use(requireAdminAuth);

// GET /admin/health
router.get('/health', getHealth);

// GET /admin/stats
router.get('/stats', getStats);

// GET /admin/config
router.get('/config', getConfig);

export default router;
