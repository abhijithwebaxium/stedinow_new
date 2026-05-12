import Payment from '../models/payment.js';
import Student from '../models/student.js';
import { isValidObjectId } from '../helper/indexHelper.js';
import { sendPaymentConfirmation } from '../utils/whatsappService.js';
import { sendPaymentConfirmationEmail } from '../utils/emailService.js';

// Get all payments for a student
export const getStudentPayments = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Student.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    const payments = await Payment.find({ student: id })
      .populate('receivedBy', 'name email')
      .populate('relatedApplication')
      .sort({ paymentDate: -1 });

    res.status(200).json({ status: 'success', payments });
  } catch (err) {
    next(err);
  }
};

// Get single payment
export const getPayment = async (req, res, next) => {
  try {
    const { id, paymentId } = req.params;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');
    if (!isValidObjectId(paymentId)) throw new Error('Invalid payment ID');

    const payment = await Payment.findOne({ _id: paymentId, student: id })
      .populate('receivedBy', 'name email')
      .populate('relatedApplication');

    if (!payment) throw new Error('Payment not found');

    res.status(200).json({ status: 'success', payment });
  } catch (err) {
    next(err);
  }
};

// Create payment
export const createPayment = async (req, res, next) => {
  try {
    const {
      params: { id },
      body,
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Student.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    // Generate invoice number
    const count = await Payment.countDocuments({ student: id });
    const invoiceNumber = `INV-${student.studentId}-${String(count + 1).padStart(4, '0')}`;

    // Create payment
    const payment = await Payment.create({
      student: id,
      paymentType: body.paymentType,
      amount: body.amount,
      currency: body.currency || 'INR',
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus || 'Paid',
      paymentDate: body.paymentDate || new Date(),
      dueDate: body.dueDate,
      paidBy: body.paidBy || student.name,
      receivedBy: userId,
      transactionId: body.transactionId,
      invoiceNumber: invoiceNumber,
      receiptNumber: invoiceNumber, // Same as invoice for now
      notes: body.notes,
      relatedApplication: body.relatedApplication,
      discount: body.discount || 0,
      course: body.course,
      history: [
        {
          type: 'Payment Created',
          date: new Date(),
          notes: `Payment of ${body.amount} ${body.currency || 'INR'} created`,
          actionDoneBy: userId,
        },
      ],
    });

    // Add payment reference to student
    student.payments.push(payment._id);

    // Update student payment status
    const totalPaid = await Payment.aggregate([
      { $match: { student: student._id, paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const paidAmount = totalPaid[0]?.total || 0;

    // Update administrative payment status
    if (!student.administrativeStatus) {
      student.administrativeStatus = {};
    }

    if (paidAmount === 0) {
      student.administrativeStatus.paymentStatus = 'Not Started';
    } else if (paidAmount < 50000) {
      // Adjust threshold as needed
      student.administrativeStatus.paymentStatus = 'Partial';
    } else {
      student.administrativeStatus.paymentStatus = 'Complete';
    }

    // Add to student history
    student.history.push({
      type: 'Payment Added',
      date: new Date(),
      notes: `Payment of ${body.amount} ${body.currency || 'INR'} for ${body.paymentType} added`,
      actionDoneBy: userId,
    });

    await student.save();

    // Populate receivedBy before returning
    await payment.populate('receivedBy', 'name email');

    // Send WhatsApp payment confirmation
    try {
      await sendPaymentConfirmation(
        {
          name: student.name,
          phone: student.phone,
        },
        payment
      );
      console.log(`WhatsApp payment confirmation sent to ${student.name}`);
    } catch (whatsappError) {
      // Don't fail the request if WhatsApp fails
      console.error('WhatsApp payment confirmation failed:', whatsappError);
    }

    // Send Email payment confirmation
    try {
      await sendPaymentConfirmationEmail(
        {
          name: student.name,
          email: student.email,
        },
        payment
      );
      console.log(`Email payment confirmation sent to ${student.email}`);
    } catch (emailError) {
      // Don't fail the request if Email fails
      console.error('Email payment confirmation failed:', emailError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Payment created successfully',
      payment,
    });
  } catch (err) {
    next(err);
  }
};

// Update payment
export const updatePayment = async (req, res, next) => {
  try {
    const {
      params: { id, paymentId },
      body,
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');
    if (!isValidObjectId(paymentId)) throw new Error('Invalid payment ID');

    const payment = await Payment.findOne({ _id: paymentId, student: id });
    if (!payment) throw new Error('Payment not found');

    // Update fields
    const allowedUpdates = [
      'paymentType',
      'amount',
      'currency',
      'paymentMethod',
      'paymentStatus',
      'paymentDate',
      'dueDate',
      'paidBy',
      'transactionId',
      'notes',
    ];

    allowedUpdates.forEach((field) => {
      if (body[field] !== undefined) {
        payment[field] = body[field];
      }
    });

    // Add history entry
    payment.history.push({
      type: 'Payment Updated',
      date: new Date(),
      notes: body.notes || 'Payment information updated',
      actionDoneBy: userId,
    });

    await payment.save();

    res.status(200).json({
      status: 'success',
      message: 'Payment updated successfully',
      payment,
    });
  } catch (err) {
    next(err);
  }
};

// Delete payment
export const deletePayment = async (req, res, next) => {
  try {
    const {
      params: { id, paymentId },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');
    if (!isValidObjectId(paymentId)) throw new Error('Invalid payment ID');

    const payment = await Payment.findOne({ _id: paymentId, student: id });
    if (!payment) throw new Error('Payment not found');

    // Delete payment
    await Payment.deleteOne({ _id: paymentId });

    // Remove payment reference from student
    const student = await Student.findOne({ _id: id, deleted: false });
    if (student) {
      student.payments = student.payments.filter(
        (p) => p.toString() !== paymentId.toString()
      );

      // Add to student history
      student.history.push({
        type: 'Payment Deleted',
        date: new Date(),
        notes: `Payment of ${payment.amount} ${payment.currency} for ${payment.paymentType} deleted`,
        actionDoneBy: userId,
      });

      await student.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Process refund
export const processRefund = async (req, res, next) => {
  try {
    const {
      params: { id, paymentId },
      body: { refundAmount, refundReason, refundDate },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');
    if (!isValidObjectId(paymentId)) throw new Error('Invalid payment ID');

    const payment = await Payment.findOne({ _id: paymentId, student: id });
    if (!payment) throw new Error('Payment not found');

    if (payment.refund?.isRefunded) {
      throw new Error('Payment has already been refunded');
    }

    // Update refund details
    payment.refund = {
      isRefunded: true,
      refundAmount: refundAmount || payment.amount,
      refundDate: refundDate || new Date(),
      refundReason,
      refundedBy: userId,
    };

    payment.paymentStatus = 'Refunded';

    // Add history entry
    payment.history.push({
      type: 'Refund Processed',
      date: new Date(),
      notes: `Refund of ${refundAmount || payment.amount} ${payment.currency} processed. Reason: ${refundReason}`,
      actionDoneBy: userId,
    });

    await payment.save();

    res.status(200).json({
      status: 'success',
      message: 'Refund processed successfully',
      payment,
    });
  } catch (err) {
    next(err);
  }
};

// Get payment summary for a student
export const getPaymentSummary = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Student.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    // Get all payments
    const payments = await Payment.find({ student: id });

    // Calculate totals
    const totalPaid = payments
      .filter((p) => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalPending = payments
      .filter((p) => p.paymentStatus === 'Pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalRefunded = payments
      .filter((p) => p.paymentStatus === 'Refunded')
      .reduce((sum, p) => sum + (p.refund?.refundAmount || 0), 0);

    // Payment breakdown by type
    const breakdownByType = {};
    payments.forEach((payment) => {
      if (!breakdownByType[payment.paymentType]) {
        breakdownByType[payment.paymentType] = {
          count: 0,
          total: 0,
        };
      }
      breakdownByType[payment.paymentType].count += 1;
      breakdownByType[payment.paymentType].total += payment.amount || 0;
    });

    const summary = {
      totalPayments: payments.length,
      totalPaid,
      totalPending,
      totalRefunded,
      currency: payments[0]?.currency || 'INR',
      breakdownByType,
      lastPaymentDate: payments[0]?.paymentDate,
    };

    res.status(200).json({
      status: 'success',
      summary,
    });
  } catch (err) {
    next(err);
  }
};
