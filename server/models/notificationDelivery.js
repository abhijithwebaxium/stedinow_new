import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const notificationDeliverySchema = new Schema(
  {
    notification: {
      type: Types.ObjectId,
      ref: 'Notification',
      required: true,
      index: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    deliveredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

notificationDeliverySchema.index({ user: 1, isRead: 1 });
notificationDeliverySchema.index({ notification: 1, user: 1 }, { unique: true });

export default model('NotificationDelivery', notificationDeliverySchema);
