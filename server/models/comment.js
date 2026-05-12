import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    commentType: {
      type: String,
      enum: ['Student', 'Application', 'General'],
      required: true,
    },
    student: {
      type: Types.ObjectId,
      ref: 'Student',
      index: true,
    },
    application: {
      type: Types.ObjectId,
      ref: 'Application',
      index: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

commentSchema.index({ student: 1, createdAt: -1 });
commentSchema.index({ application: 1, createdAt: -1 });

export default model('Comment', commentSchema);
