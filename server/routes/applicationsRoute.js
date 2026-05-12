import express from 'express';
const router = express.Router();

import { isAuthorized, requireAuth } from '../middleware/auth.js';
import {
  getStudentApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  addApplicationFollowup,
  initializeApplicationStages,
  updateApplicationStage,
} from '../controllers/applicationsController.js';

router.use(requireAuth);

// Get all applications for a student
router.get('/students/:studentId/applications', isAuthorized('students', 'read'), getStudentApplications);

// Create new application for a student
router.post('/students/:studentId/applications', isAuthorized('students', 'update'), createApplication);

// Get single application
router.get('/:id', isAuthorized('students', 'read'), getApplication);

// Update application
router.patch('/:id', isAuthorized('students', 'update'), updateApplication);

// Delete application
router.delete('/:id', isAuthorized('students', 'delete'), deleteApplication);

// Add follow-up to application
router.post('/:id/followup', isAuthorized('students', 'update'), addApplicationFollowup);

// Initialize stages for application (for existing applications)
router.post('/:id/initialize-stages', isAuthorized('students', 'update'), initializeApplicationStages);

// Update application stage
router.patch('/:id/stage', isAuthorized('students', 'update'), updateApplicationStage);

export default router;
