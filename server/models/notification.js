import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const notificationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    targetUser: {
      type: Types.ObjectId,
      ref: 'User',
      index: true,
    },
    isBroadcast: {
      type: Boolean,
      default: false,
    },
    link: String,
    metadata: {
      studentId: {
        type: Types.ObjectId,
        ref: 'Student',
      },
      applicationId: {
        type: Types.ObjectId,
        ref: 'Application',
      },
      followupDate: Date,
    },
    scheduleTime: Date,
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ targetUser: 1, createdAt: -1 });
notificationSchema.index({ isBroadcast: 1, createdAt: -1 });

export default model('Notification', notificationSchema);
