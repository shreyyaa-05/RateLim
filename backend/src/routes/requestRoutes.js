import express from 'express';
import { getRequests } from '../controllers/requestController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/requests
router.get('/', requireAuth, getRequests);

export default router;
