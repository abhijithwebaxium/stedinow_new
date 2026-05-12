import axios from 'axios';

/**
 * Service to handle WhatsApp communications via WATI API
 */
const sendWhatsAppMessage = async (phone, message) => {
  const watiToken = process.env.WATI_TOKEN;
  const watiEndpoint = process.env.WATI_API_ENDPOINT;

  if (!watiToken || watiToken.includes('YOUR_NEW_WATI_TOKEN')) {
    console.warn('[WATI Service] WhatsApp integration is not configured in .env');
    return { success: false, message: 'WhatsApp integration not configured' };
  }

  try {
    // Clean phone number (remove +, spaces, etc.)
    const cleanPhone = phone.replace(/\D/g, '');

    const response = await axios.post(`${watiEndpoint}/api/v1/sendSessionMessage/${cleanPhone}`, null, {
      params: { messageText: message },
      headers: {
        'Authorization': `Bearer ${watiToken}`,
        'Content-Type': 'application/json'
      },
    });

    return { 
      success: true, 
      data: response.data 
    };
  } catch (error) {
    console.error('[WATI Service] API Error:', error.response?.data || error.message);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to send WhatsApp message' 
    };
  }
};

/**
 * Send a template message (usually for initial contact or formal updates)
 */
const sendWhatsAppTemplate = async (phone, templateName, parameters) => {
  const watiToken = process.env.WATI_TOKEN;
  const watiEndpoint = process.env.WATI_API_ENDPOINT;

  if (!watiToken || watiToken.includes('YOUR_NEW_WATI_TOKEN')) {
    return { success: false, message: 'WhatsApp integration not configured' };
  }

  try {
    const cleanPhone = phone.replace(/\D/g, '');

    const response = await axios.post(`${watiEndpoint}/api/v1/sendTemplateMessage`, {
      template_name: templateName,
      broadcast_name: `Automated_${templateName}`,
      parameters: parameters, // Array of { name, value }
      receiver_number: cleanPhone
    }, {
      headers: {
        'Authorization': `Bearer ${watiToken}`,
        'Content-Type': 'application/json'
      },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('[WATI Service] Template Error:', error.response?.data || error.message);
    return { success: false, message: 'Failed to send template' };
  }
};

export default {
  sendWhatsAppMessage,
  sendWhatsAppTemplate
};
