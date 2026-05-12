// Phase and Stage Configuration for Study Abroad Consultancy CRM

export const PHASES = {
  PHASE_1: 'Lead Acquisition',
  PHASE_2: 'Student Onboarding',
  PHASE_3: 'Visa Preparation',
  PHASE_4: 'Post-Arrival Support',
};

export const STAGES = {
  // Phase 1: Lead Acquisition & Initial Engagement
  LEAD_CAPTURE: 'Lead Capture & Qualification',
  INITIAL_ASSESSMENT: 'Initial Assessment & Counselling',
  CONVERSION_DECISION: 'Conversion Decision',

  // Phase 2: Student Onboarding & Profile Development
  REGISTRATION: 'Student Registration',
  APPLICATION_SUBMISSION: 'Application Submission',
  OFFER_MANAGEMENT: 'Offer Management',

  // Phase 3: Visa Preparation
  FINANCIAL_ARRANGEMENTS: 'Financial Arrangements',
  VISA_PROCESSING: 'Visa Processing',
  PRE_DEPARTURE: 'Pre-Departure Readiness',

  // Phase 4: Post-Arrival Support & Settlement
  ARRIVAL_SETUP: 'Arrival & Initial Setup',
  ACADEMIC_INTEGRATION: 'Academic Integration',
  FILE_COMPLETION: 'File Completion',
};

// Status definitions for each stage
export const STAGE_STATUSES = {
  // PHASE 1: LEAD ACQUISITION & INITIAL ENGAGEMENT

  // Stage 1.1: Lead Capture & Qualification
  [STAGES.LEAD_CAPTURE]: [
    'New Inquiry',
    'Contact In Progress',
    'Qualified Lead',
    'Not Reachable',
    'Invalid Contact',
    'Duplicate Lead',
    'Disqualified',
  ],

  // Stage 1.2: Initial Assessment & Counselling
  [STAGES.INITIAL_ASSESSMENT]: [
    'Assessment Pending',
    'Assessment Completed',
    'Plan Dropped',
  ],

  // Stage 1.3: Conversion Decision
  [STAGES.CONVERSION_DECISION]: [
    'Proposal Presented',
    'Ready to Enroll',
    'Converted',
    'Drop - Budget',
    'Drop - Timeline',
    'Drop - Competition',
    'Drop - Not Interested',
  ],

  // PHASE 2: STUDENT ONBOARDING & PROFILE DEVELOPMENT

  // Stage 2.1: Student Registration
  [STAGES.REGISTRATION]: [
    'Video Verification',
    'Registration Complete',
    'Registration On Hold',
  ],

  // Stage 2.2: Application Submission
  [STAGES.APPLICATION_SUBMISSION]: [
    'Application In Progress',
    'Application Submitted',
    'Conditional Offer Letter Received',
    'Unconditional Offer Letter Received',
    'Plan Drop',
  ],

  // Stage 2.3: Offer Management
  [STAGES.OFFER_MANAGEMENT]: [
    'Offer Under Review',
    'Student Considering Multiple Offers',
    'Awaiting Student Decision',
    'Offer Accepted',
    'Offer Declined',
    'Deposit Payment Pending',
    'Enrollment Confirmed',
  ],

  // PHASE 3: VISA PREPARATION

  // Stage 3.1: Financial Arrangements
  [STAGES.FINANCIAL_ARRANGEMENTS]: [
    'Financial Planning In Progress',
    'Loan Application Pending',
    'Loan Sanctioned',
    'Arrangements Complete',
  ],

  // Stage 3.2: Visa Processing
  [STAGES.VISA_PROCESSING]: [
    'Visa Application In Progress',
    'Visa Application Submitted',
    'Visa Application Rejected',
    'Visa Application Re-Submitted',
    'Visa Approved',
  ],

  // Stage 3.3: Pre-Departure Readiness
  [STAGES.PRE_DEPARTURE]: [
    'Preparation In Progress',
    'Documentation Completed',
    'Orientation Completed',
    'Ready for Departure',
  ],

  // PHASE 4: POST-ARRIVAL SUPPORT & SETTLEMENT

  // Stage 4.1: Arrival & Initial Setup
  [STAGES.ARRIVAL_SETUP]: [
    'En Route',
    'Arrived',
    'Initial Setup In Progress',
    'Setup Complete',
    'Setup Issues',
    'University Registration Pending',
    'University Registration Completed',
  ],

  // Stage 4.2: Academic Integration
  [STAGES.ACADEMIC_INTEGRATION]: [
    'Integration In Progress',
    'Integration Issues',
    'Successfully Integrated',
  ],

  // Stage 4.3: File Completion
  [STAGES.FILE_COMPLETION]: [
    'Final Call Pending',
    'Issue Resolution In Progress',
    'File Closed',
  ],
};

