import Partner from '../models/Partner.js';
import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';

// ========== HELPER FUNCTIONS ==========

// Generate JWT token
const generateToken = (partnerId) => {
  return jwt.sign({ id: partnerId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '7d', // Partner tokens valid for 7 days
  });
};

// Set token cookie
const setTokenCookie = (res, token) => {
  res.cookie('partner_access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ========== AUTHENTICATION ENDPOINTS ==========

// @desc    Partner login
// @route   POST /api/partner-portal/login
// @access  Public
export const partnerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      const error = new Error('Please provide email and password');
      error.statusCode = 400;
      throw error;
    }

    // Find partner and include password field
    const partner = await Partner.findOne({ email }).select('+password');

    if (!partner) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Check if account is locked
    if (partner.isLocked) {
      const error = new Error(
        'Your account is temporarily locked due to too many failed login attempts. Please try again later.'
      );
      error.statusCode = 423; // Locked
      throw error;
    }

    // Check if account is active
    if (partner.status !== 'Active') {
      const error = new Error(
        `Your account is ${partner.status.toLowerCase()}. Please contact admin for assistance.`
      );
      error.statusCode = 403;
      throw error;
    }

    // Check if account is deleted
    if (partner.deleted) {
      const error = new Error('Your account has been deactivated. Please contact admin.');
      error.statusCode = 403;
      throw error;
    }

    // Verify password
    const isPasswordCorrect = await partner.comparePassword(password);

    if (!isPasswordCorrect) {
      // Increment login attempts
      await partner.incLoginAttempts();

      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Reset login attempts on successful login
    await partner.resetLoginAttempts();

    // Update last login IP
    const loginIP = req.ip || req.connection.remoteAddress;
    partner.lastLoginIP = loginIP;
    await partner.save();

    // Generate token
    const token = generateToken(partner._id);

    // Set cookie
    setTokenCookie(res, token);

    // Add login to history
    partner.addHistory('Login', `Partner logged in from IP: ${loginIP}`, partner._id);
    await partner.save();

    // Send response (exclude password)
    const partnerData = await Partner.findById(partner._id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        partner: partnerData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Partner logout
// @route   POST /api/partner-portal/logout
// @access  Private (Partner)
export const partnerLogout = async (req, res, next) => {
  try {
    // Clear cookie
    res.clearCookie('partner_access_token');

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current partner profile
// @route   GET /api/partner-portal/me
// @access  Private (Partner)
export const getPartnerProfile = async (req, res, next) => {
  try {
    const partner = await Partner.findById(req.partner.partnerId);

    if (!partner) {
      const error = new Error('Partner not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: {
        partner,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update partner profile (limited fields)
// @route   PATCH /api/partner-portal/me
// @access  Private (Partner)
export const updatePartnerProfile = async (req, res, next) => {
  try {
    const partnerId = req.partner.partnerId;

    // Fields that partner can update themselves
    const allowedFields = [
      'contactPersonName',
      'phone',
      'phoneCode',
      'alternativePhone',
      'alternativePhoneCode',
      'address',
      'website',
      'bankDetails',
    ];

    // Filter request body to only allowed fields
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const partner = await Partner.findByIdAndUpdate(partnerId, updates, {
      new: true,
      runValidators: true,
    });

    if (!partner) {
      const error = new Error('Partner not found');
      error.statusCode = 404;
      throw error;
    }

    // Add to history
    partner.addHistory('Profile Updated', 'Partner updated their profile', partnerId);
    await partner.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        partner,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change partner password
// @route   PATCH /api/partner-portal/change-password
// @access  Private (Partner)
export const changePartnerPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      const error = new Error('Please provide all password fields');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword !== confirmPassword) {
      const error = new Error('New passwords do not match');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 8) {
      const error = new Error('Password must be at least 8 characters long');
      error.statusCode = 400;
      throw error;
    }

    // Get partner with password
    const partner = await Partner.findById(req.partner.partnerId).select('+password');

    if (!partner) {
      const error = new Error('Partner not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify current password
    const isPasswordCorrect = await partner.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 401;
      throw error;
    }

    // Update password
    partner.password = newPassword;
    await partner.save();

    // Add to history
    partner.addHistory('Password Changed', 'Partner changed their password', partner._id);
    await partner.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ========== DASHBOARD ENDPOINTS ==========

// @desc    Get partner dashboard statistics
// @route   GET /api/partner-portal/dashboard
// @access  Private (Partner)
export const getPartnerDashboard = async (req, res, next) => {
  try {
    const partnerId = req.partner.partnerId;

    // Get partner details
    const partner = await Partner.findById(partnerId);

    if (!partner) {
      const error = new Error('Partner not found');
      error.statusCode = 404;
      throw error;
    }

    // Get all students registered by this partner
    const students = await Student.find({
      'leadSource.partner': partnerId,
      deleted: false,
    });

    // Calculate statistics
    const totalStudents = students.length;
    const activeStudents = students.filter(
      (s) => s.currentStatus !== 'Drop' && s.currentStatus !== 'File Closed'
    ).length;

    // Count by current stage
    const stageStats = {};
    partner.allowedStages.forEach((stage) => {
      stageStats[stage] = students.filter((s) => s.currentStage === stage).length;
    });

    // Count by status
    const statusStats = {};
    students.forEach((student) => {
      statusStats[student.currentStatus] = (statusStats[student.currentStatus] || 0) + 1;
    });

    // Recent students (last 10)
    const recentStudents = students
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((s) => ({
        _id: s._id,
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        phone: s.phone,
        currentStage: s.currentStage,
        currentStatus: s.currentStatus,
        createdAt: s.createdAt,
      }));

    // Performance metrics
    const metrics = {
      totalStudents,
      activeStudents,
      convertedStudents: partner.convertedStudents,
      conversionRate: partner.conversionRate,
      totalCommissionEarned: partner.totalCommissionEarned,
      rating: partner.rating,
    };

    res.status(200).json({
      status: 'success',
      data: {
        partner: {
          partnerId: partner.partnerId,
          companyName: partner.companyName,
          contactPersonName: partner.contactPersonName,
          email: partner.email,
          allowedPhases: partner.allowedPhases,
          allowedStages: partner.allowedStages,
        },
        metrics,
        stageStats,
        statusStats,
        recentStudents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get partner's students with filters
// @route   GET /api/partner-portal/students
// @access  Private (Partner)
export const getPartnerStudents = async (req, res, next) => {
  try {
    const partnerId = req.partner.partnerId;
    const { stage, status, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {
      'leadSource.partner': partnerId,
      deleted: false,
    };

    // Filter by stage (only allowed stages)
    if (stage && req.partner.allowedStages.includes(stage)) {
      query.currentStage = stage;
    }

    // Filter by status
    if (status) {
      query.currentStatus = status;
    }

    // Search by name, email, phone, studentId
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
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
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalStudents: total,
          studentsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student details
// @route   GET /api/partner-portal/students/:id
// @access  Private (Partner)
export const getPartnerStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.partnerId;

    const student = await Student.findById(id).populate('assigned.counselor', 'name email');

    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if partner owns this student
    if (student.leadSource?.partner?.toString() !== partnerId.toString()) {
      const error = new Error('You do not have access to this student');
      error.statusCode = 403;
      throw error;
    }

    // Check if partner can access this stage
    if (!req.partner.allowedStages.includes(student.currentStage)) {
      const error = new Error('You do not have access to students in this stage');
      error.statusCode = 403;
      throw error;
    }

    res.status(200).json({
      status: 'success',
      data: {
        student,
        canEdit: req.partner.canEditAfterStage2_1 || !isRestrictedStage(student.currentStage),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to check if stage is restricted
const isRestrictedStage = (stage) => {
  const restrictedStages = [
    'Application Submission',
    'Offer Management',
    'Financial Arrangements',
    'Visa Processing',
    'Pre-Departure Readiness',
    'Arrival & Initial Setup',
    'Academic Integration',
    'File Completion',
  ];
  return restrictedStages.includes(stage);
};

// @desc    Create new student (partner registration)
// @route   POST /api/partner-portal/students
// @access  Private (Partner)
export const createPartnerStudent = async (req, res, next) => {
  try {
    const partnerId = req.partner.partnerId;
    const partner = await Partner.findById(partnerId);

    if (!partner) {
      const error = new Error('Partner not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate required fields
    const { name, email, phone, phoneCode } = req.body;

    if (!name || !email || !phone) {
      const error = new Error('Please provide name, email, and phone number');
      error.statusCode = 400;
      throw error;
    }

    // Check if student with this email already exists
    const existingStudent = await Student.findOne({ email, deleted: false });

    if (existingStudent) {
      const error = new Error('A student with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // Generate student ID
    const lastStudent = await Student.findOne({}, { studentId: 1 })
      .sort({ createdAt: -1 })
      .lean();

    let nextNumber = 1;
    if (lastStudent && lastStudent.studentId) {
      const match = lastStudent.studentId.match(/STU(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const studentId = `STU${String(nextNumber).padStart(3, '0')}`;

    // Prepare personal info if provided
    const personalInfo = {};
    if (req.body.dob) personalInfo.dob = req.body.dob;
    if (req.body.gender) personalInfo.gender = req.body.gender;
    if (req.body.nationality) personalInfo.nationality = req.body.nationality;
    if (req.body.passportNumber) personalInfo.passportNumber = req.body.passportNumber;

    // Prepare preferences if provided
    const preferences = {};
    if (req.body.interestedCountry) preferences.targetCountries = [req.body.interestedCountry];
    if (req.body.interestedCourse) preferences.preferredCourses = [req.body.interestedCourse];

    // Create student with partner as lead source
    // Use partner's associated admin/counselor as createdBy, or use partnerId
    const studentData = {
      studentId,
      name,
      email,
      phone,
      phoneCode: phoneCode || '+91',
      personalInfo,
      preferences,
      leadSource: {
        source: 'Partner',
        partner: partnerId,
        referredBy: partner.companyName,
        submittedDate: new Date(),
      },
      currentPhase: 'Lead Acquisition',
      currentStage: 'Lead Capture & Qualification',
      currentStatus: 'New Inquiry', // Must match enum in Student model
      createdBy: partner.assignedCounselor || partnerId, // Use assigned counselor or partnerId
    };

    const student = await Student.create(studentData);

    // Add to student history
    student.history.push({
      type: 'Student Created',
      date: new Date(),
      notes: `Student registered by partner: ${partner.companyName}`,
      actionDoneBy: partner.assignedCounselor || partnerId,
    });
    await student.save();

    // Update partner metrics
    await partner.updateMetrics();

    // Add to partner history
    partner.addHistory(
      'Student Added',
      `New student registered: ${student.name} (${student.studentId})`,
      partnerId
    );
    await partner.save();

    res.status(201).json({
      status: 'success',
      message: 'Student created successfully',
      data: {
        student,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student (restricted fields for partners)
// @route   PATCH /api/partner-portal/students/:id
// @access  Private (Partner)
export const updatePartnerStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.partnerId;

    const student = await Student.findById(id);

    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if partner owns this student
    if (student.leadSource?.partner?.toString() !== partnerId.toString()) {
      const error = new Error('You do not have access to this student');
      error.statusCode = 403;
      throw error;
    }

    // Check if partner can edit this student (based on stage)
    if (isRestrictedStage(student.currentStage) && !req.partner.canEditAfterStage2_1) {
      const error = new Error(
        'You can only view this student. Editing is restricted after Stage 2.1 (Student Registration).'
      );
      error.statusCode = 403;
      throw error;
    }

    // Fields that partners can update
    const allowedFields = [
      'name',
      'email',
      'phone',
      'phoneCode',
      'alternativePhone',
      'alternativePhoneCode',
      'personalInfo',
      'academics',
    ];

    // Filter updates to only allowed fields
    const updates = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Student updated successfully',
      data: {
        student: updatedStudent,
      },
    });
  } catch (error) {
    next(error);
  }
};
