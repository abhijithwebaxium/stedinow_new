import mongoose from 'mongoose';
import { PHASES, STAGES, STAGE_STATUSES, ALL_ADMINISTRATIVE_STATUSES } from '../config/constants.js';

const { Schema, model, Types } = mongoose;

// Get all possible statuses for validation
const getAllPossibleStatuses = () => {
  const stageStatuses = Object.values(STAGE_STATUSES).flat();
  return [...new Set([...stageStatuses, ...ALL_ADMINISTRATIVE_STATUSES])];
};

// Status History Subdocument
const statusHistorySchema = new Schema(
  {
    phase: {
      type: String,
      enum: Object.values(PHASES),
      required: true,
    },
    stage: {
      type: String,
      enum: Object.values(STAGES),
      required: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    previousStatus: String,
    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    changedBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  { _id: true }
);

// Communication Log Subdocument
const communicationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Call', 'Email', 'WhatsApp', 'Meeting', 'SMS', 'Video Call', 'Other'],
      required: true,
    },
    direction: {
      type: String,
      enum: ['Inbound', 'Outbound'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    duration: Number, // in minutes
    subject: String,
    notes: String,
    handledBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    outcome: String,
    nextAction: String,
  },
  { _id: true, timestamps: true }
);

// Main Student Schema
const studentSchema = new Schema(
  {
    // ========== UNIQUE IDENTIFIER ==========
    studentId: {
      type: String,
      unique: true,
      required: true,
    },

    // ========== BASIC INFORMATION ==========
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    phoneCode: {
      type: String,
      trim: true,
      required: true,
    },
    alternativePhone: String,
    alternativePhoneCode: String,
    parentPhone: String,
    parentPhoneCode: String,

    // ========== WORKFLOW TRACKING ==========
    currentPhase: {
      type: String,
      enum: Object.values(PHASES),
      required: true,
      default: PHASES.PHASE_1,
    },
    currentStage: {
      type: String,
      enum: Object.values(STAGES),
      required: true,
      default: STAGES.LEAD_CAPTURE,
    },
    currentStatus: {
      type: String,
      required: true,
      enum: getAllPossibleStatuses(),
      default: 'New Inquiry',
    },

    // Status History - Complete audit trail
    statusHistory: [statusHistorySchema],

    // ========== ASSIGNMENT & OWNERSHIP ==========
    assigned: {
      counselor: {
        type: Types.ObjectId,
        ref: 'User',
      },
      assignedDate: Date,
      assignedBy: {
        type: Types.ObjectId,
        ref: 'User',
      },
      applicationOfficer: {
        type: Types.ObjectId,
        ref: 'User',
      },
      applicationOfficerAssignedDate: Date,
      applicationOfficerAssignedBy: {
        type: Types.ObjectId,
        ref: 'User',
      },
      history: [
        {
          type: {
            type: String,
            required: true,
            enum: ['Assign', 'Re-Assign', 'Transfer'],
            default: 'Assign',
          },
          counselor: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
          },
          assignedDate: {
            type: Date,
            required: true,
          },
          assignedBy: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
          },
          notes: String,
        },
      ],
    },

    // ========== LEAD SOURCE INFORMATION ==========
    leadSource: {
      source: {
        type: String,
        required: true,
        default: 'Unknown',
      },
      sourceLeadId: String,
      campaign: {
        campaignId: String,
        campaignName: String,
        adSetId: String,
        adId: String,
        medium: String,
      },
      partner: {
        type: Types.ObjectId,
        ref: 'Partner',
      },
      referredBy: String,
      submittedDate: Date,
      initialNote: String,
    },

    // ========== PERSONAL INFORMATION ==========
    personalInfo: {
      dob: Date,
      age: Number,
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Prefer Not To Say', 'Not Defined'],
        default: 'Not Defined',
      },
      nationality: String,
      passportNumber: String,
      passportExpiryDate: Date,
      maritalStatus: {
        type: String,
        enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Other'],
      },

      // Address
      currentAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
      },
      permanentAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
      },

      // Family Information
      fatherName: String,
      fatherOccupation: String,
      fatherPhone: String,
      fatherEmail: String,
      motherName: String,
      motherOccupation: String,
      motherPhone: String,
      motherEmail: String,
      guardianName: String,
      guardianRelation: String,
      guardianPhone: String,
      guardianEmail: String,
    },

    // ========== ACADEMIC INFORMATION ==========
    academics: {
      // 10th Standard
      tenth: {
        schoolName: String,
        board: String,
        percentage: Number,
        cgpa: Number,
        passYear: Number,
        medium: String,
      },

      // 12th Standard
      twelfth: {
        schoolName: String,
        board: String,
        stream: String,
        percentage: Number,
        cgpa: Number,
        passYear: Number,
        medium: String,
      },

      // Undergraduate
      undergraduate: {
        collegeName: String,
        university: String,
        degree: String,
        specialization: String,
        percentage: Number,
        cgpa: Number,
        passYear: Number,
        backlogs: Number,
        activeBacklogs: Number,
        clearedBacklogs: Number,
        medium: String,
      },

      // Postgraduate
      postgraduate: {
        collegeName: String,
        university: String,
        degree: String,
        specialization: String,
        percentage: Number,
        cgpa: Number,
        passYear: Number,
        backlogs: Number,
        activeBacklogs: Number,
        clearedBacklogs: Number,
        medium: String,
      },

      // Gaps in Education
      educationGaps: [
        {
          from: Date,
          to: Date,
          reason: String,
          duration: Number, // in months
        },
      ],

      // Work Experience
      workExperience: [
        {
          company: String,
          position: String,
          from: Date,
          to: Date,
          currentlyWorking: Boolean,
          duration: Number, // in months
          responsibilities: String,
        },
      ],

      // English Proficiency Tests
      ielts: {
        hasIELTS: Boolean,
        overallScore: Number,
        listening: Number,
        reading: Number,
        writing: Number,
        speaking: Number,
        examDate: Date,
        trf: String, // Test Report Form number
      },
      toefl: {
        hasTOEFL: Boolean,
        overallScore: Number,
        reading: Number,
        listening: Number,
        speaking: Number,
        writing: Number,
        examDate: Date,
      },
      pte: {
        hasPTE: Boolean,
        overallScore: Number,
        listening: Number,
        reading: Number,
        writing: Number,
        speaking: Number,
        examDate: Date,
      },
      duolingo: {
        hasDuolingo: Boolean,
        overallScore: Number,
        examDate: Date,
      },

      // Other Tests
      gre: {
        hasGRE: Boolean,
        verbalScore: Number,
        quantScore: Number,
        writingScore: Number,
        totalScore: Number,
        examDate: Date,
      },
      gmat: {
        hasGMAT: Boolean,
        totalScore: Number,
        quantScore: Number,
        verbalScore: Number,
        writingScore: Number,
        examDate: Date,
      },
      sat: {
        hasSAT: Boolean,
        totalScore: Number,
        mathScore: Number,
        readingWritingScore: Number,
        examDate: Date,
      },
    },

    // ========== PROGRAM PREFERENCES ==========
    preferences: {
      targetCountries: [String],
      preferredCourses: [String],
      studyLevel: {
        type: String,
        enum: ['Undergraduate', 'Postgraduate', 'Diploma', 'Certificate', 'Research', 'PhD'],
      },
      intakePreference: String, // e.g., "Fall 2025", "Spring 2026"
      budgetRange: {
        min: Number,
        max: Number,
        currency: String,
      },
    },

    // ========== FINANCIAL INFORMATION ==========
    financial: {
      annualFamilyIncome: Number,
      currency: String,
      sourceOfFunds: {
        type: String,
        enum: ['Self-Funded', 'Family-Funded', 'Loan', 'Scholarship', 'Sponsor', 'Multiple'],
      },

      // Loan Information
      loanRequired: Boolean,
      loanDetails: {
        applied: Boolean,
        bank: String,
        amount: Number,
        status: String,
        sanctionDate: Date,
        disbursementDate: Date,
      },

      // Sponsor Information
      sponsor: {
        hasSponsor: Boolean,
        name: String,
        relationship: String,
        occupation: String,
        annualIncome: Number,
      },

      // Financial Documents Status
      bankStatementProvided: Boolean,
      itrProvided: Boolean,
      financialProofStatus: String,
    },

    // ========== COMMUNICATION TRACKING ==========
    communications: [communicationSchema],

    // ========== FOLLOW-UP TRACKING ==========
    followup: {
      nextFollowupDate: {
        type: Date,
      },
      lastFollowupDate: Date,
      followupFrequency: String, // e.g., "Weekly", "Daily", "Monthly"
      followupHistory: [
        {
          date: {
            type: Date,
            required: true,
          },
          nextFollowupDate: Date,
          notes: String,
          followedBy: {
            type: Types.ObjectId,
            ref: 'User',
          },
          outcome: String,
          actionTaken: String,
        },
      ],
    },

    // ========== ADMINISTRATIVE STATUS (Cross-Phase) ==========
    administrativeStatus: {
      communicationStatus: {
        type: String,
        enum: ['Responsive', 'Slow Response', 'Not Responding', 'Unreachable'],
        default: 'Responsive',
      },
      paymentStatus: {
        type: String,
        enum: ['Not Started', 'Partial', 'Complete', 'Pending', 'Overdue'],
      },
      documentStatus: {
        type: String,
        enum: ['Not Collected', 'Partial', 'Complete', 'Pending Verification', 'Verified'],
      },
      priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium',
      },
      onHold: {
        isOnHold: {
          type: Boolean,
          default: false,
        },
        reason: String,
        holdDate: Date,
        expectedResumeDate: Date,
        holdBy: {
          type: Types.ObjectId,
          ref: 'User',
        },
      },
    },

    // ========== FREEZE STATUS ==========
    frozen: {
      isFrozen: {
        type: Boolean,
        default: false,
      },
      frozenAt: Date,
      frozenBy: {
        type: Types.ObjectId,
        ref: 'User',
      },
      frozenReason: String,
      frozenUntil: Date, // Expected unfreeze date
      frozenNotes: String,
    },

    // ========== LOCK STATUS ==========
    locked: {
      isLocked: {
        type: Boolean,
        default: false,
      },
      lockedAt: Date,
      lockedBy: {
        type: Types.ObjectId,
        ref: 'User',
      },
      lockedReason: String,
      lockAccessLevel: {
        type: String,
        enum: ['Admin', 'Super Admin'],
      },
      lockNotes: String,
    },

    // ========== STAGE CHECKLIST TRACKING ==========
    stageChecklists: {
      type: Map,
      of: {
        documents: [
          {
            itemId: String, // ID from constants STAGE_CHECKLISTS
            completed: {
              type: Boolean,
              default: false,
            },
            completedAt: Date,
            completedBy: {
              type: Types.ObjectId,
              ref: 'User',
            },
            documentId: {
              type: Types.ObjectId,
              ref: 'Document',
            },
          },
        ],
        tasks: [
          {
            itemId: String, // ID from constants STAGE_CHECKLISTS
            completed: {
              type: Boolean,
              default: false,
            },
            completedAt: Date,
            completedBy: {
              type: Types.ObjectId,
              ref: 'User',
            },
            scheduledAt: Date,
            notes: String,
          },
        ],
      },
      default: {},
    },

    // ========== APPLICATIONS REFERENCE ==========
    applications: [
      {
        type: Types.ObjectId,
        ref: 'Application',
      },
    ],

    priorityApplication: {
      type: Types.ObjectId,
      ref: 'Application',
    },

    // ========== DOCUMENTS REFERENCE ==========
    documents: [
      {
        type: Types.ObjectId,
        ref: 'Document',
      },
    ],

    // ========== PAYMENTS REFERENCE ==========
    payments: [
      {
        type: Types.ObjectId,
        ref: 'Payment',
      },
    ],

    // ========== ADDITIONAL INFORMATION ==========
    notes: String,
    tags: [String],

    // Important Dates
    importantDates: {
      firstContactDate: Date,
      convertedDate: Date, // When moved from lead to student
      registrationDate: Date,
      visaApprovedDate: Date,
      departureDate: Date,
      arrivalDate: Date,
    },

    // ========== ACTIVITY HISTORY - General audit log ==========
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
        metadata: {
          type: Map,
          of: Schema.Types.Mixed,
        },
      },
    ],

    // ========== STUDENT PORTAL ==========
    studentPassword: {
      type: String, // bcrypt hashed
    },
    hasChangedPassword: {
      type: Boolean,
      default: false,
    },
    shortlistedUniversities: [
      {
        type: Types.ObjectId,
        ref: 'University',
      },
    ],
    notifications: [
      {
        type: {
          type: String,
          enum: ['document_verified', 'document_rejected', 'phase_changed', 'message', 'application_update', 'deadline', 'general'],
          required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        data: { type: Schema.Types.Mixed },
      },
    ],

    // ========== RECORD MANAGEMENT ==========
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
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

// ========== INDEXES FOR PERFORMANCE ==========
studentSchema.index({ createdAt: 1 });
studentSchema.index({ deleted: 1, currentPhase: 1, currentStage: 1 });
studentSchema.index({ deleted: 1, currentStatus: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ phone: 1 });
studentSchema.index({ 'leadSource.source': 1 });
studentSchema.index({ 'assigned.counselor': 1 });
studentSchema.index({ 'followup.nextFollowupDate': 1 });
studentSchema.index({ 'administrativeStatus.priority': 1 });
studentSchema.index({ deleted: 1, createdAt: 1 });
studentSchema.index({ 'frozen.isFrozen': 1 });
studentSchema.index({ 'locked.isLocked': 1 });

// ========== VIRTUAL FIELDS ==========
studentSchema.virtual('totalApplications').get(function () {
  return this.applications ? this.applications.length : 0;
});

studentSchema.virtual('totalPayments').get(function () {
  return this.payments ? this.payments.length : 0;
});

// ========== INSTANCE METHODS ==========

// Add status history entry
studentSchema.methods.addStatusHistory = function (phase, stage, status, changedBy, notes = '', metadata = {}) {
  this.statusHistory.push({
    phase,
    stage,
    status,
    previousStatus: this.currentStatus,
    changedAt: new Date(),
    changedBy,
    notes,
    metadata,
  });

  this.currentPhase = phase;
  this.currentStage = stage;
  this.currentStatus = status;

  // Add to general history as well
  this.history.push({
    type: 'Status Update',
    date: new Date(),
    notes: `Status changed from "${this.currentStatus}" to "${status}" in ${stage}`,
    actionDoneBy: changedBy,
    metadata: { phase, stage, status },
  });
};

// Add communication log
studentSchema.methods.addCommunication = function (communicationData) {
  this.communications.push(communicationData);
};

// Add followup entry
studentSchema.methods.addFollowup = function (followupData) {
  this.followup.followupHistory.push(followupData);
  if (followupData.nextFollowupDate) {
    this.followup.nextFollowupDate = followupData.nextFollowupDate;
  }
  this.followup.lastFollowupDate = followupData.date;
};

// Freeze student
studentSchema.methods.freezeStudent = function (userId, reason, notes, frozenUntil) {
  this.frozen.isFrozen = true;
  this.frozen.frozenAt = new Date();
  this.frozen.frozenBy = userId;
  this.frozen.frozenReason = reason;
  this.frozen.frozenNotes = notes;
  if (frozenUntil) {
    this.frozen.frozenUntil = frozenUntil;
  }

  // Add to history
  this.history.push({
    type: 'Student Frozen',
    date: new Date(),
    notes: `Student frozen. Reason: ${reason}`,
    actionDoneBy: userId,
  });
};

// Unfreeze student
studentSchema.methods.unfreezeStudent = function (userId, notes) {
  this.frozen.isFrozen = false;

  // Add to history
  this.history.push({
    type: 'Student Unfrozen',
    date: new Date(),
    notes: notes || 'Student unfrozen',
    actionDoneBy: userId,
  });
};

// Lock student
studentSchema.methods.lockStudent = function (userId, reason, notes, accessLevel) {
  this.locked.isLocked = true;
  this.locked.lockedAt = new Date();
  this.locked.lockedBy = userId;
  this.locked.lockedReason = reason;
  this.locked.lockNotes = notes;
  this.locked.lockAccessLevel = accessLevel;

  // Add to history
  this.history.push({
    type: 'Student Locked',
    date: new Date(),
    notes: `Student locked. Reason: ${reason}`,
    actionDoneBy: userId,
  });
};

// Unlock student
studentSchema.methods.unlockStudent = function (userId, notes) {
  this.locked.isLocked = false;

  // Add to history
  this.history.push({
    type: 'Student Unlocked',
    date: new Date(),
    notes: notes || 'Student unlocked',
    actionDoneBy: userId,
  });
};

// Initialize checklist for a stage
studentSchema.methods.initializeStageChecklist = function (stage, checklistTemplate) {
  if (!this.stageChecklists) {
    this.stageChecklists = new Map();
  }

  const documents = checklistTemplate.documents.map(doc => ({
    itemId: doc.id,
    completed: false,
  }));

  const tasks = checklistTemplate.tasks.map(task => ({
    itemId: task.id,
    completed: false,
  }));

  this.stageChecklists.set(stage, { documents, tasks });
};

// Mark checklist document item as complete
studentSchema.methods.completeChecklistDocument = function (stage, itemId, userId, documentId) {
  const checklist = this.stageChecklists.get(stage);
  if (!checklist) return false;

  const docItem = checklist.documents.find(d => d.itemId === itemId);
  if (!docItem) return false;

  docItem.completed = true;
  docItem.completedAt = new Date();
  docItem.completedBy = userId;
  docItem.documentId = documentId;

  this.markModified('stageChecklists');
  return true;
};

// Mark checklist task item as complete
studentSchema.methods.completeChecklistTask = function (stage, itemId, userId, notes) {
  const checklist = this.stageChecklists.get(stage);
  if (!checklist) return false;

  const taskItem = checklist.tasks.find(t => t.itemId === itemId);
  if (!taskItem) return false;

  taskItem.completed = true;
  taskItem.completedAt = new Date();
  taskItem.completedBy = userId;
  if (notes) taskItem.notes = notes;

  this.markModified('stageChecklists');
  return true;
};

// Check if stage checklist is complete (all required items)
studentSchema.methods.isStageChecklistComplete = function (stage, checklistTemplate) {
  const checklist = this.stageChecklists.get(stage);
  if (!checklist) return false;

  // Check required documents
  const requiredDocs = checklistTemplate.documents.filter(d => d.required);
  for (const reqDoc of requiredDocs) {
    const docItem = checklist.documents.find(d => d.itemId === reqDoc.id);
    if (!docItem || !docItem.completed) return false;
  }

  // Check required tasks
  const requiredTasks = checklistTemplate.tasks.filter(t => t.required);
  for (const reqTask of requiredTasks) {
    const taskItem = checklist.tasks.find(t => t.itemId === reqTask.id);
    if (!taskItem || !taskItem.completed) return false;
  }

  return true;
};

// Check if model already exists to prevent OverwriteModelError
export default mongoose.models.Student || model('Student', studentSchema);
