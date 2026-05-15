import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const studentTaskSchema = new Schema(
  {
    student: { type: Types.ObjectId, ref: 'Student', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ['profile', 'document', 'application', 'visa', 'deadline', 'general'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    dueDate: Date,
    completedAt: Date,
    createdBy: { type: String, enum: ['counselor', 'system'], default: 'counselor' },
  },
  { timestamps: true }
);

studentTaskSchema.index({ student: 1, status: 1 });

export default model('StudentTask', studentTaskSchema);
