import express from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = express.Router();

// GET /health
router.get('/', getHealth);

export default router;
