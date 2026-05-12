import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    university: {
      type: Types.ObjectId,
      ref: 'University',
      required: true,
      index: true,
    },
    level: {
      type: String,
      required: true,
      enum: ['Undergraduate', 'Postgraduate', 'Diploma', 'Certificate', 'PhD'],
    },
    duration: String,
    tuitionFee: {
      amount: Number,
      currency: String,
    },
    applicationFee: {
      amount: Number,
      currency: String,
    },
    intakes: [String], // e.g., ["Fall", "Spring", "Summer"]
    requirements: {
      minimumGPA: Number,
      ielts: Number,
      toefl: Number,
      pte: Number,
      gre: Boolean,
      gmat: Boolean,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

courseSchema.index({ university: 1, level: 1 });

export default model('Course', courseSchema);
