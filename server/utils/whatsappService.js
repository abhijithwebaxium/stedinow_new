import axios from 'axios';
import config from '../config/index.js';

/**
 * Format phone number to WhatsApp format
 * Adds +91 country code if not present
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;

  const cleaned = phone.toString().trim().replace(/\s+/g, '');

  // If already has +91 or 91, return as is
  if (cleaned.startsWith('+91')) {
    return cleaned.substring(1); // Remove + for WATI
  }
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned;
  }

  // Add 91 prefix for Indian numbers
  return `91${cleaned}`;
};

/**
 * Send WhatsApp template message using WATI API
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} templateName - WATI template name
 * @param {Array} parameters - Template parameters [{name: "1", value: "John"}, ...]
 */
export const sendTemplateMessage = async (phoneNumber, templateName, parameters = []) => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!formattedPhone) {
      throw new Error('Invalid phone number');
    }

    const { token, endpoint } = config.wati;

    if (!token || !endpoint) {
      console.error('WATI credentials not configured');
      return { success: false, error: 'WATI not configured' };
    }

    const templateData = {
      template_name: templateName,
      broadcast_name: templateName,
      parameters: parameters,
    };

    const response = await axios.post(
      `${endpoint}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`,
      templateData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log(`WhatsApp sent to ${formattedPhone}: ${templateName}`, response.data);

    return {
      success: true,
      data: response.data,
      phoneNumber: formattedPhone,
    };
  } catch (error) {
    const errorDetails = {
      phoneNumber,
      templateName,
      error: error.response?.data || error.message,
      statusCode: error.response?.status,
      fullError: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      } : null,
    };

    console.error('WhatsApp send error:', JSON.stringify(errorDetails, null, 2));

    return {
      success: false,
      error: error.response?.data || error.message,
      phoneNumber,
    };
  }
};

/**
 * Send stage notification to student
 * @param {Object} student - Student object with name, phone, etc.
 * @param {string} stageName - Current stage name
 * @param {string} counselorName - Assigned counselor name
 */
export const sendStageNotification = async (student, stageName, counselorName) => {
  try {
    // Get template name based on stage
    const templateName = getTemplateNameForStage(stageName);

    if (!templateName) {
      console.log(`No WhatsApp template configured for stage: ${stageName}`);
      return { success: false, error: 'No template for stage' };
    }

    // Prepare template parameters
    const studentName = student.name || 'Student';
    const parameters = [
      { name: '1', value: studentName },
      { name: '2', value: stageName },
      { name: '3', value: counselorName || 'Your counselor' },
    ];

    // Send message
    return await sendTemplateMessage(student.phone, templateName, parameters);
  } catch (error) {
    console.error('Error sending stage notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Map stage names to WATI template names
 * TODO: Update these template names based on your WATI dashboard templates
 */
const getTemplateNameForStage = (stageName) => {
  // TEMPORARILY using 'hello_world' template for testing
  // This is a default template that should exist in WATI
  // TODO: Replace with actual stage templates once created in WATI dashboard
  return 'hello_world';

  /* UNCOMMENT THIS WHEN YOU CREATE TEMPLATES IN WATI:
  const stageTemplateMap = {
    // Phase 1: Enrollment
    'Lead Qualification': 'stage_lead_qualification',
    'Initial Assessment': 'stage_initial_assessment',
    'Enrollment Confirmed': 'stage_enrollment_confirmed',

    // Phase 2: Application Preparation
    'Document Collection': 'stage_document_collection',
    'Profile Building': 'stage_profile_building',
    'University Selection': 'stage_university_selection',

    // Phase 3: Application Submission
    'Application Drafting': 'stage_application_drafting',
    'Application Submission': 'stage_application_submitted',
    'Offer Received': 'stage_offer_received',

    // Phase 4: Visa Processing
    'Financial Arrangements': 'stage_financial_arrangements',
    'Visa Processing': 'stage_visa_processing',
    'Pre-Departure Readiness': 'stage_pre_departure',

    // Phase 5: Travel & Settlement
    'Arrival & Initial Setup': 'stage_arrival_setup',
    'Academic Integration': 'stage_academic_integration',
    'File Completion': 'stage_file_completion',
  };

  return stageTemplateMap[stageName] || null;
  */
};

/**
 * Send payment confirmation message
 * @param {Object} student - Student object
 * @param {Object} payment - Payment details
 */
export const sendPaymentConfirmation = async (student, payment) => {
  try {
    const templateName = 'payment_confirmation'; // Update with your WATI template name

    const parameters = [
      { name: '1', value: student.name || 'Student' },
      { name: '2', value: payment.paymentType },
      { name: '3', value: `${payment.currency} ${payment.amount}` },
      { name: '4', value: payment.invoiceNumber },
    ];

    return await sendTemplateMessage(student.phone, templateName, parameters);
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send document upload reminder
 * @param {Object} student - Student object
 * @param {string} documentType - Type of document needed
 */
export const sendDocumentReminder = async (student, documentType) => {
  try {
    const templateName = 'document_reminder'; // Update with your WATI template name

    const parameters = [
      { name: '1', value: student.name || 'Student' },
      { name: '2', value: documentType },
    ];

    return await sendTemplateMessage(student.phone, templateName, parameters);
  } catch (error) {
    console.error('Error sending document reminder:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendTemplateMessage,
  sendStageNotification,
  sendPaymentConfirmation,
  sendDocumentReminder,
  formatPhoneNumber,
};
