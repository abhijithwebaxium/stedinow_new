import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const paymentSchema = new Schema(
  {
    student: {
      type: Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    paymentType: {
      type: String,
      required: true,
      enum: [
        'Registration Fee',
        'Courier Charges',
        'S.O.P Charge',
        'G.A.P Fee',
        'Delegate Fee',
        'Apostle Embassy Attestation Fee (Including 18% GST)',
        'Visa Processing Fee (Including 18% GST)',
      ],
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque', 'Bank Transfer', 'Other'],
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Partially Paid', 'Refunded', 'Failed', 'Cancelled'],
      default: 'Pending',
      required: true,
      index: true,
    },
    transactionId: String,
    paymentDate: Date,
    dueDate: Date,
    paidBy: String, // Name of the person who made payment
    receivedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    relatedApplication: {
      type: Types.ObjectId,
      ref: 'Application',
    },
    invoiceNumber: String,
    receiptNumber: String,
    notes: String,
    refund: {
      isRefunded: Boolean,
      refundAmount: Number,
      refundDate: Date,
      refundReason: String,
      refundedBy: {
        type: Types.ObjectId,
        ref: 'User',
      },
    },
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

paymentSchema.index({ student: 1, paymentStatus: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ dueDate: 1 });

export default model('Payment', paymentSchema);
