import Student from '../models/Student.js';
import Document from '../models/document.js';
import Application from '../models/application.js';
import University from '../models/university.js';
import StudentMessage from '../models/studentMessage.js';
import StudentTask from '../models/studentTask.js';
import ChatConversation from '../models/chatConversation.js';
import ChatMessage from '../models/chatMessage.js';
import { getIO } from '../utils/socket.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import fs from 'fs';
import { notifyStudent, notifyAdmin, broadcastAdmin } from '../utils/notificationHelper.js';

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const studentLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const student = await Student.findOne({ email: email.toLowerCase(), deleted: false });
    if (!student) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    // Check hashed password first; fall back to plain phone for legacy accounts
    let valid = false;
    if (student.studentPassword) {
      valid = await bcrypt.compare(password, student.studentPassword);
    } else {
      valid = student.phone === password;
    }

    if (!valid) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: student._id, email: student.email, type: 'student' },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('student_access_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      mustChangePassword: !student.hasChangedPassword,
      user: { id: student._id, name: student.name, email: student.email, type: 'student' },
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters' });
    }
    const hashed = await bcrypt.hash(newPassword, 12);
    await Student.findByIdAndUpdate(req.user.id, {
      studentPassword: hashed,
      hasChangedPassword: true,
    });
    res.json({ status: 'success', message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────

export const getStudentMe = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ status: 'error', message: 'Student not found' });
    res.status(200).json({ status: 'success', student });
  } catch (err) {
    next(err);
  }
};

// Strict whitelist — students can only update these fields
const ALLOWED_FIELDS = ['name', 'phone', 'personalInfo', 'academics', 'preferences'];

export const updateStudentProfile = async (req, res, next) => {
  try {
    const update = {};
    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ status: 'error', message: 'No valid fields to update' });
    }
    const student = await Student.findByIdAndUpdate(req.user.id, { $set: update }, { new: true });
    res.status(200).json({ status: 'success', student });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────────────

export const getStudentDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ student: req.user.id }).sort({ uploadedDate: -1 });
    res.json({ status: 'success', documents });
  } catch (err) {
    next(err);
  }
};

