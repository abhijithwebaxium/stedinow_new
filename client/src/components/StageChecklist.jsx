import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ScheduleIcon from '@mui/icons-material/Schedule';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Stage flow mapping
const STAGE_FLOW = {
  'Lead Capture & Qualification': 'Initial Assessment & Counselling',
  'Initial Assessment & Counselling': 'Conversion Decision',
  'Conversion Decision': 'Student Registration',
  'Student Registration': 'Application Submission',
  'Application Submission': 'Offer Management',
  'Offer Management': 'Financial Arrangements',
  'Financial Arrangements': 'Visa Processing',
  'Visa Processing': 'Pre-Departure Readiness',
  'Pre-Departure Readiness': 'Arrival & Initial Setup',
  'Arrival & Initial Setup': 'Academic Integration',
  'Academic Integration': 'File Completion',
  'File Completion': null, // Last stage
};

// Phase for each stage
const STAGE_PHASES = {
  'Lead Capture & Qualification': 'Lead Acquisition',
  'Initial Assessment & Counselling': 'Lead Acquisition',
  'Conversion Decision': 'Lead Acquisition',
  'Student Registration': 'Student Onboarding',
  'Application Submission': 'Student Onboarding',
  'Offer Management': 'Student Onboarding',
  'Financial Arrangements': 'Visa Preparation',
  'Visa Processing': 'Visa Preparation',
  'Pre-Departure Readiness': 'Visa Preparation',
  'Arrival & Initial Setup': 'Post-Arrival Support',
  'Academic Integration': 'Post-Arrival Support',
  'File Completion': 'Post-Arrival Support',
};

// First status for each stage
const STAGE_FIRST_STATUS = {
  'Lead Capture & Qualification': 'New Inquiry',
  'Initial Assessment & Counselling': 'Assessment Pending',
  'Conversion Decision': 'Proposal Presented',
  'Student Registration': 'Video Verification',
  'Application Submission': 'Application In Progress',
  'Offer Management': 'Offer Under Review',
  'Financial Arrangements': 'Financial Planning In Progress',
  'Visa Processing': 'Visa Application In Progress',
  'Pre-Departure Readiness': 'Preparation In Progress',
  'Arrival & Initial Setup': 'En Route',
  'Academic Integration': 'Integration In Progress',
  'File Completion': 'Final Call Pending',
};

