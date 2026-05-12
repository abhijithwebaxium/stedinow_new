import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const chatMessageSchema = new Schema(
  {
    conversationId: {
      type: Types.ObjectId,
      ref: 'ChatConversation',
      required: true,
      index: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    query: String,
    response: Schema.Types.Mixed,
    metadata: {
      processingTime: Number,
      queryType: String,
      confidence: Number,
      classification: String,
      dataCount: Number,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });

export default model('ChatMessage', chatMessageSchema);