// Administrative Statuses (Cross-Phase)
export const ADMINISTRATIVE_STATUSES = {
  PROCESS_MANAGEMENT: [
    'On Hold - Student Request',
    'On Hold - Document Issues',
    'On Hold - Financial Issues',
    'On Hold - External Delay',
    'Escalated',
    'Under Review',
    'Transferred',
    'Freeze',
    'Lock',
  ],

  COMMUNICATION_STATUS: [
    'Awaiting Student Response',
    'Follow-up Scheduled',
    'Urgent Response Required',
    'Communication Failed',
  ],

  SERVICE_STATUS: [
    'Active',
    'Paused',
    'Refund Requested',
    'Service Terminated',
    'Successfully Completed',
  ],
};

// All administrative statuses combined
export const ALL_ADMINISTRATIVE_STATUSES = [
  ...ADMINISTRATIVE_STATUSES.PROCESS_MANAGEMENT,
  ...ADMINISTRATIVE_STATUSES.COMMUNICATION_STATUS,
  ...ADMINISTRATIVE_STATUSES.SERVICE_STATUS,
];

// Helper function to get all statuses for a stage
export const getStatusesForStage = (stage) => {
  return STAGE_STATUSES[stage] || [];
};

// Helper function to validate if a status is valid for a stage
export const isValidStatusForStage = (stage, status) => {
  const validStatuses = STAGE_STATUSES[stage] || [];
  return validStatuses.includes(status) || ALL_ADMINISTRATIVE_STATUSES.includes(status);
};

// Helper function to get phase for a stage
export const getPhaseForStage = (stage) => {
  if ([STAGES.LEAD_CAPTURE, STAGES.INITIAL_ASSESSMENT, STAGES.CONVERSION_DECISION].includes(stage)) {
    return PHASES.PHASE_1;
  }
  if ([STAGES.REGISTRATION, STAGES.APPLICATION_SUBMISSION, STAGES.OFFER_MANAGEMENT].includes(stage)) {
    return PHASES.PHASE_2;
  }
  if ([STAGES.FINANCIAL_ARRANGEMENTS, STAGES.VISA_PROCESSING, STAGES.PRE_DEPARTURE].includes(stage)) {
    return PHASES.PHASE_3;
  }
  if ([STAGES.ARRIVAL_SETUP, STAGES.ACADEMIC_INTEGRATION, STAGES.FILE_COMPLETION].includes(stage)) {
    return PHASES.PHASE_4;
  }
  return null;
};

// Get all stages for a phase
export const getStagesForPhase = (phase) => {
  switch (phase) {
    case PHASES.PHASE_1:
      return [STAGES.LEAD_CAPTURE, STAGES.INITIAL_ASSESSMENT, STAGES.CONVERSION_DECISION];
    case PHASES.PHASE_2:
      return [STAGES.REGISTRATION, STAGES.APPLICATION_SUBMISSION, STAGES.OFFER_MANAGEMENT];
    case PHASES.PHASE_3:
      return [STAGES.FINANCIAL_ARRANGEMENTS, STAGES.VISA_PROCESSING, STAGES.PRE_DEPARTURE];
    case PHASES.PHASE_4:
      return [STAGES.ARRIVAL_SETUP, STAGES.ACADEMIC_INTEGRATION, STAGES.FILE_COMPLETION];
    default:
      return [];
  }
};

// Default initial values
export const DEFAULT_VALUES = {
  PHASE: PHASES.PHASE_1,
  STAGE: STAGES.LEAD_CAPTURE,
  STATUS: 'New Inquiry',
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  COUNSELOR: 'Counselor',
  ADMISSION_OFFICER: 'Admission Officer',
  VISA_OFFICER: 'Visa Officer',
  ACCOUNTANT: 'Accountant',
  OPERATIONS: 'Operations',
  MARKETING: 'Marketing',
};

