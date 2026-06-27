import express from 'express';
import { testRateLimit } from '../controllers/testController.js';
import { fixedWindowRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// GET /test
router.get('/', fixedWindowRateLimiter({ maxRequests: 5, windowInSeconds: 10 }), testRateLimit);

export default router;
