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
} from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";
import { HeroBox, GlassCard as SharedGlassCard } from '../components/styled';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RobotIcon from "@mui/icons-material/SmartToy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import axios from "axios";

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
  {
    key: "Statement of Purpose (SOP)",
    label: "Statement of Purpose",
    icon: "📝",
  },
  {
    key: "Letter of Recommendation (LOR)",
    label: "Letter of Recommendation",
    icon: "✉️",
  },
  { key: "Resume/CV", label: "Resume/CV", icon: "📋" },
  { key: "TOEFL Scorecard", label: "TOEFL Scorecard", icon: "📝" },
  { key: "PTE Scorecard", label: "PTE Scorecard", icon: "📝" },
  {
    key: "Work Experience Letter",
    label: "Work Experience Letter",
    icon: "💼",
  },
];

const FINANCIAL_ASSISTANCE = [
  { key: "Loan Sanction Letter", label: "Loan Sanction Letter", icon: "🏦" },
  {
    key: "Loan Disbursement Letter",
    label: "Loan Disbursement Letter",
    icon: "💰",
  },
  { key: "Fixed Deposit Certificate", label: "FD Certificate", icon: "🏦" },
  { key: "Sponsor Affidavit", label: "Sponsor Affidavit", icon: "📄" },
  { key: "Income Tax Return (ITR)", label: "Income Tax Return", icon: "📑" },
];

const FEE_PAYMENT = [
  { key: "Offer Letter", label: "Offer Letter", icon: "📨" },
  { key: "Conditional Offer Letter", label: "Conditional Offer", icon: "📄" },
  {
    key: "Unconditional Offer Letter",
    label: "Unconditional Offer",
    icon: "📄",
  },
  { key: "CAS/I-20/CoE", label: "CAS/I-20/CoE", icon: "💳" },
  {
    key: "Enrollment Confirmation Letter",
    label: "Enrollment Confirmation",
    icon: "✅",
  },
];

// Styled Components
// HeroBox and GlassCard are now imported from ../components/styled
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

const SubTabsWrapper = styled(Box)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(0.5),
  marginBottom: theme.spacing(3),
  display: 'inline-flex',
  bgcolor: alpha(theme.palette.divider, 0.03),
  border: `1px solid ${alpha(theme.palette.divider, 0.05)}`
}));