export const uploadStudentDocument = async (req, res, next) => {
  try {
    const { documentType } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    if (!documentType) return res.status(400).json({ status: 'error', message: 'Document type is required' });

    const fileUrl = file.location || file.path;

    // Delete existing document of same type and log replacement
    const existing = await Document.findOne({ student: req.user.id, documentType });
    if (existing) {
      await Document.deleteOne({ _id: existing._id });
      await Student.findByIdAndUpdate(req.user.id, { $pull: { documents: existing._id } });
    }

    const document = await Document.create({
      student: req.user.id,
      documentType,
      fileName: file.originalname,
      fileUrl: file.location || `${config.app?.backendUrl || 'http://localhost:4000'}/uploads/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: req.user.id,
      uploadedDate: new Date(),
      status: 'Pending',
      notes: existing ? `Replaced previous upload on ${new Date().toLocaleDateString()}` : undefined,
    });

    await Student.findByIdAndUpdate(req.user.id, { $addToSet: { documents: document._id } });

    // Notify counselor
    const student = await Student.findById(req.user.id).select('name assigned');
    if (student.assigned?.counselor) {
      await notifyAdmin(student.assigned.counselor, {
        type: 'info',
        title: 'New Document Uploaded',
        message: `${student.name} uploaded a new ${documentType}.`,
        studentId: student._id,
        link: `/students/${student._id}?tab=documents`,
      });
    } else {
      await broadcastAdmin({
        type: 'info',
        title: 'New Document Uploaded',
        message: `${student.name} uploaded a new ${documentType}.`,
        studentId: student._id,
        link: `/students/${student._id}?tab=documents`,
        createdBy: student._id,
      });
    }

    res.json({ status: 'success', document, replaced: !!existing });
  } catch (err) {
    next(err);
  }
};

export const deleteStudentDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findOne({ _id: documentId, student: req.user.id });
    if (!document) return res.status(404).json({ status: 'error', message: 'Document not found' });
    await Document.deleteOne({ _id: documentId });
    await Student.findByIdAndUpdate(req.user.id, { $pull: { documents: document._id } });
    res.json({ status: 'success', message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────

export const getStudentApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ status: 'success', applications });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

export const getNotifications = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id).select('notifications');
    const notifications = (student?.notifications || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);
    res.json({ status: 'success', notifications });
  } catch (err) {
    next(err);
  }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    const { ids } = req.body; // array of notification _ids, or empty = mark all
    const student = await Student.findById(req.user.id);
    student.notifications.forEach(n => {
      if (!ids || ids.length === 0 || ids.includes(n._id.toString())) {
        n.read = true;
      }
    });
    await student.save();
    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// MESSAGES (student ↔ counselor)
// ─────────────────────────────────────────────

export const getMessages = async (req, res, next) => {
  try {
    const messages = await StudentMessage.find({ student: req.user.id })
      .sort({ createdAt: 1 });
    // Mark counselor messages as read
    await StudentMessage.updateMany(
      { student: req.user.id, sender: 'counselor', read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    res.json({ status: 'success', messages });
  } catch (err) {
    next(err);
  }
};

export const markMessagesAsRead = async (req, res, next) => {
  try {
    await StudentMessage.updateMany(
      { student: req.user.id, sender: 'counselor', read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    
    // Notify client that messages are read (clears badge)
    try {
      getIO().to(`student_${req.user.id}`).emit('messages_read');
    } catch (e) {}

    res.json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

export const getUnreadMessageCount = async (req, res, next) => {
  try {
    const count = await StudentMessage.countDocuments({
      student: req.user.id,
      sender: 'counselor',
      read: false
    });
    res.json({ status: 'success', count });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ status: 'error', message: 'Message is required' });
    const student = await Student.findById(req.user.id).select('name');
    const msg = await StudentMessage.create({
      student: req.user.id,
      sender: 'student',
      senderName: student.name,
      message: message.trim(),
    });

    // Real-time notify admin
    try {
      getIO().to('admin_room').emit('new_message', {
        ...msg.toObject(),
        student: {
          _id: student._id,
          name: student.name
        }
      });

      if (student.assigned?.counselor) {
        await notifyAdmin(student.assigned.counselor, {
          type: 'info',
          title: 'New Message from Student',
          message: `${student.name}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
          studentId: student._id,
          link: `/chat?studentId=${student._id}`,
        });
      }
    } catch (err) {
      console.error('[Socket] Failed to emit student message:', err.message);
    }

    res.json({ status: 'success', message: msg });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// DOCUMENT PRE-SCAN (Gemini Vision)
// ─────────────────────────────────────────────

export const scanStudentDocument = async (req, res) => {
  const { documentType } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ status: 'error', message: 'No file provided' });

  const SUPPORTED = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!SUPPORTED.includes(file.mimetype)) {
    return res.json({
      status: 'success',
      scan: { ok: true, issues: [], message: "Document received! I can't preview this format directly, but your counselor will review it shortly." },
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: config.gemini.model });

    const prompt = `You are reviewing a student document for a study abroad application. The student uploaded this as: "${documentType}".

Check quickly:
1. Is this actually a ${documentType}? (or wrong document?)
2. Is the image clear, readable, well-lit, and not cut off?
3. Any obvious issues? (expired, blurry, rotated, incomplete, wrong side shown?)
4. For passports: is the MRZ (bottom code strip) fully visible? Photo area clear?
5. For marksheets/certificates: is the institution name and score/grade readable?

Reply ONLY with valid JSON — no markdown, no extra text:
{"ok":true,"issues":[],"message":"one friendly sentence"}

Rules:
- ok=true if the document is acceptable (minor issues are fine)
- ok=false if there's a real problem that could get the document rejected
- issues = list of specific concerns (empty array if none)
- message = 1–2 warm sentences Sarah would say to the student
- Never say "AI" or "I scanned" — just give natural feedback`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: file.mimetype, data: file.buffer.toString('base64') } },
    ]);

    let scan = { ok: true, issues: [], message: 'Looks good — ready to upload!' };
    try {
      const raw = result.response.text().trim().replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(raw);
      scan = {
        ok: typeof parsed.ok === 'boolean' ? parsed.ok : true,
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        message: typeof parsed.message === 'string' ? parsed.message : 'Looks good!',
      };
    } catch {
      scan.message = result.response.text().trim().slice(0, 220);
    }

    res.json({ status: 'success', scan });
  } catch (err) {
    console.error('[DocScan] Gemini error:', err.message);
    // Never block an upload due to scan failure
    res.json({ status: 'success', scan: { ok: true, issues: [], message: 'Document looks ready — go ahead and upload!' } });
  }
};

