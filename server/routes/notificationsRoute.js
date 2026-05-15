import express from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notificationsController.js';
import { requireAuth, isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);
router.use(isAuthenticated);

router.get('/', getNotifications);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);

export default router;
