# Stedinow CRM - Study Abroad Super-App

Stedinow is a powerful, unified CRM designed for study abroad consultancies to manage the end-to-end student journey—from lead acquisition to post-arrival support.

## 🚀 Version 2.0 - Student Self-Service Portal

The current version focuses on reducing administrative overhead by empowering students with their own portal.

### Key Features:
- **Student Dashboard**: Real-time tracking of application phase, stage, and status.
- **Document Management**: Students can upload mandatory/optional documents; Admins can verify or reject with feedback.
- **Task System**: Counselors can assign specific tasks (e.g., "Submit IELTS") with due dates and priorities.
- **Unified Activity Timeline**: A high-fidelity audit trail of all student interactions, status changes, and document actions.
- **Notification Hub**: Real-time alerts via Socket.io, WhatsApp (WATI integration), and internal notification center.
- **Bulk Operations**: Mass assignment of counselors and stage transitions for operational efficiency.
- **Advanced Filtering**: Persistent filter presets and global command-bar search.

## 🏗️ Technology Stack
- **Frontend**: React, Material UI (MUI v5), Socket.io-client, Notistack.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, Bcrypt.
- **Services**: OCR (Gemini AI), WhatsApp (WATI), Email (Nodemailer).

## 🛠️ Getting Started

### Prerequisites:
- Node.js (v18+)
- MongoDB instance
- WATI API Credentials (for WhatsApp)

### Installation:
1. Clone the repository.
2. Install dependencies:
   ```bash
   # Root
   npm install
   # Client
   cd client && npm install
   # Server
   cd server && npm install
   ```
3. Configure environment variables in `server/.env`.
4. Run development servers:
   ```bash
   npm run dev
   ```

## 🔐 Security
- Role-Based Access Control (RBAC) for Admin, Counselor, and Admission Officer roles.
- Secure JWT-based authentication for students.
- Admin-initiated password resets for student portal support.
