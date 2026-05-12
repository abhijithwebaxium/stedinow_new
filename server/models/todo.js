import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['Personal', 'Assigned'],
      default: 'Personal',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active',
      index: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    completedDate: Date,
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedTo: {
      type: Types.ObjectId,
      ref: 'User',
      index: true,
    },
    relatedStudent: {
      type: Types.ObjectId,
      ref: 'Student',
    },
    relatedApplication: {
      type: Types.ObjectId,
      ref: 'Application',
    },
  },
  { timestamps: true }
);

todoSchema.index({ status: 1, dueDate: 1 });
todoSchema.index({ assignedTo: 1, status: 1 });

export default model('Todo', todoSchema);
