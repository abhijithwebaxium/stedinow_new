import Partner from '../models/Partner.js';
import Student from '../models/Student.js';

// @desc    Get all partners
// @route   GET /api/partners
// @access  Private (Admin)
export const getAllPartners = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = { deleted: false };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search by company name, contact person, or email
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPersonName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { partnerId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const partners = await Partner.find(query)
      .populate('assignedManager', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Partner.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        partners,
        pagination: {
          results: partners.length,
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single partner
// @route   GET /api/partners/:id
// @access  Private (Admin)
export const getPartner = async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.id)
      .populate('assignedManager', 'name email phone')
      .populate('createdBy', 'name')
      .populate('history.actionDoneBy', 'name');

    if (!partner) {
      const error = new Error('Partner not found');
      error.statusCode = 404;
      throw error;
    }

    // Get partner's students count
    const studentsCount = await Student.countDocuments({
      'leadSource.partner': partner._id,
      deleted: false,
    });

    res.status(200).json({
      status: 'success',
      partner: {
        ...partner.toObject(),
        studentsCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new partner
// @route   POST /api/partners
// @access  Private (Admin)
export const createPartner = async (req, res, next) => {
  try {
    const {
      companyName,
      contactPersonName,
      email,
      phone,
      phoneCode,
      password,
      address,
      businessType,
      website,
      gstNumber,
      panNumber,
      commissionRate,
      commissionType,
      assignedManager,
      notes,
      status,
    } = req.body;

    // Check if partner with email already exists
    const existingPartner = await Partner.findOne({ email, deleted: false });
    if (existingPartner) {
      const error = new Error('Partner with this email already exists');
      error.statusCode = 400;
      throw error;
    }

    // Create partner
    const partner = await Partner.create({
      companyName,
      contactPersonName,
      email,
      phone,
      phoneCode: phoneCode || '+91',
      password,
      address,
      businessType,
      website,
      gstNumber,
      panNumber,
      commissionRate,
      commissionType,
      assignedManager,
      notes,
      status: status || 'Active',
      createdBy: req.user.userId,
    });

    // Add to history
    partner.addHistory('Partner Created', 'Partner account created by admin', req.user.userId);
    await partner.save();

    // Return partner without password
    const partnerData = await Partner.findById(partner._id)
      .populate('assignedManager', 'name email')
      .populate('createdBy', 'name');

    res.status(201).json({
      status: 'success',
      message: 'Partner created successfully',
      partner: partnerData,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update partner
// @route   PATCH /api/partners/:id
// @access  Private (Admin)
export const updatePartner = async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      const error = new Error('Partner not found');
      error.statusCode = 404;
      throw error;
    }

    const {
      companyName,
      contactPersonName,
      phone,
      phoneCode,
      alternativePhone,
      alternativePhoneCode,
      address,
      businessType,
      website,
      gstNumber,
      panNumber,
      registrationNumber,
      establishedYear,
      commissionRate,
      commissionType,
      paymentTerms,
      bankDetails,
      status,
      verificationStatus,
      assignedManager,
      notes,
      internalNotes,
      tags,
    } = req.body;

    // Update fields
    if (companyName) partner.companyName = companyName;
    if (contactPersonName) partner.contactPersonName = contactPersonName;
    if (phone) partner.phone = phone;
    if (phoneCode) partner.phoneCode = phoneCode;
    if (alternativePhone !== undefined) partner.alternativePhone = alternativePhone;
    if (alternativePhoneCode !== undefined) partner.alternativePhoneCode = alternativePhoneCode;
    if (address) partner.address = { ...partner.address, ...address };
    if (businessType) partner.businessType = businessType;
    if (website !== undefined) partner.website = website;
    if (gstNumber !== undefined) partner.gstNumber = gstNumber;
    if (panNumber !== undefined) partner.panNumber = panNumber;
    if (registrationNumber !== undefined) partner.registrationNumber = registrationNumber;
    if (establishedYear !== undefined) partner.establishedYear = establishedYear;
    if (commissionRate !== undefined) partner.commissionRate = commissionRate;
    if (commissionType) partner.commissionType = commissionType;
    if (paymentTerms !== undefined) partner.paymentTerms = paymentTerms;
    if (bankDetails) partner.bankDetails = { ...partner.bankDetails, ...bankDetails };
    if (notes !== undefined) partner.notes = notes;
    if (internalNotes !== undefined) partner.internalNotes = internalNotes;
    if (tags !== undefined) partner.tags = tags;

    // Handle status change
    if (status && status !== partner.status) {
      const oldStatus = partner.status;
      partner.status = status;
      partner.addHistory(
        'Status Changed',
        `Status changed from ${oldStatus} to ${status}`,
        req.user.userId
      );
    }

    // Handle verification status change
    if (verificationStatus && verificationStatus !== partner.verificationStatus) {
      partner.verificationStatus = verificationStatus;
      if (verificationStatus === 'Verified') {
        partner.verifiedBy = req.user.userId;
        partner.verifiedAt = new Date();
      }
      partner.addHistory(
        'Verification Status Changed',
        `Verification status changed to ${verificationStatus}`,
        req.user.userId
      );
    }

    // Handle assigned manager change
    if (assignedManager && assignedManager !== partner.assignedManager?.toString()) {
      partner.assignedManager = assignedManager;
      partner.assignedManagerDate = new Date();
      partner.addHistory('Manager Assigned', 'Partner manager assigned/changed', req.user.userId);
    }

    await partner.save();

    const updatedPartner = await Partner.findById(partner._id)
      .populate('assignedManager', 'name email')
      .populate('createdBy', 'name');

    res.status(200).json({
      status: 'success',
      message: 'Partner updated successfully',
      partner: updatedPartner,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete partner (soft delete)
// @route   DELETE /api/partners/:id
// @access  Private (Admin)
export const deletePartner = async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      const error = new Error('Partner not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if partner has active students
    const activeStudents = await Student.countDocuments({
      'leadSource.partner': partner._id,
      deleted: false,
      currentStatus: { $nin: ['File Closed', 'Drop - Not Interested'] },
    });

    if (activeStudents > 0) {
      const error = new Error(
        `Cannot delete partner. ${activeStudents} active students are associated with this partner.`
      );
      error.statusCode = 400;
      throw error;
    }

    partner.deleted = true;
    partner.deletedAt = new Date();
    partner.deletedBy = req.user.userId;
    partner.status = 'Inactive';
    partner.addHistory('Partner Deleted', 'Partner account deleted by admin', req.user.userId);

    await partner.save();

    res.status(200).json({
      status: 'success',
      message: 'Partner deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Suspend/Activate partner
// @route   PATCH /api/partners/:id/status
// @access  Private (Admin)
export const updatePartnerStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    if (!['Active', 'Suspended', 'Inactive'].includes(status)) {
      const error = new Error('Invalid status. Must be Active, Suspended, or Inactive');
      error.statusCode = 400;
      throw error;
    }

    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      const error = new Error('Partner not found');
      error.statusCode = 404;
      throw error;
    }

    const oldStatus = partner.status;
    partner.status = status;

    partner.addHistory(
      'Status Updated',
      `Status changed from ${oldStatus} to ${status}. Reason: ${reason || 'Not specified'}`,
      req.user.userId
    );

    await partner.save();

    res.status(200).json({
      status: 'success',
      message: `Partner ${status.toLowerCase()} successfully`,
      partner,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset partner password
// @route   PATCH /api/partners/:id/reset-password
// @access  Private (Admin)
export const resetPartnerPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    const partner = await Partner.findById(req.params.id).select('+password');

    if (!partner) {
      const error = new Error('Partner not found');
      error.statusCode = 404;
      throw error;
    }

    partner.password = newPassword;
    partner.passwordChangedAt = Date.now();
    partner.addHistory('Password Reset', 'Password reset by admin', req.user.userId);

    await partner.save();

    res.status(200).json({
      status: 'success',
      message: 'Partner password reset successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get partner statistics
// @route   GET /api/partners/:id/stats
// @access  Private (Admin)
export const getPartnerStats = async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      const error = new Error('Partner not found');
      error.statusCode = 404;
      throw error;
    }

    // Get students by phase
    const students = await Student.find({
      'leadSource.partner': partner._id,
      deleted: false,
    });

    const stats = {
      totalStudents: students.length,
      byPhase: {},
      byStatus: {},
      converted: students.filter((s) => s.currentStatus === 'Converted').length,
      active: students.filter(
        (s) => !['File Closed', 'Drop - Not Interested', 'Disqualified'].includes(s.currentStatus)
      ).length,
    };

    // Count by phase
    students.forEach((student) => {
      const phase = student.currentPhase;
      stats.byPhase[phase] = (stats.byPhase[phase] || 0) + 1;

      const status = student.currentStatus;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get partner's students
// @route   GET /api/partners/:id/students
// @access  Private (Admin)
export const getPartnerStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, phase, stage, status } = req.query;

    const query = {
      'leadSource.partner': req.params.id,
      deleted: false,
    };

    if (phase) query.currentPhase = phase;
    if (stage) query.currentStage = stage;
    if (status) query.currentStatus = status;

    const skip = (page - 1) * limit;

    const students = await Student.find(query)
      .populate('assigned.counselor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        students,
        pagination: {
          results: students.length,
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  getAllPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
  updatePartnerStatus,
  resetPartnerPassword,
  getPartnerStats,
  getPartnerStudents,
};
