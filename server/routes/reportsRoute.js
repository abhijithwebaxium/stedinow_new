import express from 'express';
import {
  getEODReport,
  getCounselorReport,
  getPhaseReport,
  getConversionReport,
  getApplicationReport,
  getVisaReport,
} from '../controllers/reportsController.js';
import { requireAuth, isAuthenticated, isAuthorized } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(requireAuth);
router.use(isAuthenticated);

// Report routes
router.get('/eod', isAuthorized('reports', 'read'), getEODReport);
router.get('/counselor', isAuthorized('reports', 'read'), getCounselorReport);
router.get('/phase', isAuthorized('reports', 'read'), getPhaseReport);
router.get('/conversion', isAuthorized('reports', 'read'), getConversionReport);
router.get('/application', isAuthorized('reports', 'read'), getApplicationReport);
router.get('/visa', isAuthorized('reports', 'read'), getVisaReport);

export default router;
