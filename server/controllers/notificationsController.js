import Notification from '../models/notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const notifications = await Notification.find({
      $or: [
        { targetUser: userId },
        { isBroadcast: true }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.status(200).json({ status: 'success', notifications });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const { userId } = req.user;
    await Notification.updateMany(
      { 
        $or: [
          { targetUser: userId },
          { isBroadcast: true }
        ],
        read: false 
      },
      { read: true }
    );
    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};
