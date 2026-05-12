import { getChecklistForStage, STAGE_CHECKLISTS } from '../config/constants.js';

/**
 * Validate if a student can move to the next stage based on checklist completion
 * @param {Object} student - Student document
 * @param {String} currentStage - Current stage
 * @returns {Object} - { canProgress: boolean, missingItems: [] }
 */
export const validateStageProgression = (student, currentStage) => {
  const checklistTemplate = getChecklistForStage(currentStage);

  if (!checklistTemplate || (!checklistTemplate.documents.length && !checklistTemplate.tasks.length)) {
    return { canProgress: true, missingItems: [] };
  }

  const missingItems = [];
  const checklist = student.stageChecklists?.get(currentStage);

  if (!checklist) {
    // No checklist initialized - all items are missing
    checklistTemplate.documents
      .filter(d => d.required)
      .forEach(doc => missingItems.push({ type: 'document', label: doc.label }));

    checklistTemplate.tasks
      .filter(t => t.required)
      .forEach(task => missingItems.push({ type: 'task', label: task.label }));

    return { canProgress: false, missingItems };
  }

  // Check required documents
  checklistTemplate.documents
    .filter(d => d.required)
    .forEach(reqDoc => {
      const docItem = checklist.documents?.find(d => d.itemId === reqDoc.id);
      if (!docItem || !docItem.completed) {
        missingItems.push({ type: 'document', label: reqDoc.label });
      }
    });

  // Check required tasks
  checklistTemplate.tasks
    .filter(t => t.required)
    .forEach(reqTask => {
      const taskItem = checklist.tasks?.find(t => t.itemId === reqTask.id);
      if (!taskItem || !taskItem.completed) {
        missingItems.push({ type: 'task', label: reqTask.label });
      }
    });

  return {
    canProgress: missingItems.length === 0,
    missingItems,
  };
};

/**
 * Calculate checklist completion percentage for a stage
 * @param {Object} student - Student document
 * @param {String} stage - Stage to calculate for
 * @returns {Object} - { totalItems, completedItems, percentage, details }
 */
export const calculateChecklistProgress = (student, stage) => {
  const checklistTemplate = getChecklistForStage(stage);
  const checklist = student.stageChecklists?.get(stage);

  if (!checklistTemplate) {
    return { totalItems: 0, completedItems: 0, percentage: 0, details: { documents: [], tasks: [] } };
  }

  // Get all completed document types from all previous stages
  const completedDocumentTypes = new Set();
  if (student.stageChecklists) {
    for (const [stageName, stageChecklist] of student.stageChecklists.entries()) {
      // Only check stages that are different from current stage
      if (stageName !== stage && stageChecklist.documents) {
        stageChecklist.documents.forEach(doc => {
          if (doc.completed) {
            // Find the document type from the stage checklist template
            const stageTemplate = getChecklistForStage(stageName);
            if (stageTemplate) {
              const docTemplate = stageTemplate.documents.find(d => d.id === doc.itemId);
              if (docTemplate) {
                completedDocumentTypes.add(docTemplate.type);
              }
            }
          }
        });
      }
    }
  }

  // Filter out documents that have already been collected in other stages
  const filteredDocuments = checklistTemplate.documents.filter(doc => {
    return !completedDocumentTypes.has(doc.type);
  });

  const totalDocuments = filteredDocuments.length;
  const totalTasks = checklistTemplate.tasks.length;
  const totalItems = totalDocuments + totalTasks;

  let completedDocuments = 0;
  let completedTasks = 0;

  const documentDetails = filteredDocuments.map(doc => {
    const item = checklist?.documents?.find(d => d.itemId === doc.id);
    const isCompleted = item?.completed || false;
    if (isCompleted) completedDocuments++;

    return {
      id: doc.id,
      label: doc.label,
      type: doc.type,
      required: doc.required,
      completed: isCompleted,
      completedAt: item?.completedAt,
      completedBy: item?.completedBy,
      documentId: item?.documentId,
    };
  });

  const taskDetails = checklistTemplate.tasks.map(task => {
    const item = checklist?.tasks?.find(t => t.itemId === task.id);
    const isCompleted = item?.completed || false;
    if (isCompleted) completedTasks++;

    return {
      id: task.id,
      label: task.label,
      required: task.required,
      completed: isCompleted,
      completedAt: item?.completedAt,
      completedBy: item?.completedBy,
      scheduledAt: item?.scheduledAt,
      notes: item?.notes,
    };
  });

  const completedItems = completedDocuments + completedTasks;
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    totalItems,
    completedItems,
    percentage,
    details: {
      documents: documentDetails,
      tasks: taskDetails,
    },
  };
};

