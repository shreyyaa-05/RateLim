import express from 'express';
import { getAnalyticsData } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics
router.get('/', requireAuth, getAnalyticsData);

export default router;
