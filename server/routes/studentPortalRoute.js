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
  studentLogin, changePassword,
  getStudentMe, updateStudentProfile,
  getStudentDocuments, uploadStudentDocument, deleteStudentDocument,
  scanStudentDocument,
  getStudentApplications,
  getNotifications, markNotificationsRead,
  getMessages, sendMessage, markMessagesAsRead, getUnreadMessageCount,
  getVisaStatus,
  getTasks, completeTask,
  getChatHistory, studentChat, studentChatUpload,
  getDiscoveryUniversities, toggleShortlist,
} from '../controllers/studentPortalController.js';
import { requireStudentAuth, isStudentAuthenticated } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import multer from 'multer';

// Memory storage for scan — buffer needed for Gemini inline data
const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const auth = [requireStudentAuth, isStudentAuthenticated];

router.post('/login', loginLimiter, studentLogin);
router.post('/change-password', ...auth, changePassword);

router.get('/me', ...auth, getStudentMe);
router.patch('/profile', ...auth, updateStudentProfile);

router.get('/documents', ...auth, getStudentDocuments);
router.post('/documents/scan', ...auth, memUpload.single('document'), scanStudentDocument);
router.post('/documents', ...auth, upload.single('document'), uploadStudentDocument);
router.delete('/documents/:documentId', ...auth, deleteStudentDocument);

router.get('/applications', ...auth, getStudentApplications);

router.get('/notifications', ...auth, getNotifications);
router.patch('/notifications/read', ...auth, markNotificationsRead);

router.get('/messages', ...auth, getMessages);
router.get('/messages/unread-count', ...auth, getUnreadMessageCount);
router.patch('/messages/read', ...auth, markMessagesAsRead);
router.post('/messages', ...auth, sendMessage);

router.get('/visa-status', ...auth, getVisaStatus);

router.get('/tasks', ...auth, getTasks);
router.patch('/tasks/:taskId/complete', ...auth, completeTask);

router.get('/chat/history', ...auth, getChatHistory);
router.post('/chat', ...auth, studentChat);
router.post('/chat/upload', ...auth, upload.single('document'), studentChatUpload);

router.get('/discovery/universities', ...auth, getDiscoveryUniversities);
router.post('/discovery/shortlist/:universityId', ...auth, toggleShortlist);

export default router;
