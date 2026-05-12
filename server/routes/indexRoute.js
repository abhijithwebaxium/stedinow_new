import express from 'express';
const router = express.Router();

import { requireAuth } from '../middleware/auth.js';
import { login, logout, getMe, healthCheck } from '../controllers/indexController.js';

// Health check
router.get('/health', healthCheck);

// Auth routes
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
