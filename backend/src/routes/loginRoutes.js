import express from 'express';
import { fixedWindowRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /login
// Applying a stricter limit: 3 requests per 60 seconds
router.post('/', fixedWindowRateLimiter({ maxRequests: 3, windowInSeconds: 60 }), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Login route request successful.',
    timestamp: new Date().toISOString(),
  });
});

export default router;
