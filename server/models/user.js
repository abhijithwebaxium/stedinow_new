import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      minlength: 7,
      trim: true,
    },
    phoneCode: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Prefer Not To Say', 'Not Defined'],
      default: 'Not Defined',
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    role: {
      type: Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    // Performance tracking (optional - for counselors)
    targets: [
      {
        month: {
          type: Date,
          required: true,
        },
        conversionTarget: {
          type: Number,
          required: true,
        },
        achieved: {
          type: Number,
          default: 0,
        },
      },
    ],
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive', 'Suspended', 'Pending'],
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    history: [
      {
        type: {
          type: String,
          trim: true,
          required: true,
        },
        date: {
          type: Date,
          required: true,
          default: Date.now,
        },
        notes: {
          type: String,
          trim: true,
          required: true,
        },
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

// Indexes
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });

export default model('User', UserSchema);