// Module definitions for permissions
export const MODULES = {
  STUDENTS: 'students',
  USERS: 'users',
  ROLES: 'roles',
  APPLICATIONS: 'applications',
  DOCUMENTS: 'documents',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  TODOS: 'todos',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  MCP: 'mcp',
};

// Actions for permissions
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  ASSIGN: 'assign',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
  IMPORT: 'import',
  UPDATE_STATUS: 'updateStatus',
  FOLLOWUP: 'followup',
};

// Document Types
export const DOCUMENT_TYPES = {
  // Identity Documents
  AADHAR_CARD: 'Aadhar Card',
  PASSPORT: 'Passport',
  PASSPORT_SIZE_PHOTO: 'Passport Size Photo',

  // Academic Documents
  TENTH_MARKSHEET: '10th Marksheet',
  TENTH_CERTIFICATE: '10th Certificate',
  TWELFTH_MARKSHEET: '12th Marksheet',
  TWELFTH_CERTIFICATE: '12th Certificate',
  UG_MARKSHEET: 'UG Marksheet',
  UG_DEGREE: 'UG Degree/Provisional Certificate',
  UG_TRANSCRIPTS: 'UG Transcripts',
  PG_MARKSHEET: 'PG Marksheet',
  PG_DEGREE: 'PG Degree/Provisional Certificate',
  PG_TRANSCRIPTS: 'PG Transcripts',

  // Language Proficiency
  IELTS_SCORECARD: 'IELTS Scorecard',
  TOEFL_SCORECARD: 'TOEFL Scorecard',
  PTE_SCORECARD: 'PTE Scorecard',
  DUOLINGO_SCORECARD: 'Duolingo Scorecard',
  GERMAN_LANGUAGE_CERT: 'German Language Certificate',

  // Standardized Tests
  GRE_SCORECARD: 'GRE Scorecard',
  GMAT_SCORECARD: 'GMAT Scorecard',
  SAT_SCORECARD: 'SAT Scorecard',

  // Application Documents
  SOP: 'Statement of Purpose (SOP)',
  LOR: 'Letter of Recommendation (LOR)',
  RESUME_CV: 'Resume/CV',

  // Financial Documents
  BANK_STATEMENT: 'Bank Statement',
  ITR: 'Income Tax Return (ITR)',
  LOAN_SANCTION_LETTER: 'Loan Sanction Letter',
  LOAN_DISBURSEMENT_LETTER: 'Loan Disbursement Letter',
  FD_CERTIFICATE: 'Fixed Deposit Certificate',
  SPONSOR_AFFIDAVIT: 'Sponsor Affidavit',
  PROOF_OF_FUNDS: 'Proof of Funds',

  // Offer & Enrollment
  OFFER_LETTER: 'Offer Letter',
  CONDITIONAL_OFFER: 'Conditional Offer Letter',
  UNCONDITIONAL_OFFER: 'Unconditional Offer Letter',
  CAS_I20_COE: 'CAS/I-20/CoE',
  ENROLLMENT_CONFIRMATION: 'Enrollment Confirmation Letter',

  // Visa Documents
  VISA_APPLICATION_FORM: 'Visa Application Form',
  VISA_APPOINTMENT_RECEIPT: 'Visa Appointment Receipt',
  MEDICAL_CERTIFICATE: 'Medical Certificate',
  POLICE_CLEARANCE: 'Police Clearance Certificate',
  VISA_APPROVAL: 'Visa Approval',

  // Work Experience
  WORK_EXPERIENCE_LETTER: 'Work Experience Letter',

  // Other
  OTHER: 'Other',
};

// All document types as array
export const ALL_DOCUMENT_TYPES = Object.values(DOCUMENT_TYPES);

