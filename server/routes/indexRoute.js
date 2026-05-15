import express from 'express';
import rateLimit from 'express-rate-limit';
const router = express.Router();

import { requireAuth } from '../middleware/auth.js';
import { login, logout, getMe, healthCheck } from '../controllers/indexController.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { status: 'error', message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
router.get('/health', healthCheck);

// Auth routes
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
