import mongoose from 'mongoose';
import { ALL_DOCUMENT_TYPES } from '../config/constants.js';

const { Schema, model, Types } = mongoose;

const documentSchema = new Schema(
  {
    student: {
      type: Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: ALL_DOCUMENT_TYPES,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: Number, // in bytes
    mimeType: String,
    uploadedBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected', 'Expired'],
      default: 'Pending',
      index: true,
    },
    verifiedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    verifiedDate: Date,
    expiryDate: Date,
    notes: String,
    rejectionReason: String,
    relatedApplication: {
      type: Types.ObjectId,
      ref: 'Application',
    },
    isRequestedDocument: Boolean,
    requestedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    requestedDate: Date,
    tags: [String],
  },
  { timestamps: true }
);

documentSchema.index({ student: 1, documentType: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ uploadedDate: -1 });

export default model('Document', documentSchema);
