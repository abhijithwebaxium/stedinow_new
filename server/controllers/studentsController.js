import Students from '../models/student.js';
import Document from '../models/document.js';
import { isValidObjectId } from '../helper/indexHelper.js';
import { DEFAULT_VALUES, getChecklistForStage, STAGES } from '../config/constants.js';
import { validateStageProgression, calculateChecklistProgress, autoCheckDocumentItems } from '../utils/checklistHelper.js';
import { sendStageNotification } from '../utils/whatsappService.js';
import { sendStageChangeEmail, sendWelcomeEmail, sendDocumentUploadEmail } from '../utils/emailService.js';
import path from 'path';
import fs from 'fs/promises';

// List all students (excluding frozen and locked)
export const getAllStudents = async (req, res, next) => {
  try {
    const {
      user: { userId, role },
    } = req;

    const query = {
      deleted: false,
      'frozen.isFrozen': false,
      'locked.isLocked': false,
    };

    // Role-based filtering
    const canOnlySeeAssigned = role.permissions.students.assignedOnly;
    if (canOnlySeeAssigned) {
      query['assigned.counselor'] = userId;
    }

    const students = await Students.find(query)
      .populate('assigned.counselor', 'name email')
      .populate('assigned.applicationOfficer', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100); // Limit for performance

    res.status(200).json({ status: 'success', students });
  } catch (err) {
    next(err);
  }
};

// Get single student
export const getStudent = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId, role },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const query = { _id: id, deleted: false };

    const canOnlySeeAssigned = role.permissions.students.assignedOnly;
    if (canOnlySeeAssigned) {
      query['assigned.counselor'] = userId;
    }

    const student = await Students.findOne(query)
      .populate('assigned.counselor', 'name email')
      .populate('assigned.applicationOfficer', 'name email')
      .populate('createdBy', 'name email')
      .populate('documents');

    if (!student) throw new Error('Student not found');

    res.status(200).json({ status: 'success', student });
  } catch (err) {
    next(err);
  }
};

// Create student
export const createStudent = async (req, res, next) => {
  try {
    const {
      body,
      user: { userId },
    } = req;

    // Check if student already exists
    const existingStudent = await Students.findOne({
      $or: [{ email: body.email }, { phone: body.phone }],
    });

    if (existingStudent) {
      throw new Error('Student with this email or phone already exists');
    }

    // Generate studentId - find the highest existing ID and increment
    const lastStudent = await Students.findOne({})
      .sort({ createdAt: -1 })
      .select('studentId');

    let nextNumber = 1;
    if (lastStudent && lastStudent.studentId) {
      // Extract number from STD-000001 format
      const lastNumber = parseInt(lastStudent.studentId.split('-')[1]);
      nextNumber = lastNumber + 1;
    }

    const studentId = `STD-${String(nextNumber).padStart(6, '0')}`;

    // Create student
    const newStudent = await Students.create({
      ...body,
      studentId,
      createdBy: userId,
      currentPhase: DEFAULT_VALUES.PHASE,
      currentStage: DEFAULT_VALUES.STAGE,
      currentStatus: DEFAULT_VALUES.STATUS,
    });

    // Add initial status history
    newStudent.addStatusHistory(
      DEFAULT_VALUES.PHASE,
      DEFAULT_VALUES.STAGE,
      DEFAULT_VALUES.STATUS,
      userId,
      'Initial student record created'
    );

    // Initialize checklist for the first stage
    const initialChecklist = getChecklistForStage(DEFAULT_VALUES.STAGE);
    if (initialChecklist) {
      newStudent.initializeStageChecklist(DEFAULT_VALUES.STAGE, initialChecklist);
    }

    await newStudent.save();

    // Send welcome email — fire and forget so it never blocks the response
    sendWelcomeEmail(newStudent)
      .then(() => console.log(`Welcome email sent to ${newStudent.email}`))
      .catch((err) => console.error('Welcome email failed:', err));

    res.status(201).json({ status: 'success', student: newStudent });
  } catch (err) {
    next(err);
  }
};

