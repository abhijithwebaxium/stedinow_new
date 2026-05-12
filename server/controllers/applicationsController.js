import Application from '../models/application.js';
import Student from '../models/student.js';
import { isValidObjectId } from '../helper/indexHelper.js';

// Get all applications for a specific student
export const getStudentApplications = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) throw new Error('Invalid student ID');

    // Verify student exists
    const student = await Student.findOne({ _id: studentId, deleted: false });
    if (!student) throw new Error('Student not found');

    const applications = await Application.find({ student: studentId })
      .populate('handledBy', 'name email')
      .populate('university.universityId', 'name country city')
      .populate('course.courseId', 'name level duration')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', applications });
  } catch (err) {
    next(err);
  }
};

// Get single application
export const getApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) throw new Error('Invalid application ID');

    const application = await Application.findById(id)
      .populate('student', 'name email studentId')
      .populate('handledBy', 'name email')
      .populate('university.universityId', 'name country city')
      .populate('course.courseId', 'name level duration')
      .populate('documents');

    if (!application) throw new Error('Application not found');

    res.status(200).json({ status: 'success', application });
  } catch (err) {
    next(err);
  }
};

// Create new application
export const createApplication = async (req, res, next) => {
  try {
    const {
      params: { studentId },
      body: { universityId, courseId, intake, notes },
      user: { userId },
    } = req;

    if (!isValidObjectId(studentId)) throw new Error('Invalid student ID');

    // Verify student exists
    const student = await Student.findOne({ _id: studentId, deleted: false });
    if (!student) throw new Error('Student not found');

    // Generate application ID
    const count = await Application.countDocuments({});
    const applicationId = `APP-${String(count + 1).padStart(6, '0')}`;

    // Fetch university and course details
    const University = (await import('../models/university.js')).default;
    const Course = (await import('../models/course.js')).default;

    const university = await University.findById(universityId).populate('country', 'name code');
    if (!university) throw new Error('University not found');

    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    // Initialize application stages
    const initialStages = [
      { name: 'Document Collection', status: 'In Progress', startDate: new Date() },
      { name: 'Document Verification', status: 'Pending' },
      { name: 'Application Submission', status: 'Pending' },
      { name: 'Awaiting Response', status: 'Pending' },
      { name: 'Conditional Offer Received', status: 'Pending' },
      { name: 'Offer Letter Received', status: 'Pending' },
    ];

    // Create application
    const application = await Application.create({
      student: studentId,
      applicationId,
      university: {
        name: university.name,
        country: university.country?.name || 'Unknown',
        city: university.city || '',
        universityId: university._id,
      },
      course: {
        name: course.name,
        level: course.level,
        duration: course.duration || '',
        courseId: course._id,
      },
      intake,
      status: 'Draft',
      currentStage: 'Document Collection',
      stages: initialStages,
      handledBy: userId,
      notes: notes || '',
      applicationDate: new Date(),
      timeline: [
        {
          event: 'Application Created',
          date: new Date(),
          notes: 'Application record created',
          updatedBy: userId,
        },
      ],
      history: [
        {
          type: 'Created',
          date: new Date(),
          notes: 'Application created',
          actionDoneBy: userId,
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      message: 'Application created successfully',
      application,
    });
  } catch (err) {
    next(err);
  }
};

// Update application
export const updateApplication = async (req, res, next) => {
  try {
    const {
      params: { id },
      body,
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid application ID');

    const application = await Application.findById(id);
    if (!application) throw new Error('Application not found');

    // Track status changes
    const oldStatus = application.status;
    const newStatus = body.status;

    // Update fields
    Object.assign(application, body);

    // Add to history
    application.history.push({
      type: 'Updated',
      date: new Date(),
      notes: body.notes || 'Application updated',
      actionDoneBy: userId,
    });

    // If status changed, add to timeline
    if (newStatus && oldStatus !== newStatus) {
      application.timeline.push({
        event: `Status changed to ${newStatus}`,
        date: new Date(),
        notes: body.notes || '',
        updatedBy: userId,
      });

      // Update specific dates based on status
      if (newStatus === 'Submitted') {
        application.submissionDate = new Date();
      } else if (newStatus === 'Conditional Offer' || newStatus === 'Unconditional Offer') {
        application.decisionDate = new Date();
        application.offerLetterReceived = true;
        application.offerLetterDate = new Date();
        application.offerType = newStatus === 'Conditional Offer' ? 'Conditional' : 'Unconditional';
      } else if (newStatus === 'Rejected') {
        application.decisionDate = new Date();
      }
    }

    await application.save();

    res.status(200).json({
      status: 'success',
      message: 'Application updated successfully',
      application,
    });
  } catch (err) {
    next(err);
  }
};

// Delete application
export const deleteApplication = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid application ID');

    const application = await Application.findById(id);
    if (!application) throw new Error('Application not found');

    // Add final history entry before deleting
    application.history.push({
      type: 'Deleted',
      date: new Date(),
      notes: 'Application deleted',
      actionDoneBy: userId,
    });

    await application.save();
    await Application.deleteOne({ _id: id });

    res.status(200).json({
      status: 'success',
      message: 'Application deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// Add follow-up to application
export const addApplicationFollowup = async (req, res, next) => {
  try {
    const {
      params: { id },
      body: { event, notes },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid application ID');

    const application = await Application.findById(id);
    if (!application) throw new Error('Application not found');

    // Add to timeline
    application.timeline.push({
      event: event || 'Follow-up',
      date: new Date(),
      notes: notes || '',
      updatedBy: userId,
    });

    // Add to history
    application.history.push({
      type: 'Follow-up Added',
      date: new Date(),
      notes: notes || 'Follow-up recorded',
      actionDoneBy: userId,
    });

    await application.save();

    res.status(200).json({
      status: 'success',
      message: 'Follow-up added successfully',
      application,
    });
  } catch (err) {
    next(err);
  }
};

// Initialize stages for an application (for existing applications without stages)
export const initializeApplicationStages = async (req, res, next) => {
  try {
    const { params: { id }, user: { userId } } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid application ID');

    const application = await Application.findById(id);
    if (!application) throw new Error('Application not found');

    // Check if stages already exist
    if (application.stages && application.stages.length > 0) {
      return res.status(200).json({
        status: 'success',
        message: 'Stages already initialized',
        application,
      });
    }

    // Initialize stages
    const initialStages = [
      { name: 'Document Collection', status: 'In Progress', startDate: new Date() },
      { name: 'Document Verification', status: 'Pending' },
      { name: 'Application Submission', status: 'Pending' },
      { name: 'Awaiting Response', status: 'Pending' },
      { name: 'Conditional Offer Received', status: 'Pending' },
      { name: 'Offer Letter Received', status: 'Pending' },
    ];

    application.stages = initialStages;
    application.currentStage = 'Document Collection';

    // Add to timeline
    application.timeline.push({
      event: 'Stages Initialized',
      date: new Date(),
      notes: 'Application stages tracking initialized',
      updatedBy: userId,
    });

    await application.save();

    res.status(200).json({
      status: 'success',
      message: 'Stages initialized successfully',
      application,
    });
  } catch (err) {
    next(err);
  }
};

// Update application stage
export const updateApplicationStage = async (req, res, next) => {
  try {
    const {
      params: { id },
      body: { stageName, stageStatus, notes },
      user: { userId },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid application ID');

    const application = await Application.findById(id);
    if (!application) throw new Error('Application not found');

    // Find the stage
    const stageIndex = application.stages.findIndex(s => s.name === stageName);
    if (stageIndex === -1) throw new Error('Stage not found');

    const stage = application.stages[stageIndex];
    const oldStatus = stage.status;

    // Update stage
    stage.status = stageStatus;
    if (stageStatus === 'In Progress' && !stage.startDate) {
      stage.startDate = new Date();
    }
    if (stageStatus === 'Completed') {
      stage.completedDate = new Date();
      stage.completedBy = userId;
    }
    if (notes) {
      stage.notes = notes;
    }

    // Update current stage
    if (stageStatus === 'In Progress') {
      application.currentStage = stageName;
    } else if (stageStatus === 'Completed') {
      // Move to next pending stage if available
      const nextStage = application.stages.find(s => s.status === 'Pending');
      if (nextStage) {
        application.currentStage = nextStage.name;
        nextStage.status = 'In Progress';
        nextStage.startDate = new Date();
      } else {
        application.currentStage = 'Completed';
      }
    }

    // Add to timeline
    application.timeline.push({
      event: `Stage "${stageName}" ${stageStatus}`,
      date: new Date(),
      notes: notes || '',
      updatedBy: userId,
    });

    // Add to history
    application.history.push({
      type: 'Stage Updated',
      date: new Date(),
      notes: `${stageName}: ${oldStatus} → ${stageStatus}`,
      actionDoneBy: userId,
    });

    await application.save();

    res.status(200).json({
      status: 'success',
      message: 'Stage updated successfully',
      application,
    });
  } catch (err) {
    next(err);
  }
};
