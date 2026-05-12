import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Slide,
  Grid,
  Typography,
  Divider,
  MenuItem,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import PublicIcon from '@mui/icons-material/Public';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import NotesIcon from '@mui/icons-material/Notes';
import { alpha, styled } from '@mui/material/styles';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Status color mapping
const STATUS_COLORS = {
  Draft: 'default',
  'In Progress': 'info',
  Submitted: 'warning',
  'Under Review': 'primary',
  'Conditional Offer': 'success',
  'Unconditional Offer': 'success',
  Rejected: 'error',
  Withdrawn: 'error',
  Accepted: 'success',
  Deferred: 'warning',
};

const StyledFormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: '24px',
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.4) 
    : alpha('#FFFFFF', 0.8),
  backdropFilter: "blur(24px) saturate(180%)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  position: 'relative',
  overflow: 'hidden',
}));

const FormHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  position: 'relative',
  zIndex: 1,
}));

const InputIconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
    fontSize: '1.2rem',
  },
  '& .MuiTypography-root': {
    fontWeight: 700,
    fontSize: '0.85rem',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    backgroundColor: alpha(theme.palette.background.paper, 0.5),
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
    }
  }
}));

const StudentApplicationsModal = ({ open, onClose, student }) => {
  const [applications, setApplications] = useState([]);
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create application states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [availableIntakes, setAvailableIntakes] = useState([]);
  const [intake, setIntake] = useState('');
  const [notes, setNotes] = useState('');

  // Follow-up states
  const [followupDialogOpen, setFollowupDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [followupEvent, setFollowupEvent] = useState('');
  const [followupNotes, setFollowupNotes] = useState('');

  // History dialog state
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedApplicationHistory, setSelectedApplicationHistory] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (open && student) {
      fetchApplications();
      fetchCountries();
    }
  }, [open, student]);

  useEffect(() => {
    if (selectedCountry) {
      fetchUniversities(selectedCountry);
    } else {
      setUniversities([]);
      setSelectedUniversity('');
      setCourses([]);
      setSelectedCourse('');
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedUniversity) {
      fetchCourses(selectedUniversity);
    } else {
      setCourses([]);
      setSelectedCourse('');
      setAvailableIntakes([]);
      setIntake('');
    }
  }, [selectedUniversity]);

  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c._id === selectedCourse);
      if (course && course.intakes && course.intakes.length > 0) {
        setAvailableIntakes(course.intakes);
      } else {
        setAvailableIntakes([]);
      }
      setIntake('');
    } else {
      setAvailableIntakes([]);
      setIntake('');
    }
  }, [selectedCourse, courses]);

  const fetchApplications = async () => {
    if (!student) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/applications/students/${student._id}/applications`,
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setApplications(response.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/countries`, {
        withCredentials: true,
      });

      if (response.data.status === 'success') {
        setCountries(response.data.countries || []);
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err);
    }
  };

  const fetchUniversities = async (country) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/universities?country=${encodeURIComponent(country)}`,
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setUniversities(response.data.universities || []);
      }
    } catch (err) {
      console.error('Failed to fetch universities:', err);
      setError('Failed to load universities');
    }
  };

  const fetchCourses = async (universityId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/courses?university=${universityId}`,
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setCourses(response.data.courses || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses');
    }
  };

  const handleCreateApplication = async () => {
    if (!selectedCountry || !selectedUniversity || !selectedCourse || !intake) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${API_URL}/api/applications/students/${student._id}/applications`,
        {
          universityId: selectedUniversity,
          courseId: selectedCourse,
          intake,
          notes,
        },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setSuccess('Application created successfully!');
        setShowCreateForm(false);
        resetCreateForm();
        fetchApplications();

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to create application:', err);
      setError(err.response?.data?.message || 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setSelectedCountry('');
    setSelectedUniversity('');
    setSelectedCourse('');
    setIntake('');
    setNotes('');
  };

  const handleFollowupOpen = (application) => {
    setSelectedApplication(application);
    setFollowupDialogOpen(true);
  };

  const handleFollowupClose = () => {
    setFollowupDialogOpen(false);
    setSelectedApplication(null);
    setFollowupEvent('');
    setFollowupNotes('');
  };

  const handleHistoryOpen = (application) => {
    setSelectedApplicationHistory(application);
    setHistoryDialogOpen(true);
  };

  const handleHistoryClose = () => {
    setHistoryDialogOpen(false);
    setSelectedApplicationHistory(null);
  };

  const handleAddFollowup = async () => {
    if (!followupEvent || !followupNotes) {
      setError('Please fill all followup fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${API_URL}/api/applications/${selectedApplication._id}/followup`,
        {
          event: followupEvent,
          notes: followupNotes,
        },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setSuccess('Follow-up added successfully!');
        handleFollowupClose();
        fetchApplications();

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to add followup:', err);
      setError(err.response?.data?.message || 'Failed to add follow-up');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeStages = async (applicationId) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${API_URL}/api/applications/${applicationId}/initialize-stages`,
        {},
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setSuccess('Stages initialized successfully!');
        fetchApplications();

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to initialize stages:', err);
      setError(err.response?.data?.message || 'Failed to initialize stages');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStage = async (applicationId, stageName, stageStatus) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.patch(
        `${API_URL}/api/applications/${applicationId}/stage`,
        {
          stageName,
          stageStatus,
        },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setSuccess('Stage updated successfully!');
        fetchApplications();

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
      setError(err.response?.data?.message || 'Failed to update stage');
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'In Progress':
        return <PlayArrowIcon color="primary" fontSize="small" />;
      case 'Pending':
        return <RadioButtonUncheckedIcon color="disabled" fontSize="small" />;
      default:
        return <RadioButtonUncheckedIcon color="disabled" fontSize="small" />;
    }
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'Pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetCreateForm();
      setShowCreateForm(false);
      setError('');
      setSuccess('');
      onClose();
    }
  };

  if (!student) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        slots={{
          transition: Transition,
        }}
        keepMounted
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Applications - {student.name} ({student.studentId})
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Student Basic Info */}
          <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{student.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {student.phoneCode} {student.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Application Officer
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {student.assigned?.applicationOfficer?.name || 'Not Assigned'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Create Application Button */}
          {!showCreateForm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateForm(true)}
              sx={{ mb: 3, textTransform: 'none' }}
            >
              Create New Application
            </Button>
          )}

          {/* Create Application Form */}
          {showCreateForm && (
            <StyledFormContainer>
              <Box sx={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '200px',
                height: '200px',
                background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
                filter: 'blur(40px)',
                zIndex: 0,
              }} />

              <FormHeader>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                    New Application
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Enter details to initialize a new tracking workflow
                  </Typography>
                </Box>
                <IconButton 
                  onClick={() => { setShowCreateForm(false); resetCreateForm(); }} 
                  size="small"
                  sx={{ 
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                    color: 'error.main',
                    '&:hover': { bgcolor: (theme) => alpha(theme.palette.error.main, 0.2) }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </FormHeader>

              <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
                <Box>
                  <InputIconWrapper>
                    <PublicIcon />
                    <Typography>Target Country</Typography>
                  </InputIconWrapper>
                  <StyledTextField
                    fullWidth
                    select
                    placeholder="Select Country"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    disabled={loading}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country._id} value={country.name}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </StyledTextField>
                </Box>

                <Box>
                  <InputIconWrapper>
                    <AccountBalanceIcon />
                    <Typography>University / Institution</Typography>
                  </InputIconWrapper>
                  <StyledTextField
                    fullWidth
                    select
                    placeholder="Select University"
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    disabled={loading || !selectedCountry || universities.length === 0}
                    helperText={selectedCountry && universities.length === 0 ? 'No universities found for this region' : ''}
                  >
                    {universities.map((university) => (
                      <MenuItem key={university._id} value={university._id}>
                        {university.name} - {university.city || university.country?.name || ''}
                      </MenuItem>
                    ))}
                  </StyledTextField>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <InputIconWrapper>
                      <SchoolIcon />
                      <Typography>Academic Program</Typography>
                    </InputIconWrapper>
                    <StyledTextField
                      fullWidth
                      select
                      placeholder="Select Course"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      disabled={loading || !selectedUniversity || courses.length === 0}
                      helperText={selectedUniversity && courses.length === 0 ? 'No programs currently available' : ''}
                    >
                      {courses.map((course) => (
                        <MenuItem key={course._id} value={course._id}>
                          {course.name} ({course.level})
                        </MenuItem>
                      ))}
                    </StyledTextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <InputIconWrapper>
                      <EventIcon />
                      <Typography>Intake Period</Typography>
                    </InputIconWrapper>
                    <StyledTextField
                      fullWidth
                      select
                      placeholder="Select Intake"
                      value={intake}
                      onChange={(e) => setIntake(e.target.value)}
                      disabled={loading || !selectedCourse || availableIntakes.length === 0}
                      helperText={selectedCourse && availableIntakes.length === 0 ? 'No active intakes for this program' : ''}
                    >
                      {availableIntakes.map((intakeMonth, index) => (
                        <MenuItem key={index} value={intakeMonth}>
                          {intakeMonth}
                        </MenuItem>
                      ))}
                    </StyledTextField>
                  </Grid>
                </Grid>

                <Box>
                  <InputIconWrapper>
                    <NotesIcon />
                    <Typography>Additional Observations</Typography>
                  </InputIconWrapper>
                  <StyledTextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter any specific requirements or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={loading}
                  />
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleCreateApplication}
                    disabled={loading}
                    sx={{
                      flexGrow: 1,
                      py: 2,
                      borderRadius: '16px',
                      fontWeight: 900,
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: (theme) => `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? 'Initializing...' : 'Create Application'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => { setShowCreateForm(false); resetCreateForm(); }}
                    disabled={loading}
                    sx={{
                      px: 4,
                      borderRadius: '16px',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2 }
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>


            </StyledFormContainer>
          )}

          {/* Applications Tabs */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Applications ({applications.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {loading && applications.length === 0 && <LinearProgress sx={{ mb: 2 }} />}

            {!loading && applications.length === 0 && (
              <Alert severity="info">
                No applications yet. Create your first application above.
              </Alert>
            )}

            {applications.length > 0 && (
              <Box>
                {/* Tabs Header */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    {applications.map((app, index) => (
                      <Tab
                        key={app._id}
                        label={
                          <Box sx={{ textAlign: 'left' }}>
                            <Typography variant="body2" fontWeight={600}>
                              {app.university.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {app.applicationId}
                            </Typography>
                          </Box>
                        }
                        sx={{ textTransform: 'none', alignItems: 'flex-start' }}
                      />
                    ))}
                  </Tabs>
                </Box>

                {/* Tab Content */}
                {applications.map((app, index) => (
                  <Box
                    key={app._id}
                    role="tabpanel"
                    hidden={activeTab !== index}
                  >
                    {activeTab === index && (
                      <Paper sx={{ overflow: 'hidden' }}>
                        {/* Application Header */}
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          bgcolor: 'background.default',
                          borderBottom: 1,
                          borderColor: 'divider'
                        }}>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {app.university.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {app.course.name} ({app.course.level})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {app.university.city}, {app.university.country}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={app.status}
                              color={STATUS_COLORS[app.status] || 'default'}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<HistoryIcon />}
                              onClick={() => handleHistoryOpen(app)}
                              sx={{ textTransform: 'none' }}
                            >
                              History
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<DescriptionIcon />}
                              onClick={() => handleFollowupOpen(app)}
                              sx={{ textTransform: 'none' }}
                            >
                              Add Follow-up
                            </Button>
                          </Stack>
                        </Box>

                        {/* Application Details Table */}
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Application ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Intake</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Application Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Submission Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Decision Date</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>{app.applicationId}</TableCell>
                                <TableCell>{app.intake}</TableCell>
                                <TableCell>
                                  {app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>
                                  {app.submissionDate ? new Date(app.submissionDate).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell>
                                  {app.decisionDate ? new Date(app.decisionDate).toLocaleDateString() : '-'}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Application Stages */}
                        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body2" fontWeight={600}>
                              Application Stages:
                            </Typography>
                            {(!app.stages || app.stages.length === 0) && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleInitializeStages(app._id)}
                                disabled={loading}
                                sx={{ textTransform: 'none' }}
                              >
                                Initialize Stages
                              </Button>
                            )}
                          </Box>

                          {(!app.stages || app.stages.length === 0) ? (
                            <Alert severity="info">
                              This application doesn't have stages initialized yet. Click "Initialize Stages" to start tracking progress.
                            </Alert>
                          ) : (
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Stage</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Completed Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {app.stages.map((stage, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          {getStageIcon(stage.status)}
                                          <Typography variant="body2">{stage.name}</Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={stage.status}
                                          size="small"
                                          color={getStageColor(stage.status)}
                                          variant="outlined"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {stage.startDate ? new Date(stage.startDate).toLocaleDateString() : '-'}
                                      </TableCell>
                                      <TableCell>
                                        {stage.completedDate ? new Date(stage.completedDate).toLocaleDateString() : '-'}
                                      </TableCell>
                                      <TableCell>
                                        <Stack direction="row" spacing={1}>
                                          {stage.status === 'Pending' && (
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              onClick={() => handleUpdateStage(app._id, stage.name, 'In Progress')}
                                              disabled={loading}
                                              sx={{ textTransform: 'none' }}
                                            >
                                              Start
                                            </Button>
                                          )}
                                          {stage.status === 'In Progress' && (
                                            <Button
                                              size="small"
                                              variant="contained"
                                              onClick={() => handleUpdateStage(app._id, stage.name, 'Completed')}
                                              disabled={loading}
                                              sx={{ textTransform: 'none' }}
                                            >
                                              Complete
                                            </Button>
                                          )}
                                        </Stack>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                        </Box>

                      </Paper>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog
        open={followupDialogOpen}
        onClose={handleFollowupClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Follow-up</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Application: {selectedApplication.university.name} - {selectedApplication.course.name}
              </Alert>

              <TextField
                fullWidth
                label="Event / Subject"
                value={followupEvent}
                onChange={(e) => setFollowupEvent(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
                placeholder="e.g., Called university, Submitted documents"
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={followupNotes}
                onChange={(e) => setFollowupNotes(e.target.value)}
                disabled={loading}
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFollowupClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddFollowup}
            variant="contained"
            disabled={loading || !followupEvent || !followupNotes}
          >
            {loading ? 'Adding...' : 'Add Follow-up'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={handleHistoryClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Application History</Typography>
            <IconButton onClick={handleHistoryClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedApplicationHistory && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  {selectedApplicationHistory.university.name} - {selectedApplicationHistory.course.name}
                </Typography>
                <Typography variant="caption">
                  Application ID: {selectedApplicationHistory.applicationId}
                </Typography>
              </Alert>

              {/* Complete Timeline */}
              {selectedApplicationHistory.timeline && selectedApplicationHistory.timeline.length > 0 ? (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Timeline
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedApplicationHistory.timeline.slice().reverse().map((event, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              {new Date(event.date).toLocaleString()}
                            </TableCell>
                            <TableCell>{event.event}</TableCell>
                            <TableCell>{event.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No timeline events recorded yet.
                </Alert>
              )}

              {/* Complete History */}
              {selectedApplicationHistory.history && selectedApplicationHistory.history.length > 0 ? (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Change History
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Action Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedApplicationHistory.history.slice().reverse().map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              {new Date(item.date).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip label={item.type} size="small" color="primary" variant="outlined" />
                            </TableCell>
                            <TableCell>{item.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Alert severity="info">
                  No change history recorded yet.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHistoryClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentApplicationsModal;
