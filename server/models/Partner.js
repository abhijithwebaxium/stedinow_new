import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model, Types } = mongoose;

const partnerSchema = new Schema(
  {
    // ========== UNIQUE IDENTIFIER ==========
    partnerId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },

    // ========== BASIC INFORMATION ==========
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    contactPersonName: {
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
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    phoneCode: {
      type: String,
      default: '+91',
      trim: true,
    },
    alternativePhone: String,
    alternativePhoneCode: String,

    // ========== AUTHENTICATION ==========
    password: {
      type: String,
      required: true,
      select: false, // Don't include password by default in queries
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // ========== ADDRESS & LOCATION ==========
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },

    // ========== BUSINESS DETAILS ==========
    businessType: {
      type: String,
      enum: ['Individual Agent', 'Agency', 'Educational Institute', 'Corporate', 'Other'],
      default: 'Individual Agent',
    },
    website: String,
    gstNumber: String,
    panNumber: String,
    registrationNumber: String,
    establishedYear: Number,

    // ========== COMMISSION & PAYMENT ==========
    commissionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    commissionType: {
      type: String,
      enum: ['Percentage', 'Fixed Amount', 'Tiered', 'Custom'],
      default: 'Percentage',
    },
    paymentTerms: String,
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
    },

    // ========== STATUS & VERIFICATION ==========
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended', 'Pending Verification', 'Rejected'],
      default: 'Pending Verification',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Documents Submitted', 'Under Review', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    verifiedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    verificationNotes: String,

    // ========== AGREEMENT & CONTRACT ==========
    agreementSigned: {
      type: Boolean,
      default: false,
    },
    agreementSignedDate: Date,
    agreementDocument: String, // File path or URL
    contractStartDate: Date,
    contractEndDate: Date,

    // ========== ACCESS RESTRICTIONS ==========
    allowedPhases: {
      type: [String],
      default: ['Lead Acquisition', 'Student Onboarding'],
    },
    allowedStages: {
      type: [String],
      default: [
        'Lead Capture & Qualification',
        'Initial Assessment & Counselling',
        'Conversion Decision',
        'Student Registration',
      ],
    },
    canEditAfterStage2_1: {
      type: Boolean,
      default: false,
      description: 'Whether partner can edit students after Stage 2.1 (Student Registration)',
    },

    // ========== PERFORMANCE METRICS ==========
    totalStudents: {
      type: Number,
      default: 0,
    },
    activeStudents: {
      type: Number,
      default: 0,
    },
    convertedStudents: {
      type: Number,
      default: 0,
    },
    totalCommissionEarned: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    // ========== ASSIGNED MANAGER ==========
    assignedManager: {
      type: Types.ObjectId,
      ref: 'User',
      description: 'Staff member managing this partner',
    },
    assignedManagerDate: Date,

    // ========== NOTES & TAGS ==========
    notes: String,
    tags: [String],
    internalNotes: String, // Notes visible only to admin

    // ========== LOGIN TRACKING ==========
    lastLoginAt: Date,
    lastLoginIP: String,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,

    // ========== ACTIVITY HISTORY ==========
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
        },
        metadata: {
          type: Map,
          of: Schema.Types.Mixed,
        },
      },
    ],

    // ========== RECORD MANAGEMENT ==========
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    deletedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ========== INDEXES ==========
partnerSchema.index({ createdAt: 1 });
partnerSchema.index({ deleted: 1, status: 1 });
partnerSchema.index({ companyName: 'text', contactPersonName: 'text' });

// ========== VIRTUAL FIELDS ==========
partnerSchema.virtual('conversionRate').get(function () {
  if (this.totalStudents === 0) return 0;
  return ((this.convertedStudents / this.totalStudents) * 100).toFixed(2);
});

partnerSchema.virtual('isLocked').get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

// ========== MIDDLEWARE ==========

// Pre-save middleware: Generate partnerId and hash password
partnerSchema.pre('save', async function () {
  // Generate partnerId for new partners
  if (this.isNew && !this.partnerId) {
    // Find the highest partnerId to ensure uniqueness
    const lastPartner = await this.constructor
      .findOne({}, { partnerId: 1 })
      .sort({ createdAt: -1 })
      .lean();

    let nextNumber = 1;
    if (lastPartner && lastPartner.partnerId) {
      // Extract number from partnerId (e.g., "PTR00001" -> 1)
      const match = lastPartner.partnerId.match(/PTR(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    this.partnerId = `PTR${String(nextNumber).padStart(5, '0')}`;
  }

  // Hash password if it's modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = Date.now() - 1000; // Set to 1 second ago to handle JWT timing
  }
});

// ========== INSTANCE METHODS ==========

// Compare password for login
partnerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if password was changed after JWT was issued
partnerSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Increment login attempts
partnerSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Otherwise increment attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock the account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Reset login attempts on successful login
partnerSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLoginAt: Date.now() },
    $unset: { lockUntil: 1 },
  });
};

// Check if partner can manage a student based on stage
partnerSchema.methods.canManageStudent = function (studentStage) {
  // Partners can manage students only in allowed stages
  return this.allowedStages.includes(studentStage);
};

// Check if partner has edit access for a student
partnerSchema.methods.canEditStudent = function (studentStage) {
  // Partners can edit students only until Stage 2.1
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

  return !restrictedStages.includes(studentStage);
};

// Add to history
partnerSchema.methods.addHistory = function (type, notes, actionDoneBy, metadata = {}) {
  this.history.push({
    type,
    date: new Date(),
    notes,
    actionDoneBy,
    metadata,
  });
};

// Update performance metrics
partnerSchema.methods.updateMetrics = async function () {
  const Student = mongoose.model('Student');

  const students = await Student.find({
    'leadSource.partner': this._id,
    deleted: false,
  });

  this.totalStudents = students.length;
  this.activeStudents = students.filter(
    (s) => s.currentStatus !== 'Drop' && s.currentStatus !== 'File Closed'
  ).length;
  this.convertedStudents = students.filter((s) => s.currentStatus === 'Converted').length;

  await this.save();
};

// Check if model already exists to prevent OverwriteModelError
export default mongoose.models.Partner || model('Partner', partnerSchema);
