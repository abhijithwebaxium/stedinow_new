import mongoose, { mongo } from 'mongoose';

const { Schema, model, Types } = mongoose;

const StaffSchema = new Schema(
  {
    firstName: {
      type: String,
    //   required: true,
    },
    middleName: {
      type: String,
    //   required: true,
    },
    lastName: {
      type: String,
    //   required: true,
    },
    designation: {
      type: String,
    //   required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
    //   required: true,
    },
    phone: {
      type: String,
    //   required: true,
      unique: [true, 'This Contact Number Is Already In Use'],
    //   minlength: 7,
      trim: true,
    },
    phoneCode: {
      type: String,
    //   required: true,
      trim: true,
    },
    email: {
      type: String,
    //   required: true,
      unique: [true, 'This Email Is Already In Use'],
    },
    password: {
      type: String,
    //   required: true,
    },
    // role: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Role',
    //   required: true,
    // },
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive', 'Suspended', 'Pending'],
      index: true,
      required: true,
    },
  },
  { timestamps: true }
);

export default model('Staff', StaffSchema);
