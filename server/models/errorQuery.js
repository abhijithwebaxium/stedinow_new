import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const errorQuerySchema = new Schema(
  {
    query: {
      type: String,
      required: true,
    },
    errorMessage: {
      type: String,
      required: true,
    },
    errorType: {
      type: String,
      required: true,
      enum: [
        'ContextResolutionError',
        'DatabaseError',
        'GeminiAPIError',
        'JSONParseError',
        'TimeoutError',
        'ValidationError',
        'UnknownError',
      ],
      index: true,
    },
    statusCode: Number,
    processingTime: Number,
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    context: {
      collection: String,
      filter: Schema.Types.Mixed,
      fields: [String],
      limit: Number,
      sort: Schema.Types.Mixed,
    },
    stackTrace: String,
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: Date,
    resolvedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    notes: String,
  },
  { timestamps: true }
);

errorQuerySchema.index({ errorType: 1, createdAt: -1 });
errorQuerySchema.index({ resolved: 1, createdAt: -1 });

export default model('ErrorQuery', errorQuerySchema);
