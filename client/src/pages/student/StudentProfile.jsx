import { useState, useRef } from 'react';
import {
  Box, Typography, Grid, Paper, alpha, useTheme, Stack, Button,
  TextField, MenuItem, Tab, Tabs, CircularProgress, Chip, LinearProgress,
  IconButton, Tooltip, Snackbar, Alert, Dialog, DialogContent, DialogActions,
} from "@mui/material";
import {
  PersonOutline as PersonIcon,
  SchoolOutlined as EducationIcon,
  DescriptionOutlined as DocIcon,
  FamilyRestroom as FamilyIcon,
  CloudUploadOutlined as UploadIcon,
  CheckCircle as CheckIcon,
  DeleteOutline as DeleteIcon,
  OpenInNew as PreviewIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  AutoAwesome as AIIcon,
} from "@mui/icons-material";
import { useOutletContext, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const NATIONALITIES = [
  'Afghan', 'Albanian', 'Algerian', 'American', 'Australian', 'Austrian', 'Bangladeshi',
  'Belgian', 'Brazilian', 'British', 'Canadian', 'Chinese', 'Colombian', 'Croatian',
  'Czech', 'Danish', 'Dutch', 'Egyptian', 'Ethiopian', 'Filipino', 'Finnish', 'French',
  'German', 'Ghanaian', 'Greek', 'Hungarian', 'Indian', 'Indonesian', 'Iranian', 'Iraqi',
  'Irish', 'Israeli', 'Italian', 'Japanese', 'Jordanian', 'Kenyan', 'Korean', 'Lebanese',
  'Malaysian', 'Mexican', 'Moroccan', 'Nepalese', 'New Zealander', 'Nigerian', 'Norwegian',
  'Pakistani', 'Peruvian', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Saudi Arabian',
  'Singaporean', 'South African', 'Spanish', 'Sri Lankan', 'Swedish', 'Swiss', 'Taiwanese',
  'Thai', 'Turkish', 'Ukrainian', 'Emirati', 'Vietnamese', 'Zimbabwean',
];

const STUDY_LEVELS = ['Undergraduate', 'Postgraduate', 'Diploma', 'Certificate', 'Research', 'PhD'];

const STUDENT_DOCUMENTS = [
  { key: 'Passport', label: 'Passport', required: true },
  { key: 'Passport Size Photo', label: 'Passport Size Photo', required: true },
  { key: '10th Marksheet', label: '10th Marksheet', required: true },
  { key: '10th Certificate', label: '10th Certificate', required: false },
  { key: '12th Marksheet', label: '12th Marksheet', required: true },
  { key: '12th Certificate', label: '12th Certificate', required: false },
  { key: 'UG Degree/Provisional Certificate', label: 'UG Degree / Provisional Certificate', required: false },
  { key: 'UG Marksheet', label: 'UG Marksheet', required: false },
  { key: 'UG Transcripts', label: 'UG Transcripts', required: false },
  { key: 'IELTS Scorecard', label: 'IELTS Scorecard', required: false },
  { key: 'TOEFL Scorecard', label: 'TOEFL Scorecard', required: false },
  { key: 'PTE Scorecard', label: 'PTE Scorecard', required: false },
  { key: 'Statement of Purpose (SOP)', label: 'Statement of Purpose (SOP)', required: false },
  { key: 'Letter of Recommendation (LOR)', label: 'Letter of Recommendation (LOR)', required: false },
  { key: 'Resume/CV', label: 'Resume / CV', required: false },
  { key: 'Bank Statement', label: 'Bank Statement', required: false },
];

const STATUS_CONFIG = {
  Verified: { color: '#10B981', icon: <CheckIcon sx={{ fontSize: 16 }} />, label: 'Verified' },
  Pending: { color: '#F59E0B', icon: <PendingIcon sx={{ fontSize: 16 }} />, label: 'Under Review' },
  Rejected: { color: '#EF4444', icon: <RejectedIcon sx={{ fontSize: 16 }} />, label: 'Rejected' },
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px', bgcolor: '#f8fafc',
    '& fieldset': { borderColor: alpha('#94a3b8', 0.2) },
    '&:hover fieldset': { borderColor: alpha('#3B82F6', 0.4) },
    '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
  },
};