/**
 * Get all checklists for a student across all stages
 * @param {Object} student - Student document
 * @returns {Array} - Array of stage checklists with progress
 */
export const getAllChecklistsProgress = (student) => {
  const stages = [
    'Lead Capture & Qualification',
    'Initial Assessment & Counselling',
    'Conversion Decision',
    'Student Registration',
    'Application Submission',
    'Offer Management',
    'Financial Arrangements',
    'Visa Processing',
    'Pre-Departure Readiness',
    'Arrival & Initial Setup',
    'Academic Integration',
    'File Completion',
  ];

  return stages.map(stage => ({
    stage,
    ...calculateChecklistProgress(student, stage),
  }));
};

/**
 * Auto-check document checklist items when a document is uploaded
 * @param {Object} student - Student document
 * @param {String} documentType - Type of document uploaded
 * @param {String} documentId - ID of uploaded document
 * @param {String} userId - ID of user who uploaded
 * @returns {Array} - Array of stages where checklist items were auto-checked
 */
export const autoCheckDocumentItems = (student, documentType, documentId, userId) => {
  const updatedStages = [];

  console.log('Auto-check called with documentType:', documentType);
  console.log('Student current stage:', student.currentStage);

  // Iterate through all stages to find matching document types
  for (const [stageName, checklist] of Object.entries(STAGE_CHECKLISTS)) {
    const matchingDocs = checklist.documents.filter(doc => doc.type === documentType);

    console.log(`Stage ${stageName}: Found ${matchingDocs.length} matching documents`);

    for (const doc of matchingDocs) {
      console.log(`Trying to complete checklist item ${doc.id} in stage ${stageName}`);

      // Initialize checklist for this stage if it doesn't exist OR if it's missing documents
      const existingChecklist = student.stageChecklists.get(stageName);
      if (!existingChecklist) {
        console.log(`Initializing checklist for stage ${stageName}`);
        student.initializeStageChecklist(stageName, checklist);
      } else {
        // Check if the document item exists in the checklist
        const hasDocumentItem = existingChecklist.documents?.some(d => d.itemId === doc.id);

        console.log(`Checklist already exists for ${stageName}:`, {
          documentsCount: existingChecklist.documents?.length || 0,
          tasksCount: existingChecklist.tasks?.length || 0,
          documentIds: existingChecklist.documents?.map(d => d.itemId) || [],
          hasThisDocument: hasDocumentItem
        });

        // If document item is missing, add it to the checklist
        if (!hasDocumentItem) {
          console.log(`Adding missing document item ${doc.id} to ${stageName} checklist`);
          if (!existingChecklist.documents) {
            existingChecklist.documents = [];
          }
          existingChecklist.documents.push({
            itemId: doc.id,
            completed: false,
          });
          student.markModified('stageChecklists');
        }
      }

      // Try to complete the checklist item
      const success = student.completeChecklistDocument(stageName, doc.id, userId, documentId);

      console.log(`Result: ${success ? 'success' : 'failed'}`);

      if (success) {
        updatedStages.push(stageName);
      }
    }
  }

  console.log('Auto-check completed. Updated stages:', updatedStages);

  return updatedStages;
};

export default {
  validateStageProgression,
  calculateChecklistProgress,
  getAllChecklistsProgress,
  autoCheckDocumentItems,
};