// ─────────────────────────────────────────────
// VISA STATUS
// ─────────────────────────────────────────────

const STATUS_RANK = {
  'Accepted': 10, 'Unconditional Offer': 9, 'Conditional Offer': 8,
  'Under Review': 7, 'Submitted': 6, 'In Progress': 5,
  'Draft': 4, 'Deferred': 3, 'Withdrawn': 2, 'Rejected': 1,
};

export const getVisaStatus = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id)
      .select('currentPhase currentStage currentStatus personalInfo');

    const applications = await Application.find({ student: req.user.id })
      .sort({ createdAt: -1 });

    const bestApp = [...applications].sort(
      (a, b) => (STATUS_RANK[b.status] || 0) - (STATUS_RANK[a.status] || 0)
    )[0] || null;

    const VISA_DOC_TYPES = [
      'Passport', 'Passport Size Photo', 'Bank Statement',
      'IELTS Scorecard', 'TOEFL Scorecard', 'PTE Scorecard',
    ];
    const visaDocs = await Document.find({
      student: req.user.id,
      documentType: { $in: VISA_DOC_TYPES },
    }).select('documentType status fileName uploadedDate');

    res.json({
      status: 'success',
      data: {
        currentPhase: student.currentPhase,
        currentStage: student.currentStage,
        currentStatus: student.currentStatus,
        bestApplication: bestApp,
        visaDocs,
        totalApplications: applications.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────────

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await StudentTask.find({
      student: req.user.id,
      status: { $ne: 'cancelled' },
    }).sort({ priority: -1, dueDate: 1, createdAt: -1 });

    res.json({ status: 'success', tasks });
  } catch (err) {
    next(err);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const task = await StudentTask.findOne({ _id: req.params.taskId, student: req.user.id });
    if (!task) return res.status(404).json({ status: 'error', message: 'Task not found' });
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    task.completedAt = task.status === 'completed' ? new Date() : undefined;
    await task.save();

    if (task.status === 'completed') {
      const student = await Student.findById(req.user.id).select('name assigned');
      if (student.assigned?.counselor) {
        await notifyAdmin(student.assigned.counselor, {
          type: 'success',
          title: 'Task Completed',
          message: `${student.name} completed the task: "${task.title}"`,
          studentId: student._id,
          link: `/students/${student._id}?tab=tasks`,
        });
      }
    }

    res.json({ status: 'success', task });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// AI CHAT (Sarah) — with server-side history
// ─────────────────────────────────────────────

export const getChatHistory = async (req, res, next) => {
  try {
    const conversation = await ChatConversation.findOne({
      userId: req.user.id,
      title: 'sarah',
      isActive: true,
    });
    if (!conversation) return res.json({ status: 'success', messages: [] });

    const messages = await ChatMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(80);

    res.json({ status: 'success', messages, conversationId: conversation._id });
  } catch (err) {
    next(err);
  }
};

export const studentChat = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    if (!message?.trim()) return res.status(400).json({ status: 'error', message: 'Message is required' });

    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ status: 'error', message: 'Student not found' });

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await ChatConversation.findOne({ _id: conversationId, userId: req.user.id });
    }
    if (!conversation) {
      conversation = await ChatConversation.findOne({ userId: req.user.id, title: 'sarah', isActive: true });
    }
    if (!conversation) {
      conversation = await ChatConversation.create({
        title: 'sarah',
        userId: req.user.id,
        isActive: true,
      });
    }

    // Load recent history from DB
    const recentMessages = await ChatMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .limit(14);
    const history = recentMessages.reverse();

    const missingFields = [];
    if (!student.personalInfo?.dob) missingFields.push('Date of Birth');
    if (!student.personalInfo?.nationality) missingFields.push('Nationality');
    if (!student.personalInfo?.passportNumber) missingFields.push('Passport Number');
    if (!student.personalInfo?.gender) missingFields.push('Gender');
    if (!student.personalInfo?.currentAddress?.city) missingFields.push('Current City');
    if (!student.academics?.tenth?.percentage) missingFields.push('10th Grade marks');
    if (!student.academics?.twelfth?.percentage) missingFields.push('12th Grade marks');

    const conversationHistory = history
      .map(m => `${m.type === 'user' ? 'Student' : 'Sarah'}: ${m.content}`)
      .join('\n');

    const prompt = `You are Sarah, a warm, knowledgeable academic counselor at Stedinow, an education consultancy that helps students study abroad.

Student Profile:
- Name: ${student.name}
- Email: ${student.email}
- Phase: ${student.currentPhase || 'Not set'}
- Stage: ${student.currentStage || 'Not set'}
- Status: ${student.currentStatus || 'Not set'}
- Nationality: ${student.personalInfo?.nationality || 'Not set'}
- DOB: ${student.personalInfo?.dob ? new Date(student.personalInfo.dob).toDateString() : 'Not set'}
- Passport: ${student.personalInfo?.passportNumber ? 'Provided' : 'Not set'}
- 10th: ${student.academics?.tenth?.percentage ? student.academics.tenth.percentage + '%' : 'Not set'}
- 12th: ${student.academics?.twelfth?.percentage ? student.academics.twelfth.percentage + '%' : 'Not set'}
- IELTS: ${student.academics?.ielts?.overallScore || 'Not set'}
- Target Countries: ${student.preferences?.targetCountries?.join(', ') || 'Not set'}

Missing profile fields: ${missingFields.length > 0 ? missingFields.join(', ') : 'None — profile is complete!'}

Recent conversation:
${conversationHistory || '(start of conversation)'}

Student just said: "${message}"

Instructions:
1. Be warm, encouraging, and concise (2-4 sentences)
2. Help with: profile completion, university choices, visa, applications, documents, IELTS/TOEFL, scholarships, deadlines
3. If student provides profile data, extract it and include at end of response:
   [PROFILE_UPDATE]{"personalInfo": {"dob": "YYYY-MM-DD", "nationality": "...", "passportNumber": "...", "gender": "..."}}[/PROFILE_UPDATE]
   Only for fields actually mentioned. ISO date format. No block if no data provided.
4. Guide student to fill missing fields naturally
5. Give specific, practical answers about study abroad`;

    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const aiModel = genAI.getGenerativeModel({ model: config.gemini.model });
    const result = await aiModel.generateContent(prompt);
    let responseText = result.response.text().trim();

    // Extract and apply profile update
    let profileUpdated = false;
    const updateMatch = responseText.match(/\[PROFILE_UPDATE\]([\s\S]*?)\[\/PROFILE_UPDATE\]/);
    if (updateMatch) {
      try {
        const updateData = JSON.parse(updateMatch[1].trim());
        const filtered = {};
        if (updateData.personalInfo) filtered.personalInfo = { ...student.personalInfo?.toObject?.() || student.personalInfo, ...updateData.personalInfo };
        if (Object.keys(filtered).length > 0) {
          await Student.findByIdAndUpdate(req.user.id, { $set: filtered });
          profileUpdated = true;
        }
      } catch (e) {
        console.error('[StudentChat] Profile update parse error:', e.message);
      }
      responseText = responseText.replace(/\[PROFILE_UPDATE\][\s\S]*?\[\/PROFILE_UPDATE\]/, '').trim();
    }

    // Save user message and AI response to DB
    await ChatMessage.create({ conversationId: conversation._id, userId: req.user.id, type: 'user', content: message.trim() });
    await ChatMessage.create({ conversationId: conversation._id, userId: req.user.id, type: 'assistant', content: responseText });

    // Update conversation metadata
    await ChatConversation.findByIdAndUpdate(conversation._id, {
      lastMessageAt: new Date(),
      $inc: { messageCount: 2 },
    });

    res.json({ status: 'success', message: responseText, profileUpdated, conversationId: conversation._id });
  } catch (err) {
    console.error('[StudentChat] Error:', err.message);
    console.error('[StudentChat] Status:', err.status || err.statusCode || 'unknown');
    console.error('[StudentChat] Full:', JSON.stringify(err?.errorDetails || err?.response?.data || {}, null, 2));
    res.json({
      status: 'success',
      message: "I'm having a moment — please try again in a few seconds! 🙏",
      profileUpdated: false,
    });
  }
};