function StageChecklist({ studentId, stage, onChecklistUpdate }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const fileInputRefs = useRef({});
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [scheduledDateTime, setScheduledDateTime] = useState(null);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [completionDateTime, setCompletionDateTime] = useState(null);

  useEffect(() => {
    if (studentId && stage) {
      fetchChecklistProgress();
    }
  }, [studentId, stage]);

  const fetchChecklistProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/students/${studentId}/checklist?stage=${encodeURIComponent(stage)}`,
        { withCredentials: true }
      );

      console.log('Checklist progress response:', response.data);

      if (response.data.status === 'success') {
        setProgress(response.data.progress);
        console.log('Progress state updated:', response.data.progress);
        console.log('Document details:', response.data.progress.details?.documents);
      }
    } catch (err) {
      console.error('Failed to fetch checklist:', err);
      setError('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (itemId, currentlyCompleted, task) => {
    // Special handling for video verification task
    if (itemId === 'video_verification' && !currentlyCompleted) {
      setSelectedTask(task);
      setCompletionDateTime(dayjs());
      setCompletionDialogOpen(true);
      return;
    }

    try {
      const response = await axios.patch(
        `${API_URL}/api/students/${studentId}/checklist`,
        {
          stage,
          itemId,
          itemType: 'task',
          completed: !currentlyCompleted,
        },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        await fetchChecklistProgress();
        if (onChecklistUpdate) onChecklistUpdate();
      }
    } catch (err) {
      console.error('Failed to update checklist item:', err);
      setError('Failed to update checklist item');
    }
  };

  const handleScheduleTask = (task) => {
    setSelectedTask(task);
    setScheduledDateTime(task.scheduledAt ? dayjs(task.scheduledAt) : null);
    setScheduleDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!scheduledDateTime) {
      setError('Please select a date and time');
      return;
    }

    try {
      const response = await axios.patch(
        `${API_URL}/api/students/${studentId}/checklist/schedule`,
        {
          stage,
          itemId: selectedTask.id,
          itemType: 'task',
          scheduledAt: scheduledDateTime.toISOString(),
        },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setSuccess('Schedule saved successfully!');
        setScheduleDialogOpen(false);
        await fetchChecklistProgress();
        if (onChecklistUpdate) onChecklistUpdate();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save schedule:', err);
      setError(err.response?.data?.message || 'Failed to save schedule');
    }
  };

  const handleSaveCompletion = async () => {
    if (!completionDateTime) {
      setError('Please select a date and time');
      return;
    }

    try {
      const response = await axios.patch(
        `${API_URL}/api/students/${studentId}/checklist`,
        {
          stage,
          itemId: selectedTask.id,
          itemType: 'task',
          completed: true,
          completedAt: completionDateTime.toISOString(),
        },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setSuccess('Task marked as completed!');
        setCompletionDialogOpen(false);
        await fetchChecklistProgress();
        if (onChecklistUpdate) onChecklistUpdate();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save completion:', err);
      setError(err.response?.data?.message || 'Failed to save completion');
    }
  };

  const handleDocumentUpload = async (docId, docType, file) => {
    console.log('handleDocumentUpload called', { docId, docType, file });

    if (!file) {
      console.log('No file provided');
      return;
    }

    try {
      setUploadingDoc(docId);
      setError('');

      console.log('Uploading to:', `${API_URL}/api/students/${studentId}/documents`);

      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', docType);

      const response = await axios.post(
        `${API_URL}/api/students/${studentId}/documents`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Upload response:', response.data);

      if (response.data.status === 'success') {
        setSuccess('Document uploaded successfully!');

        // Wait a moment for the backend to complete processing
        await new Promise(resolve => setTimeout(resolve, 500));

        // Refresh checklist to show updated status
        await fetchChecklistProgress();
        if (onChecklistUpdate) onChecklistUpdate();

        console.log('Checklist refreshed after upload');

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(null);
      // Reset file input
      if (fileInputRefs.current[docId]) {
        fileInputRefs.current[docId].value = '';
      }
    }
  };

  const handleUploadClick = (docId) => {
    console.log('Upload button clicked for:', docId);
    console.log('File input ref:', fileInputRefs.current[docId]);
    if (fileInputRefs.current[docId]) {
      fileInputRefs.current[docId].click();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Loading checklist...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!progress) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No checklist available for this stage
      </Alert>
    );
  }

  const { totalItems, completedItems, percentage, details } = progress;
  const hasDocuments = details.documents.length > 0;
  const hasTasks = details.tasks.length > 0;

  return (
    <Card>
      <CardContent>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Stage Checklist</Typography>
            <Chip
              label={`${completedItems}/${totalItems} Completed`}
              color={percentage === 100 ? 'success' : 'primary'}
              size="small"
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {percentage}% Complete
          </Typography>
        </Box>

        {hasDocuments && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Documents ({details.documents.filter(d => d.completed).length}/{details.documents.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {details.documents.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 0.5,
                    }}
                  >
                    {doc.completed ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                    )}
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: doc.completed ? 'line-through' : 'none',
                          color: doc.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {doc.label}
                      </Typography>
                      {doc.required && (
                        <Chip label="Required" size="small" color="error" sx={{ height: 20 }} />
                      )}
                    </Box>
                    {doc.completed ? (
                      <>
                        {doc.completedAt && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(doc.completedAt).toLocaleDateString()}
                          </Typography>
                        )}
                        {doc.documentId && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => window.open(`${API_URL}/api/students/${studentId}/documents/${doc.documentId}/download`, '_blank')}
                          >
                            View
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <input
                          type="file"
                          ref={(el) => (fileInputRefs.current[doc.id] = el)}
                          style={{ display: 'none' }}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => handleDocumentUpload(doc.id, doc.type, e.target.files[0])}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={uploadingDoc === doc.id ? <CircularProgress size={16} /> : <UploadFileIcon />}
                          onClick={() => handleUploadClick(doc.id)}
                          disabled={uploadingDoc === doc.id}
                        >
                          {uploadingDoc === doc.id ? 'Uploading...' : 'Upload'}
                        </Button>
                      </>
                    )}
                  </Box>
                ))}
                {details.documents.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No document requirements for this stage
                  </Typography>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {hasTasks && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="secondary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Tasks ({details.tasks.filter(t => t.completed).length}/{details.tasks.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {details.tasks.map((task) => (
                  <Box
                    key={task.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 0.5,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={task.completed}
                          onChange={() => handleTaskToggle(task.id, task.completed, task)}
                          size="small"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: task.completed ? 'line-through' : 'none',
                              color: task.completed ? 'text.secondary' : 'text.primary',
                            }}
                          >
                            {task.label}
                          </Typography>
                          {task.required && (
                            <Chip label="Required" size="small" color="error" sx={{ height: 20 }} />
                          )}
                        </Box>
                      }
                      sx={{ ml: 0, flex: 1 }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {task.scheduledAt && !task.completed && (
                        <Chip
                          label={`Scheduled: ${dayjs(task.scheduledAt).format('MMM DD, YYYY hh:mm A')}`}
                          size="small"
                          color="info"
                          sx={{ height: 24 }}
                        />
                      )}
                      {task.completedAt && task.completed && (
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(task.completedAt).format('MMM DD, YYYY hh:mm A')}
                        </Typography>
                      )}
                      {!task.completed && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ScheduleIcon />}
                          onClick={() => handleScheduleTask(task)}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          Schedule
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
                {details.tasks.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No task requirements for this stage
                  </Typography>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {percentage === 100 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            All checklist items completed! You can now progress to the next stage.
          </Alert>
        )}
      </CardContent>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Schedule Task</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {selectedTask?.label}
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Scheduled Date & Time"
                value={scheduledDateTime}
                onChange={(newValue) => setScheduledDateTime(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSchedule} variant="contained">
            Save Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Completion Dialog for Video Verification */}
      <Dialog open={completionDialogOpen} onClose={() => setCompletionDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Complete Video Verification</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Please specify the date and time when the video verification was completed.
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Completion Date & Time"
                value={completionDateTime}
                onChange={(newValue) => setCompletionDateTime(newValue)}
                maxDateTime={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompletionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCompletion} variant="contained">
            Mark as Complete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default StageChecklist;
