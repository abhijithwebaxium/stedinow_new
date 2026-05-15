import express from 'express';
import rateLimit from 'express-rate-limit';
const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'error', message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

import {
  partnerLogin,
  partnerLogout,
  getPartnerProfile,
  updatePartnerProfile,
  changePartnerPassword,
  getPartnerDashboard,
  getPartnerStudents,
  getPartnerStudent,
  createPartnerStudent,
  updatePartnerStudent,
} from '../controllers/partnerAuthController.js';

import { requirePartnerAuth, isPartnerAuthenticated } from '../middleware/auth.js';

// ========== PUBLIC ROUTES ==========
router.post('/login', loginLimiter, partnerLogin);

// ========== PROTECTED ROUTES (Apply middleware to all routes below) ==========
router.use(requirePartnerAuth);
router.use(isPartnerAuthenticated);

// Authentication
router.post('/logout', partnerLogout);

// Profile management
router.get('/me', getPartnerProfile);
router.patch('/me', updatePartnerProfile);
router.patch('/change-password', changePartnerPassword);

// Dashboard
router.get('/dashboard', getPartnerDashboard);

// Student management
router.get('/students', getPartnerStudents);
router.post('/students', createPartnerStudent);
router.get('/students/:id', getPartnerStudent);
router.patch('/students/:id', updatePartnerStudent);

export default router;