// Update student
export const updateStudent = async (req, res, next) => {
  try {
    const {
      params: { id },
      body,
      user: { userId, role },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const query = { _id: id, deleted: false };

    const canOnlySeeAssigned = role.permissions.students.assignedOnly;
    if (canOnlySeeAssigned) {
      query['assigned.counselor'] = userId;
    }

    const student = await Students.findOne(query);
    if (!student) throw new Error('Student not found');

    // Update fields
    Object.assign(student, body);

    // Add history
    student.history.push({
      type: 'Updated',
      date: new Date(),
      notes: 'Student information updated',
      actionDoneBy: userId,
    });

    await student.save();

    // Populate counselor and application officer data before returning
    await student.populate('assigned.counselor', 'name email');
    await student.populate('assigned.applicationOfficer', 'name email');

    res.status(200).json({ status: 'success', student });
  } catch (err) {
    next(err);
  }
};

// Update student status
export const updateStudentStatus = async (req, res, next) => {
  try {
    const {
      params: { id },
      body: { phase, stage, status, notes, applicationOfficerId },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Students.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    // Store the old stage for WhatsApp notification later
    const oldStage = student.currentStage;

    // If changing to a new stage, validate checklist completion
    if (stage !== student.currentStage) {
      const validation = validateStageProgression(student, student.currentStage);
      if (!validation.canProgress) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot progress to next stage. Checklist incomplete.',
          missingItems: validation.missingItems,
        });
      }

      // Check if moving from stage 2.1 (REGISTRATION) to 2.2 (APPLICATION_SUBMISSION)
      if (student.currentStage === STAGES.REGISTRATION && stage === STAGES.APPLICATION_SUBMISSION) {
        // Application officer assignment is required when moving to stage 2.2
        if (!applicationOfficerId) {
          return res.status(400).json({
            status: 'error',
            message: 'Application officer assignment is required when moving to Application Submission stage.',
            requiresApplicationOfficer: true,
          });
        }

        // Validate application officer ID
        if (!isValidObjectId(applicationOfficerId)) {
          throw new Error('Invalid application officer ID');
        }

        // Assign application officer
        student.assigned.applicationOfficer = applicationOfficerId;
        student.assigned.applicationOfficerAssignedDate = new Date();
        student.assigned.applicationOfficerAssignedBy = userId;

        // Add to history
        student.history.push({
          type: 'Application Officer Assigned',
          date: new Date(),
          notes: `Application officer assigned for stage ${stage}`,
          actionDoneBy: userId,
          metadata: { applicationOfficerId },
        });
      }

      // Initialize checklist for the new stage
      const newStageChecklist = getChecklistForStage(stage);
      if (newStageChecklist) {
        student.initializeStageChecklist(stage, newStageChecklist);
      }
    }

    // Add status history entry using the model method
    student.addStatusHistory(phase, stage, status, userId, notes || '');

    await student.save();

    // Populate application officer and counselor data
    await student.populate('assigned.applicationOfficer', 'name email');
    await student.populate('assigned.counselor', 'name email');

    // Send WhatsApp and Email notifications if stage changed (compare with old stage)
    if (stage !== oldStage) {
      const counselorName = student.assigned?.counselor?.name || 'Your counselor';

      // Send WhatsApp notification
      try {
        await sendStageNotification(
          {
            name: student.name,
            phone: student.phone,
          },
          stage,
          counselorName
        );
        console.log(`WhatsApp notification sent for stage change: ${oldStage} → ${stage}`);
      } catch (whatsappError) {
        // Don't fail the request if WhatsApp fails
        console.error('WhatsApp notification failed:', whatsappError);
      }

      // Send Email notification
      try {
        await sendStageChangeEmail(
          {
            name: student.name,
            email: student.email,
          },
          stage,
          counselorName
        );
        console.log(`Email notification sent for stage change: ${oldStage} → ${stage}`);
      } catch (emailError) {
        // Don't fail the request if Email fails
        console.error('Email notification failed:', emailError);
      }
    }

    res.status(200).json({ status: 'success', student });
  } catch (err) {
    next(err);
  }
};

// Delete student (soft delete)
export const deleteStudent = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Students.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    student.deleted = true;
    student.deletedAt = new Date();
    student.deletedBy = userId;

    student.history.push({
      type: 'Deleted',
      date: new Date(),
      notes: 'Student record deleted',
      actionDoneBy: userId,
    });

    await student.save();

    res.status(200).json({ status: 'success', message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Add followup
export const addFollowup = async (req, res, next) => {
  try {
    const {
      params: { id },
      body: { notes, nextFollowupDate, outcome, actionTaken },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Students.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    const followupEntry = {
      date: new Date(),
      notes,
      followedBy: userId,
      outcome: outcome || '',
      actionTaken: actionTaken || '',
    };

    if (nextFollowupDate) {
      followupEntry.nextFollowupDate = new Date(nextFollowupDate);
    }

    student.addFollowup(followupEntry);

    await student.save();

    res.status(200).json({ status: 'success', message: 'Followup added successfully', student });
  } catch (err) {
    next(err);
  }
};

// Get student documents
export const getStudentDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const documents = await Document.find({ student: id })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedDate: -1 });

    res.status(200).json({ status: 'success', documents });
  } catch (err) {
    next(err);
  }
};