/**
 * Handles document upload via chat, processes it with Gemini Vision, 
 * provides quality feedback, and extracts profile data.
 */
export const studentChatUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ status: 'error', message: 'Student not found' });

    let conversation = await ChatConversation.findOne({ userId: req.user.id });
    if (!conversation) {
      conversation = await ChatConversation.create({ userId: req.user.id });
    }

    const filePath = req.file.path;
    const fileData = fs.readFileSync(filePath);
    
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const aiModel = genAI.getGenerativeModel({ model: config.gemini.model });

    const prompt = `You are Sarah, a warm academic counselor. A student just uploaded a document in our chat.
Analyze the document and provide:
1. **Document Type**: Identify what it is (Passport, Marksheet, etc.)
2. **Quality Audit**: Is it blurred? Are any corners cut off? Is it clearly readable?
3. **Data Extraction**: Extract Name, DOB, Passport No, or Marks if visible.
4. **Friendly Response**: Write a short (2-3 sentence) warm response as Sarah. 
   - If quality is bad: Politely ask for a better upload.
   - If quality is good: Thank them and confirm you've extracted the data.

Return ONLY a JSON object with this structure:
{
  "docType": "Passport | 10th Marksheet | 12th Marksheet | ...",
  "qualityStatus": "Good | Blurred | Incomplete | Low Contrast",
  "qualityFeedback": "...",
  "extractedData": {
    "personalInfo": { "dob": "YYYY-MM-DD", "nationality": "...", "passportNumber": "...", "gender": "..." },
    "academics": { "tenthPercentage": "...", "twelfthPercentage": "..." }
  },
  "sarahResponse": "..."
}
`;

    const result = await aiModel.generateContent([
      prompt,
      {
        inlineData: {
          data: fileData.toString('base64'),
          mimeType: req.file.mimetype,
        },
      },
    ]);

    const responseText = result.response.text();
    let analysis = {};
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('[ChatUpload] AI Parse Error:', e.message);
      analysis = { sarahResponse: "I've received your document! It looks like I'm having a small technical glitch reading it automatically, but don't worry, your counselor will review it shortly." };
    }

    // Update Profile if data found
    let profileUpdated = false;
    if (analysis.extractedData) {
      const update = {};
      if (analysis.extractedData.personalInfo) {
        update.personalInfo = { ...student.personalInfo?.toObject?.() || student.personalInfo, ...analysis.extractedData.personalInfo };
      }
      if (analysis.extractedData.academics) {
        // Simple mapping for demo
        const ac = student.academics?.toObject?.() || student.academics || {};
        if (analysis.extractedData.academics.tenthPercentage && !ac.tenth?.percentage) {
          ac.tenth = { ...ac.tenth, percentage: analysis.extractedData.academics.tenthPercentage };
        }
        if (analysis.extractedData.academics.twelfthPercentage && !ac.twelfth?.percentage) {
          ac.twelfth = { ...ac.twelfth, percentage: analysis.extractedData.academics.twelfthPercentage };
        }
        update.academics = ac;
      }
      
      if (Object.keys(update).length > 0) {
        await Student.findByIdAndUpdate(req.user.id, { $set: update });
        profileUpdated = true;
      }
    }

    // Save to Document collection
    const newDoc = await Document.create({
      student: req.user.id,
      documentType: analysis.docType || 'Other',
      fileName: req.file.originalname || req.file.filename,
      fileUrl: req.file.location || `${config.app?.backendUrl || 'http://localhost:4000'}/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      uploadedDate: new Date(),
      status: 'Pending',
    });

    await Student.findByIdAndUpdate(req.user.id, { $addToSet: { documents: newDoc._id } });

    // Notify counselor
    if (student.assigned?.counselor) {
      await notifyAdmin(student.assigned.counselor, {
        type: 'info',
        title: 'New Document Uploaded (Chat)',
        message: `${student.name} uploaded a ${analysis.docType || 'document'} via Sarah AI.`,
        studentId: student._id,
        link: `/students/${student._id}?tab=documents`,
      });
    }

    // Chat Messages
    await ChatMessage.create({ 
      conversationId: conversation._id, 
      userId: req.user.id, 
      type: 'user', 
      content: `[Uploaded Document: ${analysis.docType || req.file.originalname}]` 
    });
    
    await ChatMessage.create({ 
      conversationId: conversation._id, 
      userId: req.user.id, 
      type: 'assistant', 
      content: analysis.sarahResponse 
    });

    await ChatConversation.findByIdAndUpdate(conversation._id, {
      lastMessageAt: new Date(),
      $inc: { messageCount: 2 },
    });

    res.json({ 
      status: 'success', 
      message: analysis.sarahResponse, 
      profileUpdated, 
      docId: newDoc._id 
    });

  } catch (err) {
    console.error('[ChatUpload] Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to process document in chat' });
  }
};


// ─────────────────────────────────────────────
// UNIVERSITY DISCOVERY
// ─────────────────────────────────────────────

export const getDiscoveryUniversities = async (req, res) => {
  try {
    const { search, country } = req.query;

    const student = await Student.findById(req.user.id)
      .select('shortlistedUniversities')
      .lean();

    const universities = await University.find({ isActive: true })
      .populate('country', 'name code')
      .populate('courses', 'name level tuitionFee intakes requirements')
      .lean();

    const shortlistedSet = new Set(
      (student?.shortlistedUniversities || []).map(id => id.toString())
    );

    let result = universities.map(u => {
      const courses = u.courses || [];
      const fees = courses.map(c => c.tuitionFee?.amount).filter(Boolean);
      const minFee = fees.length ? Math.min(...fees) : null;
      const currency = courses.find(c => c.tuitionFee?.currency)?.tuitionFee?.currency || null;

      return {
        id: u._id,
        name: u.name,
        country: u.country?.name || 'Unknown',
        countryCode: u.country?.code || '',
        city: u.city || '',
        rank: u.ranking?.world || null,
        type: u.type || 'Public',
        courses: courses.map(c => c.name),
        minFee,
        currency,
        intakes: [...new Set(courses.flatMap(c => c.intakes || []))],
        requirements: {
          ielts: (() => { const v = courses.map(c => c.requirements?.ielts).filter(Boolean); return v.length ? Math.min(...v) : null; })(),
          gpa: (() => { const v = courses.map(c => c.requirements?.minimumGPA).filter(Boolean); return v.length ? Math.min(...v) : null; })(),
        },
        isShortlisted: shortlistedSet.has(u._id.toString()),
      };
    });

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.courses.some(c => c.toLowerCase().includes(q))
      );
    }

    if (country && country !== 'All') {
      result = result.filter(u => u.country === country);
    }

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('[Discovery] Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch universities' });
  }
};

export const toggleShortlist = async (req, res) => {
  try {
    const { universityId } = req.params;

    const student = await Student.findById(req.user.id)
      .select('shortlistedUniversities')
      .lean();

    const isShortlisted = (student?.shortlistedUniversities || [])
      .some(id => id.toString() === universityId);

    if (isShortlisted) {
      await Student.findByIdAndUpdate(req.user.id, {
        $pull: { shortlistedUniversities: universityId },
      });
    } else {
      await Student.findByIdAndUpdate(req.user.id, {
        $addToSet: { shortlistedUniversities: universityId },
      });
    }

    res.json({ status: 'success', shortlisted: !isShortlisted });
  } catch (err) {
    console.error('[Shortlist] Error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to update shortlist' });
  }
};
