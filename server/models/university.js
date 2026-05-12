import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const universitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    country: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
      index: true,
    },
    city: String,
    state: String,
    website: String,
    ranking: {
      world: Number,
      country: Number,
    },
    type: {
      type: String,
      enum: ['Public', 'Private'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  { timestamps: true }
);

universitySchema.index({ name: 1, country: 1 });

export default model('University', universitySchema);
