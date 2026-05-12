import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const chatConversationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

chatConversationSchema.index({ userId: 1, isActive: 1, lastMessageAt: -1 });

export default model('ChatConversation', chatConversationSchema);
