import User from '../models/user.js';
import Partner from '../models/Partner.js';
import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token; // Get the token from cookies

    if (!token) {
      req.user = { isAuthenticated: false };
      return next(); // Proceed without authentication
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded?.id;

    const user = await User.findById(userId).populate({ path: 'role' });

    if (!user) {
      req.user = { isAuthenticated: false };
      return next();
    }

    if (user.status !== 'Active') throw new Error('The user has been suspended');

    if (!user.role.active) throw new Error('The role has been suspended');

    req.user = {
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      isAuthenticated: true,
    };

    next();
  } catch (error) {
    req.user = { isAuthenticated: false };
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    if (req.user && req.user.isAuthenticated) {
      return next();
    }

    console.log(`Unauthorized access attempt: ${req.originalUrl}`);
    const error = new Error('Authentication required.');
    error.statusCode = 401;
    throw error;
  } catch (err) {
    next(err); // Pass the error to the global error handler
  }
};

export const isAuthorized = (module, action) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.isAuthenticated) {
        const error = new Error('Authentication required.');
        error.statusCode = 401;
        throw error;
      }

      const role = req.user.role;

      if (!role?.active || role?.permissions?.[module]?.[action] !== true) {
        const error = new Error('Forbidden: Insufficient permissions.');
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (err) {
      next(err); // Pass the error to the global error handler
    }
  };
};

// ========== PARTNER AUTHENTICATION MIDDLEWARE ==========

// Require partner authentication
export const requirePartnerAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.partner_access_token; // Get partner token from cookies

    if (!token) {
      req.partner = { isAuthenticated: false };
      return next(); // Proceed without authentication
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const partnerId = decoded?.id;

    const partner = await Partner.findById(partnerId);

    if (!partner) {
      req.partner = { isAuthenticated: false };
      return next();
    }

    // Check if partner is locked
    if (partner.isLocked) {
      throw new Error('Your account is temporarily locked due to too many failed login attempts. Please try again later.');
    }

    // Check if partner account is active
    if (partner.status !== 'Active') {
      throw new Error('Your account is not active. Please contact admin.');
    }

    // Check if partner is deleted
    if (partner.deleted) {
      throw new Error('Your account has been deactivated. Please contact admin.');
    }

    req.partner = {
      partnerId: partner._id,
      companyName: partner.companyName,
      contactPersonName: partner.contactPersonName,
      email: partner.email,
      allowedPhases: partner.allowedPhases,
      allowedStages: partner.allowedStages,
      canEditAfterStage2_1: partner.canEditAfterStage2_1,
      isAuthenticated: true,
    };

    next();
  } catch (error) {
    req.partner = { isAuthenticated: false };
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

// Check if partner is authenticated
export const isPartnerAuthenticated = async (req, res, next) => {
  try {
    if (req.partner && req.partner.isAuthenticated) {
      return next();
    }

    console.log(`Unauthorized partner access attempt: ${req.originalUrl}`);
    const error = new Error('Partner authentication required.');
    error.statusCode = 401;
    throw error;
  } catch (err) {
    next(err);
  }
};

// Check if partner can manage a student based on stage
export const canPartnerManageStudent = (req, res, next) => {
  try {
    if (!req.partner || !req.partner.isAuthenticated) {
      const error = new Error('Partner authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const student = req.student; // Student should be loaded by previous middleware

    if (!student) {
      const error = new Error('Student not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check if partner owns this student
    if (student.leadSource?.partner?.toString() !== req.partner.partnerId.toString()) {
      const error = new Error('You do not have access to this student.');
      error.statusCode = 403;
      throw error;
    }

    // Check if partner can access this stage
    if (!req.partner.allowedStages.includes(student.currentStage)) {
      const error = new Error('You do not have access to students in this stage.');
      error.statusCode = 403;
      throw error;
    }

    next();
  } catch (err) {
    next(err);
  }
};

// Check if partner can edit a student (restricted after Stage 2.1)
export const canPartnerEditStudent = (req, res, next) => {
  try {
    if (!req.partner || !req.partner.isAuthenticated) {
      const error = new Error('Partner authentication required.');
      error.statusCode = 401;
      throw error;
    }

    const student = req.student; // Student should be loaded by previous middleware

    if (!student) {
      const error = new Error('Student not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check if partner owns this student
    if (student.leadSource?.partner?.toString() !== req.partner.partnerId.toString()) {
      const error = new Error('You do not have access to this student.');
      error.statusCode = 403;
      throw error;
    }

    // Restricted stages (after Stage 2.1)
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

    // If student is in restricted stage and partner doesn't have special permission
    if (restrictedStages.includes(student.currentStage) && !req.partner.canEditAfterStage2_1) {
      const error = new Error(
        'You can only view this student. Editing is restricted after Stage 2.1 (Student Registration).'
      );
      error.statusCode = 403;
      throw error;
    }

    next();
  } catch (err) {
    next(err);
  }
};

// ========== STUDENT AUTHENTICATION MIDDLEWARE ==========

// Require student authentication
export const requireStudentAuth = async (req, res, next) => {
  try {
    // Accept cookie first; fall back to Authorization header for cross-domain set-password flow
    const authHeader = req.headers?.authorization;
    const token = req.cookies?.student_access_token ||
      (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (!token) {
      req.user = { isAuthenticated: false };
      return next();
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decoded.type !== 'student') {
       req.user = { isAuthenticated: false };
       return next();
    }

    const student = await Student.findById(decoded.id);

    if (!student || student.deleted) {
      req.user = { isAuthenticated: false };
      return next();
    }

    req.user = {
      id: student._id,
      name: student.name,
      email: student.email,
      type: 'student',
      isAuthenticated: true,
    };

    next();
  } catch (error) {
    req.user = { isAuthenticated: false };
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

// Check if student is authenticated
export const isStudentAuthenticated = async (req, res, next) => {
  try {
    if (req.user && req.user.isAuthenticated && req.user.type === 'student') {
      return next();
    }

    const error = new Error('Student authentication required.');
    error.statusCode = 401;
    throw error;
  } catch (err) {
    next(err);
  }
};
