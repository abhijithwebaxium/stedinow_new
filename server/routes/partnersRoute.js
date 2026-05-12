import express from 'express';
const router = express.Router();

import {
  getAllPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
  updatePartnerStatus,
  resetPartnerPassword,
  getPartnerStats,
  getPartnerStudents,
} from '../controllers/partnersController.js';

import { requireAuth, isAuthenticated, isAuthorized } from '../middleware/auth.js';

// Apply authentication middleware to all routes
router.use(requireAuth);
router.use(isAuthenticated);

// Admin routes for partner management
router.get('/', isAuthorized('users', 'read'), getAllPartners);
router.post('/', isAuthorized('users', 'create'), createPartner);
router.get('/:id', isAuthorized('users', 'read'), getPartner);
router.patch('/:id', isAuthorized('users', 'update'), updatePartner);
router.delete('/:id', isAuthorized('users', 'delete'), deletePartner);

// Status management
router.patch('/:id/status', isAuthorized('users', 'update'), updatePartnerStatus);

// Password reset
router.patch('/:id/reset-password', isAuthorized('users', 'update'), resetPartnerPassword);

// Statistics and students
router.get('/:id/stats', isAuthorized('users', 'read'), getPartnerStats);
router.get('/:id/students', isAuthorized('users', 'read'), getPartnerStudents);

export default router;