// Upload student document
export const uploadDocument = async (req, res, next) => {
  try {
    const {
      params: { id },
      body: { documentType, description },
      user: { userId },
      file,
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Students.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    if (!file) throw new Error('No file uploaded');

    // For S3 uploads, multer-s3 provides file.location instead of file.path
    const fileUrl = file.location || file.path;

    // Create document record
    const document = await Document.create({
      student: id,
      documentType: documentType || 'Other',
      fileName: file.originalname,
      fileUrl: fileUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: userId,
      uploadedDate: new Date(),
    });

    // Add document reference to student
    student.documents.push(document._id);

    // Ensure checklist is initialized for current stage
    const currentStageChecklist = getChecklistForStage(student.currentStage);
    if (currentStageChecklist && !student.stageChecklists.has(student.currentStage)) {
      student.initializeStageChecklist(student.currentStage, currentStageChecklist);
    }

    // Auto-check checklist items for this document type
    const updatedStages = autoCheckDocumentItems(student, documentType, document._id, userId);

    await student.save();

    // Send email notification for document upload
    try {
      await sendDocumentUploadEmail(
        {
          name: student.name,
          email: student.email,
        },
        documentType
      );
      console.log(`Document upload email sent for ${documentType}`);
    } catch (emailError) {
      console.error('Document upload email failed:', emailError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Document uploaded successfully',
      document,
      checklistUpdated: updatedStages.length > 0,
      updatedStages,
    });
  } catch (err) {
    next(err);
  }
};

// Download student document
export const downloadDocument = async (req, res, next) => {
  try {
    const { id, documentId } = req.params;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');
    if (!isValidObjectId(documentId)) throw new Error('Invalid document ID');

    const document = await Document.findOne({ _id: documentId, student: id });
    if (!document) throw new Error('Document not found');

    // If file is on S3 (URL starts with https://), redirect to it
    if (document.fileUrl.startsWith('https://')) {
      res.redirect(document.fileUrl);
    } else {
      // Local file
      res.download(document.fileUrl, document.fileName);
    }
  } catch (err) {
    next(err);
  }
};

// Delete student document
export const deleteDocument = async (req, res, next) => {
  try {
    const {
      params: { id, documentId },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');
    if (!isValidObjectId(documentId)) throw new Error('Invalid document ID');

    const document = await Document.findOne({ _id: documentId, student: id });
    if (!document) throw new Error('Document not found');

    // Delete file from filesystem
    try {
      await fs.unlink(document.fileUrl);
    } catch (fileErr) {
      console.error('Error deleting file:', fileErr);
    }

    // Delete document record
    await Document.deleteOne({ _id: documentId });

    // Remove document reference from student
    const student = await Students.findOne({ _id: id, deleted: false });
    if (student) {
      student.documents = student.documents.filter(
        (doc) => doc.toString() !== documentId.toString()
      );
      await student.save();
    }

    res.status(200).json({ status: 'success', message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get frozen students list
export const getFrozenStudents = async (req, res, next) => {
  try {
    const {
      user: { userId, role },
    } = req;

    const query = {
      deleted: false,
      'frozen.isFrozen': true,
    };

    const canOnlySeeAssigned = role.permissions.students.assignedOnly;
    if (canOnlySeeAssigned) {
      query['assigned.counselor'] = userId;
    }

    const students = await Students.find(query)
      .populate('assigned.counselor', 'name email')
      .populate('frozen.frozenBy', 'name email')
      .sort({ 'frozen.frozenAt': -1 })
      .limit(100);

    res.status(200).json({ status: 'success', students });
  } catch (err) {
    next(err);
  }
};

// Get locked students list
export const getLockedStudents = async (req, res, next) => {
  try {
    const {
      user: { role },
    } = req;

    // Only admins and super admins can access locked students
    const isAdmin = role.name === 'Admin' || role.name === 'Super Admin';
    if (!isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required.',
      });
    }

    const query = {
      deleted: false,
      'locked.isLocked': true,
    };

    const students = await Students.find(query)
      .populate('assigned.counselor', 'name email')
      .populate('locked.lockedBy', 'name email')
      .sort({ 'locked.lockedAt': -1 })
      .limit(100);

    res.status(200).json({ status: 'success', students });
  } catch (err) {
    next(err);
  }
};

// Freeze a student
export const freezeStudent = async (req, res, next) => {
  try {
    const {
      params: { id },
      body: { reason, notes, frozenUntil },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Students.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    if (student.frozen.isFrozen) {
      throw new Error('Student is already frozen');
    }

    student.freezeStudent(userId, reason, notes, frozenUntil);
    await student.save();

    res.status(200).json({ status: 'success', message: 'Student frozen successfully', student });
  } catch (err) {
    next(err);
  }
};

// Unfreeze a student
export const unfreezeStudent = async (req, res, next) => {
  try {
    const {
      params: { id },
      body: { notes },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Students.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    if (!student.frozen.isFrozen) {
      throw new Error('Student is not frozen');
    }

    student.unfreezeStudent(userId, notes);
    await student.save();

    res.status(200).json({ status: 'success', message: 'Student unfrozen successfully', student });
  } catch (err) {
    next(err);
  }
};

// Lock a student
export const lockStudent = async (req, res, next) => {
  try {
    const {
      params: { id },
      body: { reason, notes },
      user: { userId, role },
    } = req;

    // Only admins and super admins can lock students
    const isAdmin = role.name === 'Admin' || role.name === 'Super Admin';
    if (!isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required to lock students.',
      });
    }

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Students.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    if (student.locked.isLocked) {
      throw new Error('Student is already locked');
    }

    student.lockStudent(userId, reason, notes, role.name);
    await student.save();

    res.status(200).json({ status: 'success', message: 'Student locked successfully', student });
  } catch (err) {
    next(err);
  }
};

// Unlock a student
export const unlockStudent = async (req, res, next) => {
  try {
    const {
      params: { id },
      body: { notes },
      user: { userId, role },
    } = req;

    // Only admins and super admins can unlock students
    const isAdmin = role.name === 'Admin' || role.name === 'Super Admin';
    if (!isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin privileges required to unlock students.',
      });
    }

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Students.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    if (!student.locked.isLocked) {
      throw new Error('Student is not locked');
    }

    student.unlockStudent(userId, notes);
    await student.save();

    res.status(200).json({ status: 'success', message: 'Student unlocked successfully', student });
  } catch (err) {
    next(err);
  }
};

// Get checklist progress for a student
export const getChecklistProgress = async (req, res, next) => {
  try {
    const {
      params: { id },
      query: { stage },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Students.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    let progress;
    if (stage) {
      // Get progress for specific stage
      progress = calculateChecklistProgress(student, stage);
    } else {
      // Get progress for current stage
      progress = calculateChecklistProgress(student, student.currentStage);
    }

    res.status(200).json({ status: 'success', progress });
  } catch (err) {
    next(err);
  }
};

// Update checklist item (mark as complete/incomplete or schedule)
export const updateChecklistItem = async (req, res, next) => {
  try {
    const {
      params: { id },
      body: { stage, itemId, itemType, completed, notes, scheduledAt, completedAt },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid student ID');

    const student = await Students.findOne({ _id: id, deleted: false });
    if (!student) throw new Error('Student not found');

    // Handle scheduling
    if (scheduledAt !== undefined && itemType === 'task') {
      const checklist = student.stageChecklists.get(stage);
      if (!checklist) throw new Error('Checklist not found for this stage');

      const taskItem = checklist.tasks.find(t => t.itemId === itemId);
      if (!taskItem) throw new Error('Task item not found');

      taskItem.scheduledAt = scheduledAt ? new Date(scheduledAt) : undefined;
      student.markModified('stageChecklists');

      await student.save();

      return res.status(200).json({ status: 'success', message: 'Task scheduled successfully', student });
    }

    // Handle completion/incompletion
    if (itemType === 'task') {
      if (completed) {
        const checklist = student.stageChecklists.get(stage);
        if (!checklist) {
          // Initialize checklist if not exists
          const stageChecklist = getChecklistForStage(stage);
          if (stageChecklist) {
            student.initializeStageChecklist(stage, stageChecklist);
          }
        }

        const success = student.completeChecklistTask(stage, itemId, userId, notes);
        if (!success) throw new Error('Failed to update task checklist item');

        // If custom completion date is provided, update it
        if (completedAt) {
          const checklist = student.stageChecklists.get(stage);
          const taskItem = checklist.tasks.find(t => t.itemId === itemId);
          if (taskItem) {
            taskItem.completedAt = new Date(completedAt);
            student.markModified('stageChecklists');
          }
        }
      } else {
        // Uncomplete task - find and update
        const checklist = student.stageChecklists.get(stage);
        if (checklist) {
          const taskItem = checklist.tasks.find(t => t.itemId === itemId);
          if (taskItem) {
            taskItem.completed = false;
            taskItem.completedAt = undefined;
            taskItem.completedBy = undefined;
            student.markModified('stageChecklists');
          }
        }
      }
    } else if (itemType === 'document') {
      // Document items are automatically checked when documents are uploaded
      throw new Error('Document checklist items are auto-checked when documents are uploaded');
    }

    await student.save();

    res.status(200).json({ status: 'success', message: 'Checklist item updated successfully', student });
  } catch (err) {
    next(err);
  }
};
