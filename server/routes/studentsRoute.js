import express from 'express';
const router = express.Router();

import { isAuthorized, requireAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  addFollowup,
  getStudentDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
  verifyDocument,
  rejectDocument,
  getFrozenStudents,
  getLockedStudents,
  freezeStudent,
  unfreezeStudent,
  lockStudent,
  unlockStudent,
  getChecklistProgress,
  updateChecklistItem,
  getStudentMessages,
  replyToStudent,
  getAllRecentChats,
  markMessagesAsRead,
  getStudentTasks,
  assignTask,
  deleteStudentTask,
  sendStudentNotification,
  resetStudentPassword,
  bulkUpdateStudents,
} from '../controllers/studentsController.js';

import {
  getStudentPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  processRefund,
  getPaymentSummary,
} from '../controllers/paymentsController.js';

router.use(requireAuth);

// Messaging operations
router.get('/messages/all', isAuthorized('students', 'read'), getAllRecentChats);
router.get('/:id/messages', isAuthorized('students', 'read'), getStudentMessages);
router.patch('/:id/messages/read', isAuthorized('students', 'update'), markMessagesAsRead);
router.post('/:id/messages', isAuthorized('students', 'update'), replyToStudent);

// Bulk operations
router.patch('/bulk', isAuthorized('students', 'update'), bulkUpdateStudents);

// List all students (excluding frozen and locked)
router.get('/', isAuthorized('students', 'read'), getAllStudents);

// Get frozen students list
router.get('/frozen', isAuthorized('students', 'read'), getFrozenStudents);

// Get locked students list (admin only)
router.get('/locked', isAuthorized('students', 'read'), getLockedStudents);

// Get details of a specific student
router.get('/:id', isAuthorized('students', 'read'), getStudent);

// Create a new student
router.post('/', isAuthorized('students', 'create'), createStudent);

// Update a specific student
router.patch('/:id', isAuthorized('students', 'update'), updateStudent);

// Update student phase/stage/status
router.patch('/:id/status', isAuthorized('students', 'updateStatus'), updateStudentStatus);

// Add followup to student
router.post('/:id/followup', isAuthorized('students', 'followup'), addFollowup);

// Get student documents
router.get('/:id/documents', isAuthorized('students', 'read'), getStudentDocuments);

// Upload student document
router.post('/:id/documents', isAuthorized('students', 'update'), upload.single('document'), uploadDocument);

// Download student document
router.get('/:id/documents/:documentId/download', isAuthorized('students', 'read'), downloadDocument);

// Verify / reject document
router.patch('/:id/documents/:documentId/verify', isAuthorized('students', 'update'), verifyDocument);
router.patch('/:id/documents/:documentId/reject', isAuthorized('students', 'update'), rejectDocument);

// Delete student document
router.delete('/:id/documents/:documentId', isAuthorized('students', 'update'), deleteDocument);

// Delete a specific student (soft delete)
router.delete('/:id', isAuthorized('students', 'delete'), deleteStudent);

// Freeze/unfreeze student
router.post('/:id/freeze', isAuthorized('students', 'update'), freezeStudent);
router.post('/:id/unfreeze', isAuthorized('students', 'update'), unfreezeStudent);

// Lock/unlock student (admin only)
router.post('/:id/lock', isAuthorized('students', 'update'), lockStudent);
router.post('/:id/unlock', isAuthorized('students', 'update'), unlockStudent);

// Checklist operations
router.get('/:id/checklist', isAuthorized('students', 'read'), getChecklistProgress);
router.patch('/:id/checklist', isAuthorized('students', 'update'), updateChecklistItem);
router.patch('/:id/checklist/schedule', isAuthorized('students', 'update'), updateChecklistItem);
 

// Task management (admin assigns tasks to students)
router.get('/:id/tasks', isAuthorized('students', 'read'), getStudentTasks);
router.post('/:id/tasks', isAuthorized('students', 'update'), assignTask);
router.delete('/:id/tasks/:taskId', isAuthorized('students', 'update'), deleteStudentTask);

// Send manual notification to student
router.post('/:id/notify', isAuthorized('students', 'update'), sendStudentNotification);

// Reset student password (admin only)
router.post('/:id/reset-password', isAuthorized('students', 'update'), resetStudentPassword);

// Payment operations
router.get('/:id/payments', isAuthorized('students', 'read'), getStudentPayments);
router.get('/:id/payments/summary', isAuthorized('students', 'read'), getPaymentSummary);
router.get('/:id/payments/:paymentId', isAuthorized('students', 'read'), getPayment);
router.post('/:id/payments', isAuthorized('students', 'update'), createPayment);
router.patch('/:id/payments/:paymentId', isAuthorized('students', 'update'), updatePayment);
router.delete('/:id/payments/:paymentId', isAuthorized('students', 'delete'), deletePayment);
router.post('/:id/payments/:paymentId/refund', isAuthorized('students', 'update'), processRefund);

export default router;
