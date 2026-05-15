import Notification from '../models/notification.js';
import Student from '../models/Student.js';
import { getIO } from './socket.js';

/**
 * Send a notification to a student (embedded in Student model)
 */
export const notifyStudent = async (studentId, { type, title, message, data = {} }) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) return null;

    const notification = {
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
      data,
    };

    student.notifications.push(notification);
    await student.save();

    // Emit real-time socket event
    try {
      getIO().to(studentId.toString()).emit('new_notification', notification);
    } catch (e) {
      console.error('[NotificationHelper] Socket emit failed:', e.message);
    }

    return notification;
  } catch (err) {
    console.error('[NotificationHelper] Error notifying student:', err.message);
    return null;
  }
};

/**
 * Send a notification to an admin/counselor (Notification collection)
 */
export const notifyAdmin = async (targetUserId, { type, title, message, studentId = null, link = null }) => {
  try {
    const notification = await Notification.create({
      targetUser: targetUserId,
      type,
      title,
      message,
      link,
      metadata: {
        studentId,
      },
      createdBy: targetUserId, // Self-created or system-created (using targetUser as fallback)
    });

    // Emit real-time socket event
    try {
      getIO().to('admin_room').emit('new_admin_notification', notification);
    } catch (e) {
      console.error('[NotificationHelper] Socket emit failed:', e.message);
    }

    return notification;
  } catch (err) {
    console.error('[NotificationHelper] Error notifying admin:', err.message);
    return null;
  }
};

/**
 * Broadcast a notification to all admins
 */
export const broadcastAdmin = async ({ type, title, message, studentId = null, link = null, createdBy }) => {
  try {
    const notification = await Notification.create({
      isBroadcast: true,
      type,
      title,
      message,
      link,
      metadata: {
        studentId,
      },
      createdBy,
    });

    // Emit real-time socket event
    try {
      getIO().to('admin_room').emit('new_admin_notification', notification);
    } catch (e) {
      console.error('[NotificationHelper] Socket emit failed:', e.message);
    }

    return notification;
  } catch (err) {
    console.error('[NotificationHelper] Error broadcasting admin:', err.message);
    return null;
  }
};