// Stage Checklists (Hardcoded for now)
export const STAGE_CHECKLISTS = {
  // Stage 1.1: Lead Capture & Qualification
  [STAGES.LEAD_CAPTURE]: {
    documents: [
      { id: 'aadhar', type: DOCUMENT_TYPES.AADHAR_CARD, label: 'Aadhar Card', required: true },
      { id: 'passport', type: DOCUMENT_TYPES.PASSPORT, label: 'Passport (copy or details)', required: true },
    ],
    tasks: [
      { id: 'verify_name', label: 'Student name verified', required: true },
      { id: 'verify_contact', label: 'Contact details verified', required: true },
      { id: 'education_background', label: 'Education background captured', required: true },
      { id: 'destination_preference', label: 'Study destination preference noted', required: true },
      { id: 'budget_discussed', label: 'Budget range discussed', required: false },
      { id: 'timeline_documented', label: 'Timeline expectations documented', required: true },
    ],
  },

  // Stage 1.2: Initial Assessment & Counselling
  [STAGES.INITIAL_ASSESSMENT]: {
    documents: [
      { id: 'tenth', type: DOCUMENT_TYPES.TENTH_MARKSHEET, label: '10th Marksheet', required: true },
      { id: 'twelfth', type: DOCUMENT_TYPES.TWELFTH_MARKSHEET, label: '12th Marksheet', required: true },
    ],
    tasks: [
      { id: 'english_assessment', label: 'English proficiency assessment completed', required: true },
      { id: 'career_counselling', label: 'Career counselling session conducted', required: true },
      { id: 'course_shortlist', label: 'Course and university shortlist prepared', required: true },
      { id: 'profile_evaluation', label: 'Student profile evaluation completed', required: true },
    ],
  },

  // Stage 1.3: Conversion Decision
  [STAGES.CONVERSION_DECISION]: {
    documents: [],
    tasks: [
      { id: 'proposal_presented', label: 'Service proposal presented to student', required: true },
      { id: 'commitment_confirmed', label: 'Student commitment confirmed', required: true },
      { id: 'kickoff_scheduled', label: 'Kickoff meeting scheduled', required: true },
      { id: 'account_setup', label: 'Account setup initiated', required: false },
    ],
  },

  // Stage 2.1: Student Registration
  [STAGES.REGISTRATION]: {
    documents: [
      { id: 'passport_photo', type: DOCUMENT_TYPES.PASSPORT_SIZE_PHOTO, label: 'Passport Size Photos', required: true },
      { id: 'sop', type: DOCUMENT_TYPES.SOP, label: 'Statement of Purpose (SOP)', required: true },
      { id: 'resume', type: DOCUMENT_TYPES.RESUME_CV, label: 'Resume/CV', required: true },
    ],
    tasks: [
      { id: 'video_verification', label: 'Video verification completed', required: true },
      { id: 'documents_verified', label: 'All documents verified and authenticated', required: true },
    ],
  },

  // Stage 2.2: Application Submission
  [STAGES.APPLICATION_SUBMISSION]: {
    documents: [],
    tasks: [
      { id: 'application_forms', label: 'University application forms completed', required: true },
      { id: 'fees_paid', label: 'Application fees paid', required: true },
      { id: 'documents_uploaded', label: 'All supporting documents uploaded', required: true },
      { id: 'tracking_shared', label: 'Application tracking credentials shared with student', required: true },
      { id: 'submission_confirmed', label: 'Application submission confirmation received', required: true },
    ],
  },

  // Stage 2.3: Offer Management
  [STAGES.OFFER_MANAGEMENT]: {
    documents: [
      { id: 'offer_letter', type: DOCUMENT_TYPES.OFFER_LETTER, label: 'Offer Letter', required: true },
    ],
    tasks: [
      { id: 'offer_reviewed', label: 'Offer letter reviewed with student', required: true },
      { id: 'university_selected', label: 'University selection finalized', required: true },
      { id: 'offer_accepted', label: 'Offer acceptance confirmed', required: true },
      { id: 'deposit_paid', label: 'Tuition deposit paid (if required)', required: false },
      { id: 'cas_received', label: 'CAS/I-20/CoE received', required: true },
    ],
  },

  // Stage 3.1: Financial Arrangements
  [STAGES.FINANCIAL_ARRANGEMENTS]: {
    documents: [
      { id: 'bank_statement', type: DOCUMENT_TYPES.BANK_STATEMENT, label: 'Bank Statement (6 months)', required: true },
      { id: 'itr', type: DOCUMENT_TYPES.ITR, label: 'Income Tax Returns', required: true },
      { id: 'proof_of_funds', type: DOCUMENT_TYPES.PROOF_OF_FUNDS, label: 'Proof of Funds Letter', required: true },
    ],
    tasks: [
      { id: 'financial_planning', label: 'Financial planning completed', required: true },
      { id: 'sponsor_affidavit', label: 'Sponsor affidavit prepared (if applicable)', required: false },
      { id: 'documents_verified', label: 'All financial documents verified', required: true },
    ],
  },

  // Stage 3.2: Visa Processing
  [STAGES.VISA_PROCESSING]: {
    documents: [
      { id: 'visa_form', type: DOCUMENT_TYPES.VISA_APPLICATION_FORM, label: 'Visa Application Form', required: true },
    ],
    tasks: [
      { id: 'appointment_scheduled', label: 'Visa appointment scheduled', required: true },
      { id: 'fees_paid', label: 'Visa fees paid', required: true },
      { id: 'biometrics_done', label: 'Biometrics completed (if required)', required: false },
      { id: 'medical_done', label: 'Medical examination completed (if required)', required: false },
      { id: 'interview_prepared', label: 'Visa interview prepared (if applicable)', required: false },
    ],
  },

  // Stage 3.3: Pre-Departure Readiness
  [STAGES.PRE_DEPARTURE]: {
    documents: [],
    tasks: [
      { id: 'flight_booked', label: 'Flight tickets booked', required: true },
      { id: 'insurance_purchased', label: 'Travel insurance purchased', required: true },
      { id: 'forex_arranged', label: 'Forex arranged', required: true },
      { id: 'accommodation_confirmed', label: 'Accommodation confirmed', required: true },
      { id: 'orientation_attended', label: 'Pre-departure orientation attended', required: true },
      { id: 'emergency_contacts', label: 'Emergency contacts shared', required: true },
    ],
  },

  // Stage 4.1: Arrival & Initial Setup
  [STAGES.ARRIVAL_SETUP]: {
    documents: [],
    tasks: [
      { id: 'arrival_confirmed', label: 'Safe arrival confirmed', required: true },
      { id: 'accommodation_checkin', label: 'Accommodation check-in completed', required: true },
      { id: 'sim_setup', label: 'Local SIM card/phone setup done', required: true },
      { id: 'bank_account', label: 'Bank account opened', required: true },
      { id: 'university_registration', label: 'University registration completed', required: true },
      { id: 'student_id', label: 'Student ID card obtained', required: true },
    ],
  },

  // Stage 4.2: Academic Integration
  [STAGES.ACADEMIC_INTEGRATION]: {
    documents: [],
    tasks: [
      { id: 'classes_attended', label: 'First week of classes attended', required: true },
      { id: 'materials_obtained', label: 'Study materials obtained', required: true },
      { id: 'advisor_meeting', label: 'Academic advisor meeting completed', required: true },
      { id: 'library_access', label: 'Library access confirmed', required: true },
      { id: 'challenges_addressed', label: 'Integration challenges addressed', required: true },
    ],
  },

  // Stage 4.3: File Completion
  [STAGES.FILE_COMPLETION]: {
    documents: [],
    tasks: [
      { id: 'final_call', label: 'Final check-in call completed', required: true },
      { id: 'feedback_collected', label: 'Student feedback collected', required: true },
      { id: 'issues_resolved', label: 'All outstanding issues resolved', required: true },
      { id: 'testimonial_requested', label: 'Testimonial requested', required: false },
      { id: 'referral_explained', label: 'Referral program explained', required: false },
    ],
  },
};

// Helper function to get checklist for a stage
export const getChecklistForStage = (stage) => {
  return STAGE_CHECKLISTS[stage] || { documents: [], tasks: [] };
};

export default {
  PHASES,
  STAGES,
  STAGE_STATUSES,
  ADMINISTRATIVE_STATUSES,
  ALL_ADMINISTRATIVE_STATUSES,
  DEFAULT_VALUES,
  USER_ROLES,
  MODULES,
  ACTIONS,
  DOCUMENT_TYPES,
  ALL_DOCUMENT_TYPES,
  STAGE_CHECKLISTS,
  getStatusesForStage,
  isValidStatusForStage,
  getPhaseForStage,
  getStagesForPhase,
  getChecklistForStage,
};
