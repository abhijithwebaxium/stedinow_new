import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Button,
  Divider,
  TextField,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Tooltip,
  Badge,
  Avatar,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import { HeroBox, GlassCard as SharedGlassCard } from '../components/styled';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import PublicIcon from "@mui/icons-material/Public";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RobotIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import BlockIcon from "@mui/icons-material/Block";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import PasswordIcon from "@mui/icons-material/Password";
import SecurityIcon from "@mui/icons-material/Security";
import FilterListIcon from "@mui/icons-material/FilterList";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Document categories - matching backend DOCUMENT_TYPES
const MANDATORY_DOCUMENTS = [
  { key: "Passport", label: "Passport", icon: "🛂" },
  { key: "Passport Size Photo", label: "Passport Size Photo", icon: "📸" },
  { key: "10th Marksheet", label: "10th Marksheet", icon: "📄" },
  { key: "10th Certificate", label: "10th Certificate", icon: "📜" },
  { key: "12th Marksheet", label: "12th Marksheet", icon: "📄" },
  { key: "12th Certificate", label: "12th Certificate", icon: "📜" },
  { key: "UG Degree/Provisional Certificate", label: "UG Degree", icon: "🎓" },
  { key: "UG Marksheet", label: "UG Marksheet", icon: "📊" },
  { key: "IELTS Scorecard", label: "IELTS Scorecard", icon: "📝" },
  { key: "Bank Statement", label: "Bank Statement", icon: "💰" },
];

const OPTIONAL_DOCUMENTS = [
  { key: "Aadhar Card", label: "Aadhar Card", icon: "🪪" },
  { key: "UG Transcripts", label: "UG Transcripts", icon: "📑" },
  { key: "PG Degree/Provisional Certificate", label: "PG Degree", icon: "🎓" },
  { key: "PG Marksheet", label: "PG Marksheet", icon: "📊" },
  { key: "PG Transcripts", label: "PG Transcripts", icon: "📑" },
  { key: "Statement of Purpose (SOP)", label: "Statement of Purpose", icon: "📝" },
  { key: "Letter of Recommendation (LOR)", label: "Letter of Recommendation", icon: "✉️" },
  { key: "Resume/CV", label: "Resume/CV", icon: "📋" },
  { key: "TOEFL Scorecard", label: "TOEFL Scorecard", icon: "📝" },
  { key: "PTE Scorecard", label: "PTE Scorecard", icon: "📝" },
  { key: "Work Experience Letter", label: "Work Experience Letter", icon: "💼" },
];

const FINANCIAL_ASSISTANCE = [
  { key: "Loan Sanction Letter", label: "Loan Sanction Letter", icon: "🏦" },
  { key: "Loan Disbursement Letter", label: "Loan Disbursement Letter", icon: "💰" },
  { key: "Fixed Deposit Certificate", label: "FD Certificate", icon: "🏦" },
  { key: "Sponsor Affidavit", label: "Sponsor Affidavit", icon: "📄" },
  { key: "Income Tax Return (ITR)", label: "Income Tax Return", icon: "📑" },
];

const FEE_PAYMENT = [
  { key: "Offer Letter", label: "Offer Letter", icon: "📨" },
  { key: "Conditional Offer Letter", label: "Conditional Offer", icon: "📄" },
  { key: "Unconditional Offer Letter", label: "Unconditional Offer", icon: "📄" },
  { key: "CAS/I-20/CoE", label: "CAS/I-20/CoE", icon: "💳" },
  { key: "Enrollment Confirmation Letter", label: "Enrollment Confirmation", icon: "✅" },
];

// Styled Components
const GlassCard = styled(SharedGlassCard)(({ theme }) => ({
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? `0 20px 40px ${alpha('#000', 0.6)}`
      : `0 20px 40px ${alpha(theme.palette.grey[400], 0.2)}`,
  }
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.65rem",
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  color: theme.palette.text.secondary,
  opacity: 0.6,
  marginBottom: theme.spacing(0.5),
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: "0.95rem",
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiTabs-flexContainer': {
    gap: theme.spacing(1),
  },
  '& .MuiTab-root': {
    borderRadius: '14px',
    fontWeight: 800,
    textTransform: 'none',
    fontSize: '0.85rem',
    minHeight: 48,
    transition: 'all 0.2s ease',
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      bgcolor: theme.palette.primary.main,
      color: 'white',
    },
    '&:hover:not(.Mui-selected)': {
      bgcolor: alpha(theme.palette.primary.main, 0.05),
    }
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: "56px",
    borderRadius: "16px",
    backgroundColor: alpha(theme.palette.divider, 0.03),
    '&:hover': {
      backgroundColor: alpha(theme.palette.divider, 0.05),
    }
  },
}));

const StyledTextArea = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    backgroundColor: alpha(theme.palette.divider, 0.03),
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: "14px",
  padding: "12px 32px",
  backgroundColor: theme.palette.primary.main,
  color: "white",
  fontWeight: 800,
  textTransform: "none",
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  transition: 'all 0.3s ease'
}));

const AuditCard = styled(SharedGlassCard)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: '24px',
  background: theme.palette.mode === 'dark' 
    ? alpha('#1A1A1C', 0.8) 
    : '#FFFFFF',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  overflow: 'hidden',
}));

const AuditHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: alpha(theme.palette.divider, 0.02),
}));

const AuditContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StatusBadge = styled(Box)(({ theme, color }) => ({
  padding: '4px 12px',
  borderRadius: '8px',
  fontSize: '0.65rem',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: alpha(color || theme.palette.primary.main, 0.1),
  color: color || theme.palette.primary.main,
  border: `1px solid ${alpha(color || theme.palette.primary.main, 0.2)}`,
}));