const SubTab = styled(Tabs)(({ theme }) => ({
  minHeight: 40,
  '& .MuiTab-root': {
    borderRadius: '12px',
    fontWeight: 700,
    textTransform: 'none',
    fontSize: '0.75rem',
    minHeight: 40,
    px: 3,
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      bgcolor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.main,
    },
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
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

function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState(0);
  const [profileSubTab, setProfileSubTab] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [ocrLoading, setOcrLoading] = useState(false);

  useEffect(() => {
    fetchStudent();
    if (mainTab === 1) {
      fetchDocuments();
    }
  }, [id, mainTab]);

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

  const handleDeleteDocument = async (documentId, documentType) => {
    if (
      !window.confirm(`Are you sure you want to delete this ${documentType}?`)
    ) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/students/${id}/documents/${documentId}`,
        {
          withCredentials: true,
        },
      );
      alert("Document deleted successfully");
      fetchDocuments();
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document");
    }
  };

  const handlePreviewDocument = async (documentId) => {
    try {
      // Get the document details first to check if it's an S3 URL
      const docResponse = await axios.get(
        `${API_URL}/api/students/${id}/documents`,
        {
          withCredentials: true,
        },
      );

      if (docResponse.data.status === "success") {
        const document = docResponse.data.documents.find(
          (doc) => doc._id === documentId,
        );
        if (document && document.fileUrl) {
          // If it's an S3 URL (starts with https://), open directly
          if (
            document.fileUrl.startsWith("https://") ||
            document.fileUrl.startsWith("http://")
          ) {
            window.open(document.fileUrl, "_blank");
          } else {
            // For local files, use the download endpoint
            window.open(
              `${API_URL}/api/students/${id}/documents/${documentId}/download`,
              "_blank",
            );
          }
        } else {
          throw new Error("Document URL not found");
        }
      }
    } catch (err) {
      console.error("Failed to preview document:", err);
      alert(
        "Failed to preview document: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const isDocumentUploaded = (docKey) => {
    return documents.find((doc) => doc.documentType === docKey);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/students/${id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const handleWhatsApp = async (phone) => {
    const message = prompt("Enter your message to send via WhatsApp:", `Hello ${student.name}, this is regarding your application at Stedinow.`);
    if (!message) return;

    try {
      const response = await axios.post(`${API_URL}/api/whatsapp/send`, {
        phone: `${student.phoneCode}${student.phone}`,
        message
      }, { withCredentials: true });

      if (response.data.success) {
        alert("WhatsApp message sent successfully!");
      }
    } catch (err) {
      console.error("WhatsApp Failed:", err);
      alert(err.response?.data?.message || "Failed to send WhatsApp message. Please check integration settings.");
    }
  };

  const handleSave = async (e, section) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      await axios.patch(`${API_URL}/api/students/${id}/${section}`, data, {
        withCredentials: true,
      });
      alert("Updated successfully!");
      fetchStudent();
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Failed to update");
    }
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
        const confirmMsg = `AI extracted the following data:\n\n` +
          `Name: ${extracted.name || "Not found"}\n` +
          `ID Number: ${extracted.idNumber || "Not found"}\n` +
          `DOB: ${extracted.dob || "Not found"}\n` +
          `Nationality: ${extracted.nationality || "Not found"}\n\n` +
          `Would you like to auto-fill these fields?`;

        if (window.confirm(confirmMsg)) {
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
    } catch (err) {
      console.error("OCR Failed:", err);
      alert("Failed to process document using AI. Please ensure it is a clear image of a Passport or ID.");
    } finally {
      setOcrLoading(false);
      // Reset input so the same file can be selected again if needed
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Student not found</Typography>
        <Button onClick={() => navigate("/students")} sx={{ mt: 2 }}>
          Back to Students
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <HeroBox>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: -1.5, mb: 4, color: 'text.primary' }}>
            {student.name}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 4,
            }}
          >
            <Box>
              <InfoLabel>Entity Email</InfoLabel>
              <InfoValue>{student.email || "N/A"}</InfoValue>
            </Box>
            <Box>
              <InfoLabel>Communication</InfoLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoValue>
                  {student.phoneCode} {student.phone || "N/A"}
                </InfoValue>
                <IconButton 
                  size="small" 
                  onClick={() => handleWhatsApp(student.phone)}
                  sx={{ color: '#25D366', p: 0 }}
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box>
              <InfoLabel>System Phase</InfoLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', boxShadow: `0 0 10px ${theme.palette.primary.main}` }} />
                <InfoValue sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.8rem' }}>{student.currentPhase || "N/A"}</InfoValue>
              </Box>
            </Box>
            <Box>
              <InfoLabel>Identity Hash</InfoLabel>
              <InfoValue sx={{ fontFamily: 'monospace', opacity: 0.7 }}>#{student.studentId || "N/A"}</InfoValue>
            </Box>
            <Box>
              <InfoLabel>Processing Status</InfoLabel>
              <Chip 
                label={student.currentStatus || "N/A"} 
                size="small"
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: 'primary.main', 
                  fontWeight: 900, 
                  borderRadius: '8px',
                  fontSize: '0.65rem',
                  height: 24
                }} 
              />
            </Box>
            <Box>
              <InfoLabel>Assigned Agent</InfoLabel>
              <InfoValue>
                {student.assigned?.counselor?.name || "Unassigned"}
              </InfoValue>
            </Box>
            <Box>
              <InfoLabel>Source Channel</InfoLabel>
              <InfoValue>{student.leadSource?.source || "N/A"}</InfoValue>
            </Box>
            <Box>
              <Button
                fullWidth
                size="small"
                onClick={handleCopyLink}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  color: "primary.main",
                  fontSize: "11px",
                  borderRadius: "10px",
                  textTransform: "uppercase",
                  fontWeight: 800,
                  letterSpacing: 1,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white'
                  }
                }}
              >
                Copy Link
              </Button>
            </Box>
          </Box>
        </Box>
      </HeroBox>

      {/* Main Tabs */}
      <StyledTabs value={mainTab} onChange={(e, v) => setMainTab(v)}>
        <Tab label="Profile" />
        <Tab label="Documents" />
        <Tab label="Applications" />
        <Tab label="Log" />
      </StyledTabs>

      {/* Tab Content */}
      {/* Profile Tab */}
      {mainTab === 0 && (
        <Box>
          <SubTabsWrapper>
            <SubTab
              value={profileSubTab}
              onChange={(e, v) => setProfileSubTab(v)}
            >
              <Tab label="Personal" />
              <Tab label="Academics" />
              <Tab label="Family" />
              <Tab label="Tests" />
            </SubTab>
          </SubTabsWrapper>

          {/* Personal Information */}
          {profileSubTab === 0 && (
            <GlassCard>
              <ContentBox>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>Core Identity</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Extracted and verified student parameters</Typography>
                </Box>
                <Box>
                  <input
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    id="ocr-upload-button"
                    type="file"
                    onChange={handleOCR}
                    disabled={ocrLoading}
                  />
                  <label htmlFor="ocr-upload-button">
                    <Tooltip title="Upload Passport/ID to auto-fill fields using AI">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={ocrLoading ? <CircularProgress size={16} /> : <RobotIcon />}
                        disabled={ocrLoading}
                        sx={{ 
                          textTransform: 'none', 
                          borderRadius: '12px',
                          fontWeight: 800,
                          px: 3,
                          py: 1,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                      >
                        {ocrLoading ? 'Analyzing...' : 'AI Auto-fill'}
                      </Button>
                    </Tooltip>
                  </label>
                </Box>
              </Box>
              <form onSubmit={(e) => handleSave(e, "personal-info")}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Name *
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="name"
                      defaultValue={student.name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Email *
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="email"
                      type="email"
                      defaultValue={student.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Mobile Number (WhatsApp) *
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="phone"
                      defaultValue={student.phone}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Date of Birth
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="dob"
                      type="date"
                      defaultValue={
                        student.personalInfo?.dob
                          ? new Date(student.personalInfo.dob)
                              .toISOString()
                              .slice(0, 10)
                          : ""
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Gender
                    </Typography>
                    <StyledTextField
                      fullWidth
                      select
                      name="gender"
                      defaultValue={
                        student.personalInfo?.gender || "Not Defined"
                      }
                    >
                      <MenuItem value="Not Defined">Not Defined</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Prefer Not To Say">
                        Prefer Not To Say
                      </MenuItem>
                    </StyledTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Nationality
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="nationality"
                      defaultValue={student.personalInfo?.nationality}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Passport Number
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="passportNumber"
                      defaultValue={student.personalInfo?.passportNumber}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Marital Status
                    </Typography>
                    <StyledTextField
                      fullWidth
                      select
                      name="maritalStatus"
                      defaultValue={student.personalInfo?.maritalStatus || ""}
                    >
                      <MenuItem value="">Select</MenuItem>
                      <MenuItem value="Single">Single</MenuItem>
                      <MenuItem value="Married">Married</MenuItem>
                      <MenuItem value="Divorced">Divorced</MenuItem>
                      <MenuItem value="Widowed">Widowed</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </StyledTextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      City
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="city"
                      defaultValue={student.personalInfo?.currentAddress?.city}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      State
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="state"
                      defaultValue={student.personalInfo?.currentAddress?.state}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Country
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="country"
                      defaultValue={
                        student.personalInfo?.currentAddress?.country
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Current Address
                    </Typography>
                    <StyledTextArea
                      fullWidth
                      multiline
                      rows={3}
                      name="currentAddress"
                      defaultValue={
                        student.personalInfo?.currentAddress?.street
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Permanent Address
                    </Typography>
                    <StyledTextArea
                      fullWidth
                      multiline
                      rows={3}
                      name="permanentAddress"
                      defaultValue={
                        student.personalInfo?.permanentAddress?.street
                      }
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                  <SubmitButton type="submit">Synchronize Profile</SubmitButton>
                </Box>
              </form>
            </ContentBox>
          </GlassCard>
        )}

          {/* Academic Qualification */}
          {profileSubTab === 1 && (
            <GlassCard>
              <ContentBox>
              <form onSubmit={(e) => handleSave(e, "academics")}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Undergraduate
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Degree Name
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="ugDegree"
                      defaultValue={student.academics?.undergraduate?.degree}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      College
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="ugCollege"
                      defaultValue={
                        student.academics?.undergraduate?.collegeName
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      University
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="ugUniversity"
                      defaultValue={
                        student.academics?.undergraduate?.university
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Pass Year
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="ugPassYear"
                      defaultValue={student.academics?.undergraduate?.passYear}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      CGPA
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="ugCGPA"
                      defaultValue={student.academics?.undergraduate?.cgpa}
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Percentage
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="ugPercentage"
                      defaultValue={
                        student.academics?.undergraduate?.percentage
                      }
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
                  Grade 12th or Equivalent
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      School Name
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="twelfthSchool"
                      defaultValue={student.academics?.twelfth?.schoolName}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Board
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="twelfthBoard"
                      defaultValue={student.academics?.twelfth?.board}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Pass Year
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="twelfthPassYear"
                      defaultValue={student.academics?.twelfth?.passYear}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Percentage
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="twelfthPercentage"
                      defaultValue={student.academics?.twelfth?.percentage}
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
                  Grade 10th or Equivalent
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      School Name
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="tenthSchool"
                      defaultValue={student.academics?.tenth?.schoolName}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Board
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="tenthBoard"
                      defaultValue={student.academics?.tenth?.board}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Pass Year
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="tenthPassYear"
                      defaultValue={student.academics?.tenth?.passYear}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Percentage
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="tenthPercentage"
                      defaultValue={student.academics?.tenth?.percentage}
                      inputProps={{ step: "0.01" }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                  <SubmitButton type="submit">Synchronize Profile</SubmitButton>
                </Box>
              </form>
            </ContentBox>
          </GlassCard>
        )}

          {/* Family Details */}
          {profileSubTab === 2 && (
            <GlassCard>
              <ContentBox>
              <form onSubmit={(e) => handleSave(e, "family-details")}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Father's Name
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="fatherName"
                      defaultValue={student.personalInfo?.fatherName}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Father's Phone
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="fatherPhone"
                      defaultValue={student.personalInfo?.fatherPhone}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Father's Occupation
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="fatherOccupation"
                      defaultValue={student.personalInfo?.fatherOccupation}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Mother's Name
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="motherName"
                      defaultValue={student.personalInfo?.motherName}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Mother's Phone
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="motherPhone"
                      defaultValue={student.personalInfo?.motherPhone}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Mother's Occupation
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="motherOccupation"
                      defaultValue={student.personalInfo?.motherOccupation}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Guardian Name
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="guardianName"
                      defaultValue={student.personalInfo?.guardianName}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Guardian Relation
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="guardianRelation"
                      defaultValue={student.personalInfo?.guardianRelation}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Guardian Phone
                    </Typography>
                    <StyledTextField
                      fullWidth
                      name="guardianPhone"
                      defaultValue={student.personalInfo?.guardianPhone}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                  <SubmitButton type="submit">Synchronize Profile</SubmitButton>
                </Box>
              </form>
            </ContentBox>
          </GlassCard>
        )}

          {/* Tests */}
          {profileSubTab === 3 && (
            <GlassCard>
              <ContentBox>
              <form onSubmit={(e) => handleSave(e, "tests")}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  IELTS
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Overall Score
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="ieltsOverall"
                      defaultValue={student.academics?.ielts?.overallScore}
                      inputProps={{ step: "0.5" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Listening
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="ieltsListening"
                      defaultValue={student.academics?.ielts?.listening}
                      inputProps={{ step: "0.5" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Reading
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="ieltsReading"
                      defaultValue={student.academics?.ielts?.reading}
                      inputProps={{ step: "0.5" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Writing
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="ieltsWriting"
                      defaultValue={student.academics?.ielts?.writing}
                      inputProps={{ step: "0.5" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Speaking
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="ieltsSpeaking"
                      defaultValue={student.academics?.ielts?.speaking}
                      inputProps={{ step: "0.5" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Exam Date
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="date"
                      name="ieltsExamDate"
                      defaultValue={
                        student.academics?.ielts?.examDate
                          ? new Date(student.academics.ielts.examDate)
                              .toISOString()
                              .slice(0, 10)
                          : ""
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
                  TOEFL
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Overall Score
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="toeflOverall"
                      defaultValue={student.academics?.toefl?.overallScore}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Reading
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="toeflReading"
                      defaultValue={student.academics?.toefl?.reading}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Listening
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="toeflListening"
                      defaultValue={student.academics?.toefl?.listening}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Speaking
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="toeflSpeaking"
                      defaultValue={student.academics?.toefl?.speaking}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Writing
                    </Typography>
                    <StyledTextField
                      fullWidth
                      type="number"
                      name="toeflWriting"
                      defaultValue={student.academics?.toefl?.writing}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                  <SubmitButton type="submit">Synchronize Profile</SubmitButton>
                </Box>
              </form>
            </ContentBox>
          </GlassCard>
        )}
        </Box>
      )}

      {/* Documents Tab */}
      {mainTab === 1 && (
        <GlassCard sx={{ borderRadius: '40px' }}>
          <ContentBox sx={{ p: 6 }}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, mb: 0.5 }}>
                Vault Storage
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Secure document repository and verification center
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="caption"
                sx={{ 
                  fontWeight: 900, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em', 
                  color: 'error.main',
                  display: 'block',
                  mb: 2
                }}
              >
                Critical Compliance
              </Typography>

            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ color: "#2196F3", fontWeight: 600 }}
              >
                Uploaded: 0
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#FF9800", fontWeight: 600 }}
              >
                Pending: 10
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#9E9E9E", fontWeight: 600 }}
              >
                Total: 10
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {MANDATORY_DOCUMENTS.map((doc) => {
                const uploadedDoc = isDocumentUploaded(doc.key);
                return (
                  <Card
                    key={doc.key}
                    sx={{
                      height: "100%",
                      borderRadius: '20px',
                      boxShadow: 'none',
                      bgcolor: alpha(theme.palette.divider, 0.03),
                      border: `1px solid ${uploadedDoc ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.divider, 0.08)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.divider, 0.05),
                        borderColor: uploadedDoc ? theme.palette.success.main : theme.palette.primary.main,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2.5,
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Typography sx={{ fontSize: "1.2rem", filter: 'grayscale(0.5)' }}>
                            {doc.icon}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: -0.2 }}
                          >
                            {doc.label}
                          </Typography>
                        </Box>
                        {uploadedDoc && (
                          <CheckCircleIcon
                            sx={{ color: "success.main", fontSize: '1.2rem' }}
                          />
                        )}
                      </Box>

                      {uploadedDoc ? (
                        <>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              mb: 1,
                            }}
                          >
                            File: {uploadedDoc.fileName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              mb: 2,
                            }}
                          >
                            Uploaded:{" "}
                            {new Date(
                              uploadedDoc.uploadedDate,
                            ).toLocaleDateString()}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "space-between",
                            }}
                          >
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                handlePreviewDocument(uploadedDoc._id)
                              }
                              title="Preview"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeleteDocument(uploadedDoc._id, doc.label)
                              }
                              title="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "12px",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Upload File:
                            </Typography>
                            <Button
                              component="label"
                              variant="outlined"
                              size="small"
                              startIcon={<UploadFileIcon />}
                              fullWidth
                              sx={{ textTransform: "none" }}
                            >
                              Choose File
                              <input type="file" hidden multiple />
                            </Button>
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Box>

            <Box sx={{ mb: 4, mt: 6 }}>
              <Typography
                variant="caption"
                sx={{ 
                  fontWeight: 900, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em', 
                  color: 'success.main',
                  display: 'block',
                  mb: 2
                }}
              >
                Supporting Credentials
              </Typography>

            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ color: "#2196F3", fontWeight: 600 }}
              >
                Uploaded: 0
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#9E9E9E", fontWeight: 600 }}
              >
                Total: 30
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {OPTIONAL_DOCUMENTS.map((doc) => {
                const uploadedDoc = isDocumentUploaded(doc.key);
                return (
                  <Card
                    key={doc.key}
                    sx={{
                      height: "100%",
                      borderRadius: '20px',
                      boxShadow: 'none',
                      bgcolor: alpha(theme.palette.divider, 0.03),
                      border: `1px solid ${uploadedDoc ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.divider, 0.08)}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.divider, 0.05),
                        borderColor: uploadedDoc ? theme.palette.success.main : theme.palette.primary.main,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2.5,
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Typography sx={{ fontSize: "1.2rem", filter: 'grayscale(0.5)' }}>
                            {doc.icon}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: -0.2 }}
                          >
                            {doc.label}
                          </Typography>
                        </Box>
                        {uploadedDoc && (
                          <CheckCircleIcon
                            sx={{ color: "success.main", fontSize: '1.2rem' }}
                          />
                        )}
                      </Box>

                      {uploadedDoc ? (
                        <>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              mb: 1,
                            }}
                          >
                            File: {uploadedDoc.fileName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              mb: 2,
                            }}
                          >
                            Uploaded:{" "}
                            {new Date(
                              uploadedDoc.uploadedDate,
                            ).toLocaleDateString()}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "space-between",
                            }}
                          >
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                handlePreviewDocument(uploadedDoc._id)
                              }
                              title="Preview"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeleteDocument(uploadedDoc._id, doc.label)
                              }
                              title="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: "12px",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Upload File:
                            </Typography>
                            <Button
                              component="label"
                              variant="outlined"
                              size="small"
                              startIcon={<UploadFileIcon />}
                              fullWidth
                              sx={{ textTransform: "none" }}
                            >
                              Choose File
                              <input type="file" hidden multiple />
                            </Button>
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Box>

          {/* Financial Assistance */}
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "#2196F3" }}
            >
              Financial Assistance
            </Typography>

            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ color: "#2196F3", fontWeight: 600 }}
              >
                Uploaded: 0
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#9E9E9E", fontWeight: 600 }}
              >
                Total: 2
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {FINANCIAL_ASSISTANCE.map((doc) => (
                <Card
                  key={doc.key}
                  sx={{ height: "100%", borderRadius: 3, boxShadow: 2 }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography sx={{ fontSize: "1.5rem", mr: 1 }}>
                        {doc.icon}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {doc.label}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "12px", display: "block", mb: 0.5 }}
                      >
                        Upload File:
                      </Typography>
                      <Button
                        component="label"
                        variant="outlined"
                        size="small"
                        startIcon={<UploadFileIcon />}
                        fullWidth
                        sx={{ textTransform: "none" }}
                      >
                        Choose File
                        <input type="file" hidden multiple />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Fee Payment */}
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, color: "#FF9800" }}
            >
              Fee Payment
            </Typography>

            <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ color: "#2196F3", fontWeight: 600 }}
              >
                Uploaded: 0
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#9E9E9E", fontWeight: 600 }}
              >
                Total: 3
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {FEE_PAYMENT.map((doc) => (
                <Card
                  key={doc.key}
                  sx={{ height: "100%", borderRadius: 3, boxShadow: 2 }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography sx={{ fontSize: "1.5rem", mr: 1 }}>
                        {doc.icon}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {doc.label}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "12px", display: "block", mb: 0.5 }}
                      >
                        Upload File:
                      </Typography>
                      <Button
                        component="label"
                        variant="outlined"
                        size="small"
                        startIcon={<UploadFileIcon />}
                        fullWidth
                        sx={{ textTransform: "none" }}
                      >
                        Choose File
                        <input type="file" hidden multiple />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          {/* Fixed Upload Button */}
          <Box sx={{ position: "fixed", bottom: 40, right: 40, zIndex: 10000 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'primary.main',
                color: "white",
                px: 6,
                py: 2,
                borderRadius: '20px',
                fontWeight: 900,
                textTransform: 'none',
                fontSize: '1rem',
                letterSpacing: -0.2,
                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                "&:hover": {
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-4px)',
                  boxShadow: `0 24px 48px ${alpha(theme.palette.primary.main, 0.5)}`,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Upload Selected Files
            </Button>
          </Box>
        </ContentBox>
      </GlassCard>
    )}

      {/* Applications Tab */}
      {mainTab === 2 && (
        <GlassCard>
          <ContentBox sx={{ p: 6, minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1 }}>No Active Tracks</Typography>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '400px' }}>
              Application synchronization with partner institutions will be available once the vault is verified.
            </Typography>
          </ContentBox>
        </GlassCard>
      )}

      {/* Log Tab */}
      {mainTab === 3 && (
        <GlassCard>
          <ContentBox sx={{ p: 6, minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1 }}>Event Horizon</Typography>
            <Typography sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '400px' }}>
              Historical audit trails and system interaction logs for this entity.
            </Typography>
          </ContentBox>
        </GlassCard>
      )}
    </Box>
  );
}

export default StudentProfile;