const FieldLabel = ({ children, required }) => (
  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.3 }}>
    {children} {required && <Box component="span" sx={{ color: '#EF4444' }}>*</Box>}
  </Typography>
);

const SectionTitle = ({ children }) => (
  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 2, mt: 1 }}>{children}</Typography>
);

const ProfileBuilder = () => {
  const theme = useTheme();
  const location = useLocation();
  const { student, fetchProfile, documents, fetchDocuments } = useOutletContext();
  const [activeTab, setActiveTab] = useState(location.state?.initialTab ?? 0);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);
  const [pendingDocType, setPendingDocType] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanningDoc, setScanningDoc] = useState(null);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const validate = (data) => {
    const errs = {};
    if (!data.name?.trim()) errs.name = 'Full name is required';
    if (data.phone && !/^\d{7,15}$/.test(data.phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid phone number';
    if (data.passportNumber && !/^[A-Z0-9]{6,12}$/i.test(data.passportNumber.trim())) errs.passportNumber = 'Enter a valid passport number (6–12 alphanumeric characters)';
    return errs;
  };

  const handlePersonalSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    const errs = validate(data);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setUpdating(true);
    try {
      await axios.patch(`${API_URL}/api/student-portal/profile`, {
        name: data.name,
        phone: data.phone,
        personalInfo: {
          ...student?.personalInfo,
          nationality: data.nationality,
          dob: data.dob,
          gender: data.gender,
          passportNumber: data.passportNumber,
          maritalStatus: data.maritalStatus,
          currentAddress: {
            street: data.currentStreet,
            city: data.currentCity,
            state: data.currentState,
            country: data.currentCountry,
            postalCode: data.currentPostal,
          },
          permanentAddress: {
            street: data.permStreet,
            city: data.permCity,
            state: data.permState,
            country: data.permCountry,
            postalCode: data.permPostal,
          },
        },
      }, { withCredentials: true });
      await fetchProfile();
      showSnackbar('Personal info saved successfully!');
    } catch {
      showSnackbar('Failed to save. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleEducationSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    setUpdating(true);
    try {
      await axios.patch(`${API_URL}/api/student-portal/profile`, {
        academics: {
          ...student?.academics,
          tenth: { ...student?.academics?.tenth, schoolName: data.tenthSchool, board: data.tenthBoard, passYear: data.tenthYear, percentage: data.tenthPercentage },
          twelfth: { ...student?.academics?.twelfth, schoolName: data.twelfthSchool, board: data.twelfthBoard, passYear: data.twelfthYear, percentage: data.twelfthPercentage },
          undergraduate: { ...student?.academics?.undergraduate, degree: data.ugDegree, collegeName: data.ugCollege, passYear: data.ugYear, cgpa: data.ugCgpa },
          ielts: data.ieltsScore ? { ...student?.academics?.ielts, overallScore: data.ieltsScore } : student?.academics?.ielts,
          toefl: data.toeflScore ? { ...student?.academics?.toefl, overallScore: data.toeflScore } : student?.academics?.toefl,
          pte: data.pteScore ? { ...student?.academics?.pte, overallScore: data.pteScore } : student?.academics?.pte,
        },
      }, { withCredentials: true });
      await fetchProfile();
      showSnackbar('Education info saved successfully!');
    } catch {
      showSnackbar('Failed to save. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleFamilySave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    setUpdating(true);
    try {
      await axios.patch(`${API_URL}/api/student-portal/profile`, {
        personalInfo: {
          ...student?.personalInfo,
          fatherName: data.fatherName,
          fatherPhone: data.fatherPhone,
          fatherOccupation: data.fatherOccupation,
          motherName: data.motherName,
          motherPhone: data.motherPhone,
          motherOccupation: data.motherOccupation,
          guardianName: data.guardianName,
          guardianRelation: data.guardianRelation,
          guardianPhone: data.guardianPhone,
        },
        preferences: {
          targetCountries: data.targetCountries
            ? data.targetCountries.split(',').map(s => s.trim()).filter(Boolean)
            : (student?.preferences?.targetCountries || []),
          studyLevel: data.studyLevel || student?.preferences?.studyLevel,
          intakePreference: data.intakePreference || student?.preferences?.intakePreference,
        },
      }, { withCredentials: true });
      await fetchProfile();
      showSnackbar('Details saved successfully!');
    } catch {
      showSnackbar('Failed to save. Please try again.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const triggerUpload = (docType) => {
    setPendingDocType(docType);
    fileInputRef.current?.click();
  };

  const doUpload = async (file, docType) => {
    setUploadingDoc(docType);
    const fd = new FormData();
    fd.append('document', file);
    fd.append('documentType', docType);
    try {
      await axios.post(`${API_URL}/api/student-portal/documents`, fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchDocuments();
      showSnackbar('Document uploaded successfully!');
    } catch {
      showSnackbar('Upload failed. Please try again.', 'error');
    } finally {
      setUploadingDoc(null);
      setScanResult(null);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !pendingDocType) return;
    e.target.value = '';
    const docType = pendingDocType;
    setPendingDocType(null);

    if (file.size > 10 * 1024 * 1024) {
      showSnackbar('File must be under 10MB', 'error');
      return;
    }

    setScanningDoc(docType);
    try {
      const scanFd = new FormData();
      scanFd.append('document', file);
      const scanRes = await axios.post(`${API_URL}/api/student-portal/documents/scan`, scanFd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (scanRes.data.status === 'success' && scanRes.data.scan?.issues?.length > 0) {
        setScanResult({ ok: scanRes.data.scan.ok, issues: scanRes.data.scan.issues, message: scanRes.data.scan.message, file, docType });
        setScanningDoc(null);
        return;
      }
    } catch {
      // Scan failed — proceed with upload anyway
    }
    setScanningDoc(null);
    await doUpload(file, docType);
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    setDeletingDoc(docId);
    try {
      await axios.delete(`${API_URL}/api/student-portal/documents/${docId}`, { withCredentials: true });
      await fetchDocuments();
      showSnackbar('Document deleted.');
    } catch {
      showSnackbar('Delete failed.', 'error');
    } finally {
      setDeletingDoc(null);
    }
  };

  const getDocForType = (key) => documents?.find(d => d.documentType === key);

  const SaveButton = ({ label }) => (
    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
      <Button type="submit" disabled={updating} variant="contained" sx={{ py: 1.5, px: 5, borderRadius: '14px', fontWeight: 800, textTransform: 'none', bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' } }}>
        {updating ? <CircularProgress size={22} sx={{ color: 'white' }} /> : label}
      </Button>
    </Box>
  );

  if (!student) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5, fontFamily: '"Outfit", sans-serif' }}>
          My Profile
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
          Complete your information to speed up your university applications.
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: '28px', overflow: 'hidden', bgcolor: 'white', border: `1px solid ${alpha(theme.palette.divider, 0.07)}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: '#f8fafc', px: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: '#3B82F6' },
            '& .MuiTab-root': { py: 2.5, fontWeight: 700, textTransform: 'none', fontSize: '0.875rem', minHeight: 'auto', color: '#94a3b8', '&.Mui-selected': { color: '#3B82F6', fontWeight: 800 } },
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Personal" />
          <Tab icon={<EducationIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Education" />
          <Tab icon={<FamilyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Family & More" />
          <Tab icon={<DocIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Documents${documents?.length > 0 ? ` (${documents.length})` : ''}`} />
        </Tabs>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>

          {/* ── Personal Tab ── */}
          {activeTab === 0 && (
            <form onSubmit={handlePersonalSave} key={`personal-${student?.updatedAt || ''}`}>
              <SectionTitle>Basic Info</SectionTitle>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FieldLabel required>Full Name</FieldLabel>
                  <TextField fullWidth name="name" defaultValue={student.name} placeholder="Your full name" sx={fieldSx} error={!!errors.name} helperText={errors.name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FieldLabel>Email Address</FieldLabel>
                  <TextField fullWidth disabled defaultValue={student.email} sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FieldLabel>Phone Number</FieldLabel>
                  <TextField fullWidth name="phone" defaultValue={student.phone} placeholder="e.g. 9876543210" sx={fieldSx} error={!!errors.phone} helperText={errors.phone} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FieldLabel>Gender</FieldLabel>
                  <TextField fullWidth name="gender" select defaultValue={student.personalInfo?.gender || ''} sx={fieldSx}>
                    <MenuItem value="">— Select —</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Prefer Not To Say">Prefer Not To Say</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FieldLabel>Date of Birth</FieldLabel>
                  <TextField fullWidth name="dob" type="date" defaultValue={student.personalInfo?.dob?.split?.('T')[0] || ''} InputLabelProps={{ shrink: true }} sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FieldLabel>Marital Status</FieldLabel>
                  <TextField fullWidth name="maritalStatus" select defaultValue={student.personalInfo?.maritalStatus || ''} sx={fieldSx}>
                    <MenuItem value="">— Select —</MenuItem>
                    {['Single', 'Married', 'Divorced', 'Widowed', 'Other'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FieldLabel>Nationality</FieldLabel>
                  <TextField fullWidth name="nationality" select defaultValue={student.personalInfo?.nationality || ''} sx={fieldSx}>
                    <MenuItem value="">— Select —</MenuItem>
                    {NATIONALITIES.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FieldLabel>Passport Number</FieldLabel>
                  <TextField
                    fullWidth name="passportNumber"
                    defaultValue={student.personalInfo?.passportNumber}
                    placeholder="e.g. A1234567"
                    sx={fieldSx}
                    error={!!errors.passportNumber}
                    helperText={errors.passportNumber || '6–12 alphanumeric characters'}
                  />
                </Grid>
              </Grid>

              <SectionTitle>Current Address</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FieldLabel>Street / Area</FieldLabel>
                  <TextField fullWidth name="currentStreet" defaultValue={student.personalInfo?.currentAddress?.street} placeholder="Street or area" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FieldLabel>City</FieldLabel>
                  <TextField fullWidth name="currentCity" defaultValue={student.personalInfo?.currentAddress?.city} placeholder="City" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>State / Province</FieldLabel>
                  <TextField fullWidth name="currentState" defaultValue={student.personalInfo?.currentAddress?.state} placeholder="State" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Country</FieldLabel>
                  <TextField fullWidth name="currentCountry" defaultValue={student.personalInfo?.currentAddress?.country} placeholder="Country" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Postal Code</FieldLabel>
                  <TextField fullWidth name="currentPostal" defaultValue={student.personalInfo?.currentAddress?.postalCode} placeholder="Postal code" sx={fieldSx} />
                </Grid>
              </Grid>

              <SectionTitle>Permanent Address</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FieldLabel>Street / Area</FieldLabel>
                  <TextField fullWidth name="permStreet" defaultValue={student.personalInfo?.permanentAddress?.street} placeholder="Street or area" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FieldLabel>City</FieldLabel>
                  <TextField fullWidth name="permCity" defaultValue={student.personalInfo?.permanentAddress?.city} placeholder="City" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>State / Province</FieldLabel>
                  <TextField fullWidth name="permState" defaultValue={student.personalInfo?.permanentAddress?.state} placeholder="State" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Country</FieldLabel>
                  <TextField fullWidth name="permCountry" defaultValue={student.personalInfo?.permanentAddress?.country} placeholder="Country" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Postal Code</FieldLabel>
                  <TextField fullWidth name="permPostal" defaultValue={student.personalInfo?.permanentAddress?.postalCode} placeholder="Postal code" sx={fieldSx} />
                </Grid>
              </Grid>

              <SaveButton label="Save Personal Info" />
            </form>
          )}

          {/* ── Education Tab ── */}
          {activeTab === 1 && (
            <form onSubmit={handleEducationSave} key={`edu-${student?.updatedAt || ''}`}>
              <Stack spacing={4}>
                <Box>
                  <SectionTitle>10th Grade</SectionTitle>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FieldLabel>School Name</FieldLabel>
                      <TextField fullWidth name="tenthSchool" defaultValue={student.academics?.tenth?.schoolName} placeholder="School name" sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FieldLabel>Board</FieldLabel>
                      <TextField fullWidth name="tenthBoard" defaultValue={student.academics?.tenth?.board} placeholder="e.g. CBSE" sx={fieldSx} />
                    </Grid>
                    <Grid item xs={6} md={1.5}>
                      <FieldLabel>Year</FieldLabel>
                      <TextField fullWidth name="tenthYear" defaultValue={student.academics?.tenth?.passYear} placeholder="2020" sx={fieldSx} />
                    </Grid>
                    <Grid item xs={6} md={1.5}>
                      <FieldLabel>%</FieldLabel>
                      <TextField fullWidth name="tenthPercentage" defaultValue={student.academics?.tenth?.percentage} placeholder="85" sx={fieldSx} />
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <SectionTitle>12th Grade</SectionTitle>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FieldLabel>School Name</FieldLabel>
                      <TextField fullWidth name="twelfthSchool" defaultValue={student.academics?.twelfth?.schoolName} placeholder="School name" sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FieldLabel>Board</FieldLabel>
                      <TextField fullWidth name="twelfthBoard" defaultValue={student.academics?.twelfth?.board} placeholder="e.g. CBSE" sx={fieldSx} />
                    </Grid>
                    <Grid item xs={6} md={1.5}>
                      <FieldLabel>Year</FieldLabel>
                      <TextField fullWidth name="twelfthYear" defaultValue={student.academics?.twelfth?.passYear} placeholder="2022" sx={fieldSx} />
                    </Grid>
                    <Grid item xs={6} md={1.5}>
                      <FieldLabel>%</FieldLabel>
                      <TextField fullWidth name="twelfthPercentage" defaultValue={student.academics?.twelfth?.percentage} placeholder="80" sx={fieldSx} />
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <SectionTitle>Undergraduate (if applicable)</SectionTitle>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FieldLabel>Degree</FieldLabel>
                      <TextField fullWidth name="ugDegree" defaultValue={student.academics?.undergraduate?.degree} placeholder="e.g. B.Tech" sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FieldLabel>College Name</FieldLabel>
                      <TextField fullWidth name="ugCollege" defaultValue={student.academics?.undergraduate?.collegeName} placeholder="College name" sx={fieldSx} />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <FieldLabel>Pass Year</FieldLabel>
                      <TextField fullWidth name="ugYear" defaultValue={student.academics?.undergraduate?.passYear} placeholder="2024" sx={fieldSx} />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <FieldLabel>CGPA / %</FieldLabel>
                      <TextField fullWidth name="ugCgpa" defaultValue={student.academics?.undergraduate?.cgpa} placeholder="8.5" sx={fieldSx} />
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <SectionTitle>English Proficiency</SectionTitle>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FieldLabel>IELTS Overall Score</FieldLabel>
                      <TextField fullWidth name="ieltsScore" defaultValue={student.academics?.ielts?.overallScore} placeholder="e.g. 7.0" sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FieldLabel>TOEFL Score</FieldLabel>
                      <TextField fullWidth name="toeflScore" defaultValue={student.academics?.toefl?.overallScore} placeholder="e.g. 100" sx={fieldSx} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FieldLabel>PTE Score</FieldLabel>
                      <TextField fullWidth name="pteScore" defaultValue={student.academics?.pte?.overallScore} placeholder="e.g. 65" sx={fieldSx} />
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
              <SaveButton label="Save Education Info" />
            </form>
          )}

          {/* ── Family & More Tab ── */}
          {activeTab === 2 && (
            <form onSubmit={handleFamilySave} key={`family-${student?.updatedAt || ''}`}>
              <SectionTitle>Father's Details</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Father's Name</FieldLabel>
                  <TextField fullWidth name="fatherName" defaultValue={student.personalInfo?.fatherName} placeholder="Full name" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Occupation</FieldLabel>
                  <TextField fullWidth name="fatherOccupation" defaultValue={student.personalInfo?.fatherOccupation} placeholder="Occupation" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Phone Number</FieldLabel>
                  <TextField fullWidth name="fatherPhone" defaultValue={student.personalInfo?.fatherPhone} placeholder="Phone" sx={fieldSx} />
                </Grid>
              </Grid>

              <SectionTitle>Mother's Details</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Mother's Name</FieldLabel>
                  <TextField fullWidth name="motherName" defaultValue={student.personalInfo?.motherName} placeholder="Full name" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Occupation</FieldLabel>
                  <TextField fullWidth name="motherOccupation" defaultValue={student.personalInfo?.motherOccupation} placeholder="Occupation" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Phone Number</FieldLabel>
                  <TextField fullWidth name="motherPhone" defaultValue={student.personalInfo?.motherPhone} placeholder="Phone" sx={fieldSx} />
                </Grid>
              </Grid>

              <SectionTitle>Guardian (if different)</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Guardian's Name</FieldLabel>
                  <TextField fullWidth name="guardianName" defaultValue={student.personalInfo?.guardianName} placeholder="Full name" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Relationship</FieldLabel>
                  <TextField fullWidth name="guardianRelation" defaultValue={student.personalInfo?.guardianRelation} placeholder="e.g. Uncle" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Phone Number</FieldLabel>
                  <TextField fullWidth name="guardianPhone" defaultValue={student.personalInfo?.guardianPhone} placeholder="Phone" sx={fieldSx} />
                </Grid>
              </Grid>

              <SectionTitle>Study Preferences</SectionTitle>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Study Level</FieldLabel>
                  <TextField fullWidth name="studyLevel" select defaultValue={student.preferences?.studyLevel || ''} sx={fieldSx}>
                    <MenuItem value="">— Select —</MenuItem>
                    {STUDY_LEVELS.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Intake Preference</FieldLabel>
                  <TextField fullWidth name="intakePreference" defaultValue={student.preferences?.intakePreference} placeholder="e.g. Fall 2025" sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FieldLabel>Target Countries</FieldLabel>
                  <TextField fullWidth name="targetCountries" defaultValue={student.preferences?.targetCountries?.join(', ')} placeholder="e.g. UK, Canada, Australia" sx={fieldSx} />
                </Grid>
              </Grid>

              <SaveButton label="Save Family & Preferences" />
            </form>
          )}

          {/* ── Documents Tab ── */}
          {activeTab === 3 && (
            <Box>
              <input ref={fileInputRef} type="file" hidden accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} />
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 3 }}>
                Upload your documents below. Files are reviewed by your counselor. Max 10MB per file (PDF, DOC, JPG, PNG).
              </Typography>
              <Stack spacing={2}>
                {STUDENT_DOCUMENTS.map((doc) => {
                  const uploaded = getDocForType(doc.key);
                  const isUploading = uploadingDoc === doc.key;
                  const isScanning = scanningDoc === doc.key;
                  const isDeleting = deletingDoc === uploaded?._id;
                  const statusCfg = uploaded ? STATUS_CONFIG[uploaded.status] || STATUS_CONFIG.Pending : null;

                  return (
                    <Box key={doc.key} sx={{
                      p: 2.5, borderRadius: '20px',
                      border: `1px solid ${uploaded ? alpha(statusCfg.color, 0.2) : alpha(theme.palette.divider, 0.08)}`,
                      bgcolor: uploaded ? alpha(statusCfg.color, 0.03) : '#f8fafc',
                      transition: 'all 0.2s ease',
                    }}>
                      {(isUploading || isScanning) && <LinearProgress sx={{ mb: 1.5, borderRadius: 2, height: 3 }} />}
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: uploaded ? alpha(statusCfg.color, 0.1) : alpha('#94a3b8', 0.08), color: uploaded ? statusCfg.color : '#94a3b8', display: 'flex' }}>
                          <DocIcon />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>{doc.label}</Typography>
                            {doc.required && <Chip label="Required" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: alpha('#EF4444', 0.08), color: '#EF4444', '& .MuiChip-label': { px: 0.8 } }} />}
                          </Stack>
                          {uploaded ? (
                            <Stack spacing={0.2}>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.3 }}>
                                {statusCfg.icon && <Box sx={{ color: statusCfg.color, display: 'flex' }}>{statusCfg.icon}</Box>}
                                <Typography variant="caption" sx={{ color: statusCfg.color, fontWeight: 700 }}>{statusCfg.label}</Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                  • {uploaded.fileName} • {new Date(uploaded.uploadedDate).toLocaleDateString()}
                                </Typography>
                              </Stack>
                              {uploaded.status === 'Rejected' && uploaded.rejectionReason && (
                                <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 600, fontSize: '0.72rem' }}>
                                  Reason: {uploaded.rejectionReason}
                                </Typography>
                              )}
                            </Stack>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>Not uploaded yet</Typography>
                          )}
                        </Box>
                        <Stack direction="row" spacing={1}>
                          {uploaded && (
                            <>
                              <Tooltip title="Preview">
                                <IconButton size="small" onClick={() => window.open(uploaded.fileUrl, '_blank')} sx={{ color: '#3B82F6', bgcolor: alpha('#3B82F6', 0.06), '&:hover': { bgcolor: alpha('#3B82F6', 0.12) } }}>
                                  <PreviewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" disabled={isDeleting} onClick={() => handleDelete(uploaded._id)} sx={{ color: '#EF4444', bgcolor: alpha('#EF4444', 0.06), '&:hover': { bgcolor: alpha('#EF4444', 0.12) } }}>
                                  {isDeleting ? <CircularProgress size={14} /> : <DeleteIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Button
                            variant={uploaded ? 'outlined' : 'contained'}
                            size="small"
                            startIcon={(isUploading || isScanning) ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : <UploadIcon />}
                            disabled={isUploading || isScanning}
                            onClick={() => triggerUpload(doc.key)}
                            sx={{
                              borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                              fontSize: '0.78rem', py: 0.8, px: 2,
                              ...(uploaded ? {} : { bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' } }),
                            }}
                          >
                            {isUploading ? 'Uploading...' : isScanning ? 'Scanning...' : uploaded ? 'Replace' : 'Upload'}
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>
      </Paper>

      {/* AI Pre-Scan Result Dialog */}
      <Dialog
        open={!!scanResult}
        onClose={() => setScanResult(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 0.5 } }}
      >
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: alpha('#F59E0B', 0.1), color: '#D97706', display: 'flex', flexShrink: 0 }}>
                <AIIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>Sarah noticed something</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>AI Document Pre-Check · {scanResult?.docType}</Typography>
              </Box>
            </Stack>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: alpha('#F59E0B', 0.05), border: `1px solid ${alpha('#F59E0B', 0.2)}` }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400E', lineHeight: 1.75 }}>
                {scanResult?.message}
              </Typography>
            </Paper>
            {scanResult?.issues?.length > 0 && (
              <Stack spacing={0.8}>
                {scanResult.issues.map((issue, i) => (
                  <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#F59E0B', mt: 0.85, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', lineHeight: 1.65 }}>{issue}</Typography>
                  </Stack>
                ))}
              </Stack>
            )}
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, lineHeight: 1.6 }}>
              You can upload anyway — your counselor will review it. Or cancel and prepare a better version first.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setScanResult(null)}
            variant="outlined"
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, borderColor: alpha('#94a3b8', 0.3), color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => doUpload(scanResult.file, scanResult.docType)}
            variant="contained"
            disabled={uploadingDoc === scanResult?.docType}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' } }}
          >
            {uploadingDoc === scanResult?.docType ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Upload Anyway'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ fontWeight: 700, borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileBuilder;