const WarningBox = styled(Box)(({ theme, type = 'warning' }) => ({
  padding: theme.spacing(2),
  borderRadius: '16px',
  marginTop: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'flex-start',
  background: type === 'warning' ? alpha('#F59E0B', 0.05) : alpha('#EF4444', 0.05),
  border: `1px solid ${type === 'warning' ? alpha('#F59E0B', 0.2) : alpha('#EF4444', 0.2)}`,
  color: type === 'warning' ? '#B45309' : '#B91C1C',
}));

const ChecklistItem = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 0),
  '& .icon': {
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    background: status === 'success' ? alpha('#10B981', 0.15) : 
                status === 'warning' ? alpha('#F59E0B', 0.15) : 
                alpha('#EF4444', 0.15),
    color: status === 'success' ? '#059669' : 
           status === 'warning' ? '#D97706' : 
           '#DC2626',
    border: `1px solid ${status === 'success' ? alpha('#10B981', 0.3) : 
                          status === 'warning' ? alpha('#F59E0B', 0.3) : 
                          alpha('#EF4444', 0.3)}`,
  },
  '& .text': {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  '& .subtext': {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    display: 'block',
    marginTop: '2px',
    fontWeight: 500,
  }
}));

const VerdictButton = styled(Button)(({ theme, color_type }) => {
  const color = color_type === 'success' ? '#10B981' : 
                color_type === 'warning' ? '#F59E0B' : 
                '#EF4444';
  return {
    borderRadius: '14px',
    padding: '12px 24px',
    textTransform: 'none',
    fontWeight: 800,
    fontSize: '0.9rem',
    width: '100%',
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(1),
    transition: 'all 0.3s ease',
    ...(color_type === 'success' ? {
      background: color,
      color: '#fff',
      '&:hover': {
        background: '#059669',
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 20px ${alpha(color, 0.3)}`,
      }
    } : {
      background: 'transparent',
      color: color,
      border: `1px solid ${alpha(color, 0.3)}`,
      '&:hover': {
        background: alpha(color, 0.05),
        borderColor: color,
        transform: 'translateY(-2px)',
      }
    })
  };
});

function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [mainTab, setMainTab] = useState(0); 
  const [profileSubTab, setProfileSubTab] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [verifying, setVerifying] = useState(null);
  const [rejectDialog, setRejectDialog] = useState({ open: false, documentId: null, reason: '' });
  const [rejecting, setRejecting] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', type: 'general', priority: 'medium', dueDate: '' });
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [notifyDialog, setNotifyDialog] = useState({ open: false, type: 'general', title: '', message: '' });
  const [notifySending, setNotifySending] = useState(false);

  useEffect(() => {
    fetchStudent();
    fetchDocuments();
    fetchMessages();
    fetchTasks();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/students/${id}`, {
        withCredentials: true,
      });
      if (response.data.status === "success") {
        setStudent(response.data.student);
      }
    } catch (err) {
      console.error("Failed to fetch student:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/students/${id}/documents`,
        {
          withCredentials: true,
        },
      );
      if (response.data.status === "success") {
        setDocuments(response.data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/students/${id}/messages`,
        { withCredentials: true }
      );
      if (response.data.status === "success") {
        setMessages(response.data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/students/${id}/tasks`, { withCredentials: true });
      if (res.data.status === 'success') setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      setMsgLoading(true);
      const res = await axios.post(
        `${API_URL}/api/students/${id}/messages`,
        { message: replyText },
        { withCredentials: true }
      );
      if (res.data.status === "success") {
        setMessages(prev => [...prev, res.data.message]);
        setReplyText("");
      }
    } catch (err) {
      enqueueSnackbar("Failed to send message", { variant: 'error' });
    } finally {
      setMsgLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId, documentType) => {
    if (!window.confirm(`Are you sure you want to delete this ${documentType}?`)) return;
    try {
      await axios.delete(`${API_URL}/api/students/${id}/documents/${documentId}`, { withCredentials: true });
      enqueueSnackbar("Document deleted successfully", { variant: 'success' });
      fetchDocuments();
    } catch (err) {
      console.error("Failed to delete document:", err);
      enqueueSnackbar("Failed to delete document", { variant: 'error' });
    }
  };

  const handlePreviewDocument = async (documentId) => {
    try {
      const docResponse = await axios.get(`${API_URL}/api/students/${id}/documents`, { withCredentials: true });
      if (docResponse.data.status === "success") {
        const document = docResponse.data.documents.find(doc => doc._id === documentId);
        if (document && document.fileUrl) {
          if (document.fileUrl.startsWith("https://") || document.fileUrl.startsWith("http://")) {
            window.open(document.fileUrl, "_blank");
          } else {
            window.open(`${API_URL}/api/students/${id}/documents/${documentId}/download`, "_blank");
          }
        }
      }
    } catch (err) {
      console.error("Failed to preview document:", err);
      enqueueSnackbar("Failed to preview document", { variant: 'error' });
    }
  };

  const isDocumentUploaded = (docKey) => documents.find((doc) => doc.documentType === docKey);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/students/${id}`);
    enqueueSnackbar("Link copied to clipboard!", { variant: 'info' });
  };

  const handleWhatsApp = async (phone) => {
    const message = prompt("Enter message:", `Hello ${student.name}, regarding your application at Stedinow.`);
    if (!message) return;
    try {
      const response = await axios.post(`${API_URL}/api/whatsapp/send`, {
        phone: `${student.phoneCode}${student.phone}`,
        message
      }, { withCredentials: true });
      if (response.data.success) enqueueSnackbar("WhatsApp message sent successfully!", { variant: 'success' });
    } catch (err) { enqueueSnackbar("Failed to send WhatsApp message.", { variant: 'error' }); }
  };

  const handleSave = async (e, section) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      await axios.patch(`${API_URL}/api/students/${id}/${section}`, data, { withCredentials: true });
      enqueueSnackbar("Updated successfully!", { variant: 'success' });
      fetchStudent();
    } catch (err) { enqueueSnackbar("Failed to update", { variant: 'error' }); }
  };

  const handleOCR = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("document", file);
    try {
      setOcrLoading(true);
      const response = await axios.post(`${API_URL}/api/ocr/process`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success && response.data.data) {
        const extracted = response.data.data;
        if (window.confirm("Auto-fill extracted data?")) {
          setStudent(prev => ({
            ...prev,
            name: extracted.name || prev.name,
            personalInfo: {
              ...prev.personalInfo,
              passportNumber: extracted.idNumber || prev.personalInfo?.passportNumber,
              dob: extracted.dob || prev.personalInfo?.dob,
              nationality: extracted.nationality || prev.personalInfo?.nationality,
              gender: extracted.gender || prev.personalInfo?.gender,
            }
          }));
        }
      }
    } catch (err) { enqueueSnackbar("OCR processing failed.", { variant: 'error' }); } finally { setOcrLoading(false); event.target.value = ''; }
  };

  const handleVerifyDocument = async (documentId) => {
    setVerifying(documentId);
    try {
      await axios.patch(`${API_URL}/api/students/${id}/documents/${documentId}/verify`, {}, { withCredentials: true });
      enqueueSnackbar('Document verified!', { variant: 'success' });
      fetchDocuments();
    } catch {
      enqueueSnackbar('Failed to verify document', { variant: 'error' });
    } finally { setVerifying(null); }
  };

  const handleRejectSubmit = async () => {
    if (!rejectDialog.reason.trim()) return;
    setRejecting(true);
    try {
      await axios.patch(`${API_URL}/api/students/${id}/documents/${rejectDialog.documentId}/reject`, { reason: rejectDialog.reason }, { withCredentials: true });
      enqueueSnackbar('Document rejected.', { variant: 'info' });
      setRejectDialog({ open: false, documentId: null, reason: '' });
      fetchDocuments();
    } catch {
      enqueueSnackbar('Failed to reject document', { variant: 'error' });
    } finally { setRejecting(false); }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setTaskSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/students/${id}/tasks`, taskForm, { withCredentials: true });
      enqueueSnackbar('Task assigned to student!', { variant: 'success' });
      setTaskForm({ title: '', description: '', type: 'general', priority: 'medium', dueDate: '' });
      setTaskFormOpen(false);
      fetchTasks();
    } catch {
      enqueueSnackbar('Failed to assign task', { variant: 'error' });
    } finally { setTaskSubmitting(false); }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/students/${id}/tasks/${taskId}`, { withCredentials: true });
      enqueueSnackbar('Task removed', { variant: 'info' });
      fetchTasks();
    } catch {
      enqueueSnackbar('Failed to delete task', { variant: 'error' });
    }
  };

  const handleSendNotification = async () => {
    if (!notifyDialog.title.trim() || !notifyDialog.message.trim()) return;
    setNotifySending(true);
    try {
      await axios.post(`${API_URL}/api/students/${id}/notify`, {
        type: notifyDialog.type,
        title: notifyDialog.title,
        message: notifyDialog.message,
      }, { withCredentials: true });
      enqueueSnackbar('Notification sent to student!', { variant: 'success' });
      setNotifyDialog({ open: false, type: 'general', title: '', message: '' });
    } catch {
      enqueueSnackbar('Failed to send notification', { variant: 'error' });
    } finally { setNotifySending(false); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      enqueueSnackbar("Password must be at least 8 characters", { variant: 'warning' });
      return;
    }
    setIsResettingPassword(true);
    try {
      await axios.post(`${API_URL}/api/students/${id}/reset-password`, { newPassword }, { withCredentials: true });
      enqueueSnackbar("Student password reset successfully!", { variant: 'success' });
      setPasswordResetOpen(false);
      setNewPassword("");
      fetchStudent();
    } catch (err) {
      enqueueSnackbar("Failed to reset password", { variant: 'error' });
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><CircularProgress /></Box>;
  if (!student) return <Box sx={{ p: 3 }}><Typography variant="h6">Student not found</Typography></Box>;

  // Document expiry alerts — check docs with expiryDate within 60 days
  const expiringDocs = documents.filter(doc => {
    if (!doc.expiryDate) return false;
    const daysLeft = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 60 && daysLeft >= 0;
  });
  const expiredDocs = documents.filter(doc => {
    if (!doc.expiryDate) return false;
    return new Date(doc.expiryDate) < new Date();
  });

  const AuditView = () => {
    const ugData = student.academics?.ug || {};
    const testScores = student.testScores || {};
    const application = student.applications?.[0] || null;

    const docStats = {
      passed: documents.length,
      warnings: MANDATORY_DOCUMENTS.length - documents.filter(d => MANDATORY_DOCUMENTS.find(m => m.key === d.documentType)).length,
      issues: MANDATORY_DOCUMENTS.length > documents.length ? 1 : 0
    };

    const ieltsScore = parseFloat(testScores.ielts) || 0;
    const isIELTSBorderline = ieltsScore === 6.5;

    return (
      <Box sx={{ p: 4, bgcolor: alpha(theme.palette.divider, 0.01), minHeight: '100vh' }}>
        {/* Document expiry alerts */}
        {expiredDocs.length > 0 && (
          <Box sx={{ mb: 3, p: 2, borderRadius: '16px', bgcolor: alpha('#EF4444', 0.06), border: `1px solid ${alpha('#EF4444', 0.2)}`, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <ErrorOutlineIcon sx={{ color: '#DC2626', mt: 0.2, flexShrink: 0 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#B91C1C' }}>Expired Documents</Typography>
              <Typography variant="body2" sx={{ color: '#DC2626', mt: 0.3 }}>
                {expiredDocs.map(d => d.documentType).join(', ')} — expired and needs re-upload
              </Typography>
            </Box>
          </Box>
        )}
        {expiringDocs.length > 0 && (
          <Box sx={{ mb: 3, p: 2, borderRadius: '16px', bgcolor: alpha('#F59E0B', 0.06), border: `1px solid ${alpha('#F59E0B', 0.2)}`, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <WarningAmberIcon sx={{ color: '#D97706', mt: 0.2, flexShrink: 0 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E' }}>Documents Expiring Soon</Typography>
              <Typography variant="body2" sx={{ color: '#B45309', mt: 0.3 }}>
                {expiringDocs.map(d => {
                  const days = Math.ceil((new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return `${d.documentType} (${days}d)`;
                }).join(', ')}
              </Typography>
            </Box>
          </Box>
        )}
        {/* Top Header / Breadcrumbs */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Applications</Typography>
            <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.5 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{student.name}</Typography>
            <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.5 }} />
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 800 }}>Admin verification</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <StatusBadge color="#F59E0B">Pending admin review</StatusBadge>
            <Button variant="outlined" startIcon={<EditIcon sx={{ fontSize: 16 }} />} onClick={() => setMainTab(1)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
              Edit application
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Auto-check results */}
            <AuditCard>
              <AuditHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <RobotIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Auto-check results</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 800 }}>✓ {docStats.passed} passed</Typography>
                  <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 800 }}>! {docStats.warnings} warnings</Typography>
                  <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 800 }}>✕ {docStats.issues} issue</Typography>
                </Box>
              </AuditHeader>
              <AuditContent>
                 <Typography variant="caption" sx={{ color: 'text.secondary' }}>Last automated audit: {new Date().toLocaleString()}</Typography>
              </AuditContent>
            </AuditCard>

            {/* Student details */}
            <AuditCard>
              <AuditHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontSize: '1.2rem' }}>👤</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Student details</Typography>
                </Box>
                <StatusBadge color="#10B981">✓ Verified</StatusBadge>
              </AuditHeader>
              <AuditContent>
                <Grid container spacing={3}>
                  <Grid item xs={4}><InfoLabel>Full Name</InfoLabel><InfoValue>{student.name}</InfoValue></Grid>
                  <Grid item xs={4}><InfoLabel>Date of Birth</InfoLabel><InfoValue>{student.personalInfo?.dob ? new Date(student.personalInfo.dob).toLocaleDateString() : "N/A"}</InfoValue></Grid>
                  <Grid item xs={4}><InfoLabel>Nationality</InfoLabel><InfoValue>{student.personalInfo?.nationality || "N/A"}</InfoValue></Grid>
                  <Grid item xs={4}><InfoLabel>Phone</InfoLabel><InfoValue>{student.phoneCode} {student.phone}</InfoValue></Grid>
                  <Grid item xs={4}><InfoLabel>Email</InfoLabel><InfoValue sx={{ fontSize: '0.85rem' }}>{student.email}</InfoValue></Grid>
                  <Grid item xs={4}><InfoLabel>City / State</InfoLabel><InfoValue>{student.personalInfo?.currentAddress?.city || "N/A"}</InfoValue></Grid>
                  <Grid item xs={4}><InfoLabel>Passport No.</InfoLabel><InfoValue>{student.personalInfo?.passportNumber || "N/A"}</InfoValue></Grid>
                  <Grid item xs={4}><InfoLabel>Passport Expiry</InfoLabel><InfoValue sx={{ color: '#10B981' }}>{student.personalInfo?.passportExpiry ? new Date(student.personalInfo.passportExpiry).toLocaleDateString() : "Valid"}</InfoValue></Grid>
                  <Grid item xs={4}><InfoLabel>Lead Source</InfoLabel><InfoValue>{student.leadSource?.source || "N/A"}</InfoValue></Grid>
                </Grid>
              </AuditContent>
            </AuditCard>

            {/* Education background */}
            <AuditCard>
              <AuditHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SchoolIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Education background</Typography>
                </Box>
                {isIELTSBorderline && <StatusBadge color="#F59E0B">! 1 warning</StatusBadge>}
              </AuditHeader>
              <AuditContent>
                {ugData.degree ? (
                  <>
                    <Grid container spacing={3}>
                      <Grid item xs={6}><InfoLabel>Qualification / Institution</InfoLabel><InfoValue>{ugData.degree} — {ugData.college || "N/A"}</InfoValue></Grid>
                      <Grid item xs={6}><InfoLabel>Year Completed</InfoLabel><InfoValue>{ugData.yearOfPassing || "N/A"}</InfoValue></Grid>
                      <Grid item xs={3}><InfoLabel>CGPA</InfoLabel><InfoValue>{ugData.cgpa || "N/A"} / 10</InfoValue></Grid>
                      <Grid item xs={3}><InfoLabel>English Test</InfoLabel><InfoValue>{testScores.ielts ? "IELTS" : testScores.pte ? "PTE" : "N/A"}</InfoValue></Grid>
                      <Grid item xs={6}><InfoLabel>Score</InfoLabel><InfoValue sx={{ color: isIELTSBorderline ? '#F59E0B' : 'text.primary' }}>{testScores.ielts || testScores.pte || "N/A"} overall</InfoValue></Grid>
                    </Grid>
                    {isIELTSBorderline && (
                      <WarningBox>
                        <InfoOutlinedIcon sx={{ fontSize: 20 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>English score is borderline.</Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}> Most institutions require minimum 6.5. {student.name.split(' ')[0]} meets this exactly.</Typography>
                        </Box>
                      </WarningBox>
                    )}
                  </>
                ) : (
                  <Typography sx={{ color: 'text.secondary', py: 2 }}>No academic records found.</Typography>
                )}
              </AuditContent>
            </AuditCard>

            {/* University & course */}
            <AuditCard>
              <AuditHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PublicIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>University & course</Typography>
                </Box>
              </AuditHeader>
              <AuditContent>
                {application ? (
                  <Grid container spacing={3}>
                    <Grid item xs={6}><InfoLabel>University</InfoLabel><InfoValue>{application.universityName || "N/A"}</InfoValue></Grid>
                    <Grid item xs={6}><InfoLabel>Course</InfoLabel><InfoValue>{application.courseName || "N/A"}</InfoValue></Grid>
                    <Grid item xs={6}><InfoLabel>Intake</InfoLabel><InfoValue>{application.intake || "N/A"}</InfoValue></Grid>
                    <Grid item xs={6}><InfoLabel>Application Type</InfoLabel><InfoValue>{application.applicationType || "N/A"}</InfoValue></Grid>
                    <Grid item xs={6}><InfoLabel>Application Fee</InfoLabel><InfoValue>{application.fee || "N/A"}</InfoValue></Grid>
                    <Grid item xs={6}><InfoLabel>Deadline</InfoLabel><InfoValue>{application.deadline || "N/A"}</InfoValue></Grid>
                  </Grid>
                ) : (
                  <Typography sx={{ color: 'text.secondary', py: 2 }}>No active university applications found.</Typography>
                )}
              </AuditContent>
            </AuditCard>

            {/* Documents Section */}
            <AuditCard>
              <AuditHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <WorkIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Documents</Typography>
                </Box>
                <StatusBadge color={MANDATORY_DOCUMENTS.length - documents.length > 0 ? "#EF4444" : "#10B981"}>
                  {MANDATORY_DOCUMENTS.length - documents.length > 0 ? `✕ ${MANDATORY_DOCUMENTS.length - documents.length} missing` : "✓ Complete"}
                </StatusBadge>
              </AuditHeader>
              <AuditContent sx={{ p: 0 }}>
                <Box sx={{ px: 3, py: 1 }}>
                  {MANDATORY_DOCUMENTS.slice(0, 5).map((doc, idx) => {
                    const uploaded = documents.find(d => d.documentType === doc.key);
                    return (
                      <Box key={doc.key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: idx !== 4 ? `1px solid ${alpha(theme.palette.divider, 0.05)}` : 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ fontSize: '1.2rem' }}>{doc.icon}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{doc.label}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                           <Typography variant="caption" sx={{ color: uploaded ? '#10B981' : '#EF4444', fontWeight: 800 }}>{uploaded ? "Uploaded ✓" : "Missing ✕"}</Typography>
                           <IconButton size="small" onClick={() => uploaded && handlePreviewDocument(uploaded._id)} disabled={!uploaded}><VisibilityIcon sx={{ fontSize: 16 }} /></IconButton>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </AuditContent>
            </AuditCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <AuditCard>
               <AuditContent>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 3 }}>Admin checklist</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', mb: 1, display: 'block' }}>Student</Typography>
                  <ChecklistItem status={isDocumentUploaded("Passport") ? "success" : "error"}>
                    <Box className="icon">{isDocumentUploaded("Passport") ? "✓" : "✕"}</Box>
                    <Box><Typography className="text">Identity verified</Typography><Typography className="subtext">{isDocumentUploaded("Passport") ? "Passport confirmed" : "Passport missing"}</Typography></Box>
                  </ChecklistItem>
                  <ChecklistItem status={student.phone ? "success" : "error"}>
                    <Box className="icon">{student.phone ? "✓" : "✕"}</Box>
                    <Box><Typography className="text">Contact details complete</Typography></Box>
                  </ChecklistItem>
                  <ChecklistItem status={parseFloat(ugData.cgpa) >= 7 ? "success" : "warning"}>
                    <Box className="icon">{parseFloat(ugData.cgpa) >= 7 ? "✓" : "!"}</Box>
                    <Box><Typography className="text">Academic eligibility</Typography><Typography className="subtext">{ugData.cgpa || "N/A"} CGPA</Typography></Box>
                  </ChecklistItem>
                  <ChecklistItem status={isIELTSBorderline ? "warning" : ieltsScore > 6.5 ? "success" : "error"}>
                    <Box className="icon">{isIELTSBorderline ? "!" : ieltsScore > 6.5 ? "✓" : "✕"}</Box>
                    <Box><Typography className="text">IELTS status ({testScores.ielts || "N/A"})</Typography></Box>
                  </ChecklistItem>
                  <Divider sx={{ my: 3, opacity: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', mb: 1, display: 'block' }}>Documents</Typography>
                  <ChecklistItem status={isDocumentUploaded("Passport") ? "success" : "error"}><Box className="icon">{isDocumentUploaded("Passport") ? "✓" : "✕"}</Box><Box><Typography className="text">Passport uploaded</Typography></Box></ChecklistItem>
                  <ChecklistItem status={isDocumentUploaded("Statement of Purpose (SOP)") ? "success" : "error"}><Box className="icon">{isDocumentUploaded("Statement of Purpose (SOP)") ? "✓" : "✕"}</Box><Box><Typography className="text">SOP status</Typography></Box></ChecklistItem>
               </AuditContent>
            </AuditCard>
            <AuditCard>
               <AuditContent>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', mb: 1, display: 'block' }}>Admin review notes</Typography>
                  <TextField fullWidth multiline rows={4} placeholder="Add notes..." variant="outlined" sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '16px', fontSize: '0.85rem' } }} />
               </AuditContent>
            </AuditCard>

            {/* Student Portal Access */}
            <AuditCard sx={{ borderColor: alpha(theme.palette.primary.main, 0.2) }}>
               <AuditContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SecurityIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>Portal Access</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Login Status</Typography>
                    <Chip 
                      label={student.hasChangedPassword ? "SECURE" : "LEGACY / PENDING"} 
                      size="small" 
                      color={student.hasChangedPassword ? "success" : "warning"}
                      sx={{ fontWeight: 900, borderRadius: '8px', fontSize: '0.6rem' }}
                    />
                  </Box>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<PasswordIcon />}
                    onClick={() => setPasswordResetOpen(true)}
                    sx={{ 
                      borderRadius: '12px', 
                      textTransform: 'none', 
                      fontWeight: 700,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                    }}
                  >
                    Reset Password
                  </Button>
               </AuditContent>
            </AuditCard>
            <Box sx={{ mb: 3 }}>
               <VerdictButton color_type="success" startIcon={<CheckCircleIcon />}>Approve & submit</VerdictButton>
               <VerdictButton color_type="warning" startIcon={<SendIcon />}>Send back with queries</VerdictButton>
               <VerdictButton color_type="error" startIcon={<BlockIcon />}>Reject application</VerdictButton>
            </Box>
            <AuditCard>
               <AuditContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 800 }}>{student.assigned?.counselor?.name?.charAt(0) || "U"}</Avatar>
                  <Box>
                     <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{student.assigned?.counselor?.name || "Unassigned"}</Typography>
                     <Typography variant="caption" sx={{ color: 'text.secondary' }}>Admin Team</Typography>
                  </Box>
               </AuditContent>
            </AuditCard>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return mainTab === 0 ? <AuditView /> : (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 900 }}>Edit Profile: {student.name}</Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<NotificationsNoneIcon />} onClick={() => setNotifyDialog(d => ({ ...d, open: true }))} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
            Notify Student
          </Button>
          <Button variant="contained" onClick={() => setMainTab(0)} startIcon={<VisibilityIcon />}>Back to Audit Dashboard</Button>
        </Stack>
      </Box>
      <StyledTabs value={mainTab - 1} onChange={(e, v) => setMainTab(v + 1)}>
        <Tab label="Personal" />
        <Tab label="Documents" />
        <Tab label="Applications" />
        <Tab label="Messages" />
        <Tab label="Tasks" />
        <Tab label="Activity Log" />
      </StyledTabs>
      {mainTab === 1 && (
        <AuditCard><AuditContent>
          <form onSubmit={(e) => handleSave(e, "personal-info")}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}><Typography variant="body2">Name</Typography><StyledTextField fullWidth name="name" defaultValue={student.name} /></Grid>
              <Grid item xs={12} md={6}><Typography variant="body2">Email</Typography><StyledTextField fullWidth name="email" defaultValue={student.email} /></Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}><SubmitButton type="submit">Save Changes</SubmitButton></Box>
          </form>
        </AuditContent></AuditCard>
      )}
      {mainTab === 2 && (
        <Box>
          {documents.length === 0 ? (
            <AuditCard><AuditContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>📂</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>No Documents Uploaded</Typography>
              <Typography variant="body2" color="text.secondary">The student hasn't uploaded any documents yet.</Typography>
            </AuditContent></AuditCard>
          ) : (
            <Stack spacing={2}>
              {documents.map(doc => {
                const statusColors = { Verified: '#10B981', Pending: '#F59E0B', Rejected: '#EF4444', Expired: '#94a3b8' };
                const sc = statusColors[doc.status] || '#F59E0B';
                const isVerifying = verifying === doc._id;
                return (
                  <AuditCard key={doc._id}>
                    <AuditContent>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{doc.documentType}</Typography>
                            <Box sx={{ px: 1.2, py: 0.3, borderRadius: '8px', bgcolor: alpha(sc, 0.1), color: sc, fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', border: `1px solid ${alpha(sc, 0.2)}` }}>
                              {doc.status}
                            </Box>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">{doc.fileName} · {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB · ` : ''}{new Date(doc.uploadedDate).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</Typography>
                          {doc.rejectionReason && (
                            <Typography variant="caption" sx={{ display: 'block', color: '#EF4444', mt: 0.5, fontWeight: 600 }}>
                              Rejection reason: {doc.rejectionReason}
                            </Typography>
                          )}
                        </Box>
                        <Stack direction="row" spacing={1} flexShrink={0}>
                          <Tooltip title="Preview">
                            <IconButton size="small" onClick={() => handlePreviewDocument(doc._id)} sx={{ bgcolor: alpha('#3B82F6', 0.07), color: '#3B82F6', '&:hover': { bgcolor: alpha('#3B82F6', 0.14) } }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {doc.status !== 'Verified' && (
                            <Tooltip title="Verify">
                              <span>
                                <IconButton size="small" disabled={isVerifying} onClick={() => handleVerifyDocument(doc._id)} sx={{ bgcolor: alpha('#10B981', 0.07), color: '#10B981', '&:hover': { bgcolor: alpha('#10B981', 0.14) } }}>
                                  {isVerifying ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon fontSize="small" />}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {doc.status !== 'Rejected' && (
                            <Tooltip title="Reject">
                              <IconButton size="small" onClick={() => setRejectDialog({ open: true, documentId: doc._id, reason: '' })} sx={{ bgcolor: alpha('#EF4444', 0.07), color: '#EF4444', '&:hover': { bgcolor: alpha('#EF4444', 0.14) } }}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDeleteDocument(doc._id, doc.documentType)} sx={{ bgcolor: alpha(theme.palette.divider, 0.05), color: 'text.secondary', '&:hover': { bgcolor: alpha('#EF4444', 0.07), color: '#EF4444' } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </AuditContent>
                  </AuditCard>
                );
              })}
            </Stack>
          )}
        </Box>
      )}
      {mainTab === 3 && (
        <Box>
          {(!student.applications || student.applications.length === 0) ? (
            <AuditCard>
              <AuditContent sx={{ textAlign: 'center', py: 6 }}>
                <Typography sx={{ fontSize: '3rem', mb: 2 }}>🎓</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>No Applications Yet</Typography>
                <Typography variant="body2" color="text.secondary">
                  University applications for this student will appear here once added.
                </Typography>
              </AuditContent>
            </AuditCard>
          ) : (
            <Stack spacing={3}>
              {student.applications.map((app, idx) => (
                <AuditCard key={app._id || idx}>
                  <AuditHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <SchoolIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {app.universityName || app.university?.name || 'Unknown University'}
                      </Typography>
                    </Box>
                    <StatusBadge color={
                      app.status === 'Accepted' || app.status === 'Unconditional Offer' ? '#10B981' :
                      app.status === 'Rejected' ? '#EF4444' :
                      app.status === 'Conditional Offer' ? '#3B82F6' : '#F59E0B'
                    }>
                      {app.status || 'In Progress'}
                    </StatusBadge>
                  </AuditHeader>
                  <AuditContent>
                    <Grid container spacing={3}>
                      <Grid item xs={6} md={3}><InfoLabel>Course</InfoLabel><InfoValue>{app.courseName || app.course?.name || 'N/A'}</InfoValue></Grid>
                      <Grid item xs={6} md={3}><InfoLabel>Intake</InfoLabel><InfoValue>{app.intake || 'N/A'}</InfoValue></Grid>
                      <Grid item xs={6} md={3}><InfoLabel>Application Type</InfoLabel><InfoValue>{app.applicationType || 'Standard'}</InfoValue></Grid>
                      <Grid item xs={6} md={3}><InfoLabel>Deadline</InfoLabel><InfoValue>{app.deadline ? new Date(app.deadline).toLocaleDateString() : 'N/A'}</InfoValue></Grid>
                      {app.fee && <Grid item xs={6} md={3}><InfoLabel>Application Fee</InfoLabel><InfoValue>{app.fee}</InfoValue></Grid>}
                      {app.country && <Grid item xs={6} md={3}><InfoLabel>Country</InfoLabel><InfoValue>{app.country}</InfoValue></Grid>}
                    </Grid>
                  </AuditContent>
                </AuditCard>
              ))}
            </Stack>
          )}
        </Box>
      )}
      {mainTab === 4 && (
        <Box>
          <AuditCard>
            <AuditHeader>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SendIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Communication History</Typography>
              </Box>
            </AuditHeader>
            <AuditContent sx={{ maxHeight: '500px', overflowY: 'auto', p: 3, bgcolor: alpha(theme.palette.divider, 0.02) }}>
              {messages.length === 0 ? (
                <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No messages yet.</Typography>
              ) : (
                <Stack spacing={2}>
                  {messages.map((msg, i) => (
                    <Box key={i} sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: msg.sender === 'counselor' ? 'flex-end' : 'flex-start'
                    }}>
                      <Box sx={{ 
                        maxWidth: '80%', 
                        p: 2, 
                        borderRadius: msg.sender === 'counselor' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                        bgcolor: msg.sender === 'counselor' ? 'primary.main' : 'white',
                        color: msg.sender === 'counselor' ? 'white' : 'text.primary',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        border: msg.sender === 'student' ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.75rem', opacity: 0.8 }}>
                          {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography variant="body2">{msg.message}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </AuditContent>
            <Box sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
              <form onSubmit={handleReply}>
                <Stack direction="row" spacing={2}>
                  <StyledTextArea
                    fullWidth
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    multiline
                    maxRows={4}
                  />
                  <SubmitButton 
                    type="submit" 
                    disabled={msgLoading || !replyText.trim()}
                    sx={{ height: '56px', minWidth: '120px' }}
                  >
                    {msgLoading ? <CircularProgress size={24} color="inherit" /> : "Send"}
                  </SubmitButton>
                </Stack>
              </form>
            </Box>
          </AuditCard>
        </Box>
      )}
      {mainTab === 5 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Assigned Tasks</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setTaskFormOpen(true)} sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}>
              Assign Task
            </Button>
          </Stack>
          {tasks.length === 0 ? (
            <AuditCard><AuditContent sx={{ textAlign: 'center', py: 5 }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>No Tasks Yet</Typography>
              <Typography variant="body2" color="text.secondary">Assign tasks to this student and they'll appear in their TaskBoard.</Typography>
            </AuditContent></AuditCard>
          ) : (
            <Stack spacing={2}>
              {tasks.map(task => {
                const priorityColor = { urgent: '#EF4444', high: '#F59E0B', medium: '#3B82F6', low: '#94a3b8' }[task.priority] || '#3B82F6';
                const statusColor = task.status === 'completed' ? '#10B981' : task.status === 'cancelled' ? '#94a3b8' : '#F59E0B';
                return (
                  <AuditCard key={task._id}>
                    <AuditContent>
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, textDecoration: task.status === 'completed' ? 'line-through' : 'none', color: task.status === 'completed' ? 'text.disabled' : 'text.primary' }}>{task.title}</Typography>
                            <Box sx={{ px: 1, py: 0.2, borderRadius: '6px', bgcolor: alpha(priorityColor, 0.1), color: priorityColor, fontSize: '0.62rem', fontWeight: 900 }}>{task.priority}</Box>
                            <Box sx={{ px: 1, py: 0.2, borderRadius: '6px', bgcolor: alpha(statusColor, 0.1), color: statusColor, fontSize: '0.62rem', fontWeight: 900 }}>{task.status}</Box>
                          </Stack>
                          {task.description && <Typography variant="caption" color="text.secondary">{task.description}</Typography>}
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                            {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'} · Created {new Date(task.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Tooltip title="Delete task">
                          <IconButton size="small" onClick={() => handleDeleteTask(task._id)} sx={{ color: 'text.disabled', '&:hover': { color: '#EF4444' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </AuditContent>
                  </AuditCard>
                );
              })}
            </Stack>
          )}
        </Box>
      )}
      {mainTab === 6 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Activity Timeline</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['all', 'status', 'document', 'message', 'task'].map((filter) => (
                <Chip
                  key={filter}
                  label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                  onClick={() => setTimelineFilter(filter)}
                  variant={timelineFilter === filter ? "filled" : "outlined"}
                  color={timelineFilter === filter ? "primary" : "default"}
                  size="small"
                  sx={{ fontWeight: 700, borderRadius: '8px' }}
                />
              ))}
            </Box>
          </Box>
          <Stack spacing={0}>
            {(() => {
              const events = [
                {
                  type: 'creation',
                  date: new Date(student.createdAt),
                  title: 'Student record created',
                  details: `Lead source: ${student.leadSource?.source || 'Direct'}`,
                  icon: '👤',
                  color: theme.palette.primary.main
                },
                ...documents.map(doc => ({
                  type: 'document',
                  date: new Date(doc.uploadedDate),
                  title: `Document uploaded: ${doc.documentType}`,
                  details: `Status: ${doc.status}`,
                  icon: '📄',
                  color: '#10B981'
                })),
                ...messages.map(msg => ({
                  type: 'message',
                  date: new Date(msg.createdAt),
                  title: `Message from ${msg.senderName || (msg.sender === 'counselor' ? 'Counselor' : 'Student')}`,
                  details: msg.message,
                  icon: '💬',
                  color: '#3B82F6'
                })),
                ...(student.statusHistory || []).map(sh => ({
                  type: 'status',
                  date: new Date(sh.changedAt),
                  title: `Status updated to ${sh.status}`,
                  details: `${sh.notes || 'Stage progression'} • By ${sh.changedBy?.name || 'System'}`,
                  icon: '⚡',
                  color: '#F59E0B'
                })),
                ...(student.history || []).map(h => ({
                  type: 'history',
                  date: new Date(h.date),
                  title: h.type,
                  details: `${h.notes} • By ${h.actionDoneBy?.name || 'System'}`,
                  icon: h.type.includes('Assigned') ? '👥' : '📝',
                  color: h.type.includes('Assigned') ? '#10B981' : '#64748b'
                })),
                ...tasks.map(task => ({
                  type: 'task',
                  date: new Date(task.createdAt),
                  title: `Task assigned: ${task.title}`,
                  details: `Priority: ${task.priority} • Status: ${task.status}`,
                  icon: '📋',
                  color: '#8B5CF6'
                }))
              ].filter(e => timelineFilter === 'all' || e.type === timelineFilter)
               .sort((a, b) => b.date - a.date);

              if (events.length === 0) return (
                <AuditCard>
                  <AuditContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No activity recorded yet.</Typography>
                  </AuditContent>
                </AuditCard>
              );

              return events.map((event, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      bgcolor: alpha(event.color, 0.1), 
                      color: event.color,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.875rem',
                      border: `1px solid ${alpha(event.color, 0.2)}`,
                      zIndex: 1
                    }}>
                      {event.icon}
                    </Box>
                    {idx < events.length - 1 && (
                      <Box sx={{ width: 2, flex: 1, my: -0.5, bgcolor: alpha(theme.palette.divider, 0.1) }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, pb: 4 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{event.title}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      {event.date.toLocaleString('en', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      fontSize: '0.8rem', 
                      p: 1.5, 
                      bgcolor: alpha(theme.palette.divider, 0.02), 
                      borderRadius: '12px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                      mt: 0.5,
                      fontStyle: event.type === 'message' ? 'italic' : 'normal'
                    }}>
                      {event.details}
                    </Typography>
                  </Box>
                </Box>
              ));
            })()}
          </Stack>
        </Box>
      )}
      {/* Reject Document Dialog */}
      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, documentId: null, reason: '' })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Reject Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason"
            value={rejectDialog.reason}
            onChange={e => setRejectDialog(d => ({ ...d, reason: e.target.value }))}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
            placeholder="Explain why this document is being rejected..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setRejectDialog({ open: false, documentId: null, reason: '' })} sx={{ borderRadius: '10px', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleRejectSubmit} variant="contained" color="error" disabled={!rejectDialog.reason.trim() || rejecting} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>
            {rejecting ? <CircularProgress size={18} color="inherit" /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={taskFormOpen} onClose={() => setTaskFormOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Task to Student</DialogTitle>
        <DialogContent>
          <Box component="form" id="task-form" onSubmit={handleAssignTask} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField required fullWidth label="Task Title" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }} />
            <TextField fullWidth multiline rows={2} label="Description (optional)" value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }} />
            <Stack direction="row" spacing={2}>
              <TextField select fullWidth label="Type" value={taskForm.type} onChange={e => setTaskForm(f => ({ ...f, type: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}>
                {['general', 'profile', 'document', 'application', 'visa', 'deadline'].map(t => <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Priority" value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}>
                {['low', 'medium', 'high', 'urgent'].map(p => <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField fullWidth label="Due Date (optional)" type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setTaskFormOpen(false)} sx={{ borderRadius: '10px', textTransform: 'none' }}>Cancel</Button>
          <Button type="submit" form="task-form" variant="contained" disabled={!taskForm.title.trim() || taskSubmitting} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>
            {taskSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Assign Task'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={notifyDialog.open} onClose={() => setNotifyDialog(d => ({ ...d, open: false }))} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Send Notification to Student</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select fullWidth label="Type" value={notifyDialog.type} onChange={e => setNotifyDialog(d => ({ ...d, type: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}>
              {['general', 'application_update', 'deadline', 'document_verified', 'message'].map(t => <MenuItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Title" value={notifyDialog.title} onChange={e => setNotifyDialog(d => ({ ...d, title: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }} />
            <TextField fullWidth multiline rows={3} label="Message" value={notifyDialog.message} onChange={e => setNotifyDialog(d => ({ ...d, message: e.target.value }))} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setNotifyDialog(d => ({ ...d, open: false }))} sx={{ borderRadius: '10px', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSendNotification} variant="contained" disabled={!notifyDialog.title.trim() || !notifyDialog.message.trim() || notifySending} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>
            {notifySending ? <CircularProgress size={18} color="inherit" /> : 'Send Notification'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Password Reset Dialog */}
      <Dialog open={passwordResetOpen} onClose={() => !isResettingPassword && setPasswordResetOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Reset Student Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set a new temporary password for <strong>{student.name}</strong>. The student will be required to change this upon their next login.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isResettingPassword}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setPasswordResetOpen(false)} disabled={isResettingPassword}>Cancel</Button>
          <Button 
            onClick={handleResetPassword} 
            variant="contained" 
            disabled={isResettingPassword}
            sx={{ borderRadius: '10px', px: 3 }}
          >
            {isResettingPassword ? <CircularProgress size={20} /> : "Reset & Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StudentProfile;
