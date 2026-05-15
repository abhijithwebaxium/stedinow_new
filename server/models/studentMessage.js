import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const studentMessageSchema = new Schema(
  {
    student: {
      type: Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['student', 'counselor'],
      required: true,
    },
    senderName: { type: String, required: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

studentMessageSchema.index({ student: 1, createdAt: -1 });

export default model('StudentMessage', studentMessageSchema);
