import nodemailer from 'nodemailer';
import config from '../config/index.js';

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
};

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {Array} options.attachments - Attachments array
 */
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'StediNow',
        address: config.email.user,
      },
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent to ${options.to}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error('Email send error:', {
      to: options.to,
      subject: options.subject,
      error: error.message,
    });

    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send stage change notification email to student
 * @param {Object} student - Student object
 * @param {string} stageName - New stage name
 * @param {string} counselorName - Counselor name
 */
export const sendStageChangeEmail = async (student, stageName, counselorName) => {
  try {
    const subject = `Your Application Progress - ${stageName}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #7C3AED 0%, #6B2FD6 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .stage-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #7C3AED;
            border-radius: 5px;
          }
          .button {
            display: inline-block;
            background: #7C3AED;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 StediNow</h1>
            <p>Your Study Abroad Journey</p>
          </div>
          <div class="content">
            <h2>Hi ${student.name},</h2>
            <p>Great news! Your application has progressed to a new stage.</p>

            <div class="stage-box">
              <h3>📍 Current Stage</h3>
              <h2 style="color: #7C3AED; margin: 10px 0;">${stageName}</h2>
            </div>

            <p><strong>Your counselor ${counselorName}</strong> will guide you through the next steps.</p>

            <p>If you have any questions or concerns, please don't hesitate to reach out to your counselor.</p>

            <a href="https://stedinow-new.vercel.app/student/login" class="button" style="color: #ffffff !important; text-decoration: none;">View Your Application</a>

            <div class="footer">
              <p>This is an automated email from StediNow.</p>
              <p>📧 Email: admin@stedinow.com | 📞 Phone: 0484 461 4539</p>
              <p>&copy; ${new Date().getFullYear()} StediNow. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hi ${student.name},

Great news! Your application has progressed to: ${stageName}

Your counselor ${counselorName} will guide you through the next steps.

If you have any questions, please contact us.

Best regards,
StediNow Team
    `;

    return await sendEmail({
      to: student.email,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Error sending stage change email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send payment confirmation email
 * @param {Object} student - Student object
 * @param {Object} payment - Payment details
 */
export const sendPaymentConfirmationEmail = async (student, payment) => {
  try {
    const subject = `Payment Receipt - ${payment.invoiceNumber}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #7C3AED 0%, #6B2FD6 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .payment-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            border: 1px solid #ddd;
          }
          .payment-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .payment-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            color: #7C3AED;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Received</h1>
            <p>Thank you for your payment!</p>
          </div>
          <div class="content">
            <h2>Hi ${student.name},</h2>
            <p>We have successfully received your payment. Here are the details:</p>

            <div class="payment-box">
              <div class="payment-row">
                <span>Invoice Number:</span>
                <span><strong>${payment.invoiceNumber}</strong></span>
              </div>
              <div class="payment-row">
                <span>Payment Type:</span>
                <span>${payment.paymentType}</span>
              </div>
              <div class="payment-row">
                <span>Payment Method:</span>
                <span>${payment.paymentMethod || 'N/A'}</span>
              </div>
              <div class="payment-row">
                <span>Payment Date:</span>
                <span>${new Date(payment.paymentDate).toLocaleDateString()}</span>
              </div>
              <div class="payment-row">
                <span>Amount Paid:</span>
                <span>${payment.currency} ${payment.amount.toLocaleString()}</span>
              </div>
            </div>

            <p>Your receipt has been recorded in our system. You can view and download your receipt anytime from your student portal.</p>

            <p>If you have any questions regarding this payment, please contact us.</p>

            <div class="footer">
              <p>This is an automated receipt from StediNow.</p>
              <p>📧 Email: admin@stedinow.com | 📞 Phone: 0484 461 4539</p>
              <p>&copy; ${new Date().getFullYear()} StediNow. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hi ${student.name},

Payment Received Successfully!

Invoice Number: ${payment.invoiceNumber}
Payment Type: ${payment.paymentType}
Amount: ${payment.currency} ${payment.amount}
Payment Date: ${new Date(payment.paymentDate).toLocaleDateString()}

Thank you for your payment.

Best regards,
StediNow Team
    `;

    return await sendEmail({
      to: student.email,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send document upload notification email
 * @param {Object} student - Student object
 * @param {string} documentType - Type of document uploaded
 */
export const sendDocumentUploadEmail = async (student, documentType) => {
  try {
    const subject = `Document Uploaded - ${documentType}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #7C3AED 0%, #6B2FD6 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 Document Received</h1>
          </div>
          <div class="content">
            <h2>Hi ${student.name},</h2>
            <p>We have successfully received your document: <strong>${documentType}</strong></p>
            <p>Our team will review it shortly and update you on the status.</p>
            <p>Thank you for your prompt submission!</p>

            <div class="footer">
              <p>This is an automated email from StediNow.</p>
              <p>📧 Email: admin@stedinow.com | 📞 Phone: 0484 461 4539</p>
              <p>&copy; ${new Date().getFullYear()} StediNow. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hi ${student.name},

We have successfully received your document: ${documentType}

Our team will review it shortly and update you on the status.

Thank you!

Best regards,
StediNow Team
    `;

    return await sendEmail({
      to: student.email,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Error sending document upload email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new student
 * @param {Object} student - Student object
 */
export const sendWelcomeEmail = async (student) => {
  try {
    const subject = 'Welcome to StediNow - Your Study Abroad Journey Begins!';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #7C3AED 0%, #6B2FD6 100%);
            color: white;
            padding: 40px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #7C3AED;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .info-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            border-left: 4px solid #7C3AED;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Welcome to StediNow!</h1>
            <p>Your Study Abroad Journey Starts Here</p>
          </div>
          <div class="content">
            <h2>Hi ${student.name},</h2>
            <p>Congratulations on taking the first step towards your international education!</p>

            <div class="info-box">
              <h3>Your Student ID</h3>
              <h2 style="color: #7C3AED; margin: 10px 0;">${student.studentId}</h2>
            </div>

            <p>We're excited to guide you through every step of your study abroad journey. Our dedicated team will be with you from application to arrival.</p>

            <h3>What's Next?</h3>
            <ul>
              <li>Your counselor will contact you within 24 hours</li>
              <li>We'll start collecting necessary documents</li>
              <li>Together, we'll select the best universities for you</li>
              <li>We'll handle all application processes</li>
            </ul>

            <p>You can track your progress and upload documents through our student portal.</p>

            <a href="https://stedinow-new.vercel.app/student/login" class="button" style="color: #ffffff !important; text-decoration: none;">Access Student Portal</a>

            <div class="footer">
              <p><strong>Contact Us</strong></p>
              <p>📧 Email: admin@stedinow.com</p>
              <p>📞 Phone: 0484 461 4539, +91 9567 999 4549</p>
              <p>🌐 Website: www.stedinow.com</p>
              <p>&copy; ${new Date().getFullYear()} StediNow. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hi ${student.name},

Welcome to StediNow!

Your Student ID: ${student.studentId}

We're excited to guide you through your study abroad journey.

What's Next?
- Your counselor will contact you within 24 hours
- We'll start collecting necessary documents
- Together, we'll select the best universities for you
- We'll handle all application processes

Contact Us:
Email: admin@stedinow.com
Phone: 0484 461 4539, +91 9567 999 4549

Best regards,
StediNow Team
    `;

    return await sendEmail({
      to: student.email,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendEmail,
  sendStageChangeEmail,
  sendPaymentConfirmationEmail,
  sendDocumentUploadEmail,
  sendWelcomeEmail,
};
