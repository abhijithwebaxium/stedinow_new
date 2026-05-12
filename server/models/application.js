import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const applicationSchema = new Schema(
  {
    student: {
      type: Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    applicationId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    university: {
      name: { type: String, required: true },
      country: { type: String, required: true },
      city: String,
      universityId: { type: Types.ObjectId, ref: 'University' },
    },
    course: {
      name: { type: String, required: true },
      level: {
        type: String,
        enum: ['Undergraduate', 'Postgraduate', 'Diploma', 'Certificate', 'PhD'],
      },
      duration: String,
      courseId: { type: Types.ObjectId, ref: 'Course' },
    },
    intake: {
      type: String,
      required: true, // e.g., "Fall 2025", "Spring 2026"
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'In Progress',
        'Submitted',
        'Under Review',
        'Conditional Offer',
        'Unconditional Offer',
        'Rejected',
        'Withdrawn',
        'Accepted',
        'Deferred',
      ],
      default: 'Draft',
      required: true,
      index: true,
    },
    currentStage: {
      type: String,
      enum: [
        'Document Collection',
        'Document Verification',
        'Application Submission',
        'Awaiting Response',
        'Conditional Offer Received',
        'Offer Letter Received',
        'Completed',
      ],
      default: 'Document Collection',
      required: true,
    },
    stages: [
      {
        name: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ['Pending', 'In Progress', 'Completed', 'Skipped'],
          default: 'Pending',
        },
        startDate: Date,
        completedDate: Date,
        notes: String,
        completedBy: {
          type: Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    applicationDate: Date,
    submissionDate: Date,
    decisionDate: Date,
    offerLetterReceived: Boolean,
    offerLetterDate: Date,
    offerType: {
      type: String,
      enum: ['Conditional', 'Unconditional'],
    },
    offerConditions: [String],
    tuitionFee: {
      amount: Number,
      currency: String,
    },
    applicationFee: {
      amount: Number,
      currency: String,
      paid: Boolean,
      paidDate: Date,
    },
    depositRequired: {
      amount: Number,
      currency: String,
      paid: Boolean,
      paidDate: Date,
    },
    handledBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    notes: String,
    documents: [
      {
        type: Types.ObjectId,
        ref: 'Document',
      },
    ],
    timeline: [
      {
        event: String,
        date: Date,
        notes: String,
        updatedBy: {
          type: Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    history: [
      {
        type: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
          default: Date.now,
        },
        notes: String,
        actionDoneBy: {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ status: 1, intake: 1 });

export default model('Application', applicationSchema);
