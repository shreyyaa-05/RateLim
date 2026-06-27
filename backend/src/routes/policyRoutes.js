import express from 'express';
import { getPolicies, updatePolicy } from '../controllers/policyController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/policies
router.get('/', requireAuth, getPolicies);

// PUT /api/policies/:id
router.put('/:id', requireAuth, updatePolicy);

export default router;
