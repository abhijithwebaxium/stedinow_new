import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import StageChecklist from "../StageChecklist";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Constants for phases and stages
const PHASES = {
  "Lead Acquisition": [
    "Lead Capture",
    "Initial Assessment",
    "Conversion Decision",
  ],
  "Student Onboarding": [
    "Registration",
    "Application Submission",
    "Offer Management",
  ],
  "Visa Preparation": [
    "Visa Processing",
    "Financial Arrangements",
    "Pre-Departure",
  ],
  "Post-Arrival Support": [
    "Arrival Setup",
    "Academic Integration",
    "File Completion",
  ],
};

const STAGE_STATUSES = {
  "Lead Capture & Qualification": [
    "New Inquiry",
    "Contact In Progress",
    "Qualified Lead",
    "Not Reachable",
    "Invalid Contact",
    "Duplicate Lead",
    "Disqualified",
  ],
  "Initial Assessment & Counselling": [
    "Assessment Pending",
    "Assessment Completed",
    "Plan Dropped",
  ],
  "Conversion Decision": [
    "Proposal Presented",
    "Ready to Enroll",
    "Converted",
    "Drop - Budget",
    "Drop - Timeline",
    "Drop - Competition",
    "Drop - Not Interested",
  ],
  "Student Registration": [
    "Video Verification",
    "Registration Complete",
    "Registration On Hold",
  ],
  "Application Submission": [
    "Application In Progress",
    "Application Submitted",
    "Conditional Offer Letter Received",
    "Unconditional Offer Letter Received",
    "Plan Drop",
  ],
  "Offer Management": [
    "Offer Under Review",
    "Student Considering Multiple Offers",
    "Awaiting Student Decision",
    "Offer Accepted",
    "Offer Declined",
    "Deposit Payment Pending",
    "Enrollment Confirmed",
  ],
  "Financial Arrangements": [
    "Financial Planning In Progress",
    "Loan Application Pending",
    "Loan Sanctioned",
    "Arrangements Complete",
  ],
  "Visa Processing": [
    "Visa Application In Progress",
    "Visa Application Submitted",
    "Visa Application Rejected",
    "Visa Application Re-Submitted",
    "Visa Approved",
  ],
  "Pre-Departure Readiness": [
    "Preparation In Progress",
    "Documentation Completed",
    "Orientation Completed",
    "Ready for Departure",
  ],
  "Arrival & Initial Setup": [
    "En Route",
    "Arrived",
    "Initial Setup In Progress",
    "Setup Complete",
    "Setup Issues",
    "University Registration Pending",
    "University Registration Completed",
  ],
  "Academic Integration": [
    "Integration In Progress",
    "Integration Issues",
    "Successfully Integrated",
  ],
  "File Completion": [
    "Final Call Pending",
    "Issue Resolution In Progress",
    "File Closed",
  ],
};

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

// Stage codes mapping
const STAGE_CODES = {
  'Lead Capture & Qualification': '1.1',
  'Initial Assessment & Counselling': '1.2',
  'Conversion Decision': '1.3',
  'Student Registration': '2.1',
  'Application Submission': '2.2',
  'Offer Management': '2.3',
  'Financial Arrangements': '3.1',
  'Visa Processing': '3.2',
  'Pre-Departure Readiness': '3.3',
  'Arrival & Initial Setup': '4.1',
  'Academic Integration': '4.2',
  'File Completion': '4.3',
};

const StudentFollowupModal = ({ open, onClose, student }) => {
  const [followupData, setFollowupData] = useState({
    notes: "",
    nextFollowupDate: "",
    outcome: "",
    actionTaken: "",
    newStatus: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [checklistProgress, setChecklistProgress] = useState(null);
  const [movingStage, setMovingStage] = useState(false);

  // Application Officer states
  const [applicationOfficers, setApplicationOfficers] = useState([]);
  const [selectedApplicationOfficer, setSelectedApplicationOfficer] = useState("");
  const [applicationOfficerModalOpen, setApplicationOfficerModalOpen] = useState(false);

  useEffect(() => {
    if (open && student) {
      // Set current student to state for updates
      setCurrentStudent({...student});

      // Set available statuses based on current stage
      if (student.currentStage) {
        setAvailableStatuses(STAGE_STATUSES[student.currentStage] || []);
      }

      // Reset form with current status as default
      setFollowupData({
        notes: "",
        nextFollowupDate: "",
        outcome: "",
        actionTaken: "",
        newStatus: student.currentStatus || "",
      });

      // Fetch counselors and checklist progress
      fetchCounselors();
      fetchChecklistProgress();
    }
  }, [open, student]);

  const fetchChecklistProgress = async () => {
    if (!student) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/students/${student._id}/checklist?stage=${encodeURIComponent(student.currentStage)}`,
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setChecklistProgress(response.data.progress);
      }
    } catch (err) {
      console.error('Failed to fetch checklist progress:', err);
    }
  };

  const fetchCounselors = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users?role=Counselor`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setCounselors(response.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch counselors:', err);
    }
  };

  const fetchApplicationOfficers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/application-officers`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setApplicationOfficers(response.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch application officers:', err);
    }
  };

  const handleAssignCounselor = async () => {
    if (!selectedCounselor) {
      setError('Please select a counselor');
      return;
    }

    try {
      const response = await axios.patch(
        `${API_URL}/api/students/${student._id}`,
        {
          assigned: {
            counselor: selectedCounselor,
            assignedDate: new Date(),
            assignedBy: null, // Backend will set this from auth user
          },
        },
        { withCredentials: true }
      );

      setSuccess('Counselor assigned successfully');
      setAssignModalOpen(false);
      setSelectedCounselor("");

      // Update the current student state with the new counselor info
      const assignedCounselor = counselors.find(c => c._id === selectedCounselor);
      if (assignedCounselor) {
        setCurrentStudent({
          ...currentStudent,
          assigned: {
            ...currentStudent.assigned,
            counselor: {
              _id: assignedCounselor._id,
              name: assignedCounselor.name,
            },
          },
        });
      }

      setTimeout(() => {
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign counselor');
    }
  };

  const handleFollowupChange = (e) => {
    setFollowupData({
      ...followupData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleAddFollowup = async () => {
    if (!followupData.notes) {
      setError("Followup notes are required");
      return;
    }

    setLoading(true);
    try {
      // If status is changed, update it along with followup
      if (
        followupData.newStatus &&
        followupData.newStatus !== student.currentStatus
      ) {
        await axios.patch(
          `${API_URL}/api/students/${student._id}/status`,
          {
            phase: student.currentPhase,
            stage: student.currentStage,
            status: followupData.newStatus,
            notes: `Status changed during followup: ${followupData.notes}`,
          },
          { withCredentials: true },
        );
      }

      // Add followup
      await axios.post(
        `${API_URL}/api/students/${student._id}/followup`,
        {
          notes: followupData.notes,
          nextFollowupDate: followupData.nextFollowupDate,
          outcome: followupData.outcome,
          actionTaken: followupData.actionTaken,
        },
        { withCredentials: true },
      );

      setSuccess(
        "Followup added successfully" +
          (followupData.newStatus && followupData.newStatus !== student.currentStatus ? " and status updated" : ""),
      );
      setFollowupData({
        notes: "",
        nextFollowupDate: "",
        outcome: "",
        actionTaken: "",
        newStatus: student.currentStatus || "",
      });

      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add followup");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFollowupData({
        notes: "",
        nextFollowupDate: "",
        outcome: "",
        actionTaken: "",
        newStatus: student?.currentStatus || "",
      });
      setError("");
      setSuccess("");
      onClose();
    }
  };

  const handleMoveToNextStage = async () => {
    const nextStage = STAGE_FLOW[currentStudent.currentStage];
    if (!nextStage) {
      setError('This is the final stage');
      return;
    }

    // Check if moving from "Student Registration" (2.1) to "Application Submission" (2.2)
    if (currentStudent.currentStage === 'Student Registration' && nextStage === 'Application Submission') {
      // Fetch application officers and show the selection modal
      await fetchApplicationOfficers();
      setApplicationOfficerModalOpen(true);
      return;
    }

    // For other stage transitions, proceed normally
    await proceedToNextStage();
  };

  const proceedToNextStage = async (applicationOfficerId = null) => {
    const nextStage = STAGE_FLOW[currentStudent.currentStage];
    if (!nextStage) {
      setError('This is the final stage');
      return;
    }

    try {
      setMovingStage(true);
      setError('');

      const nextPhase = STAGE_PHASES[nextStage];
      const nextStatus = STAGE_FIRST_STATUS[nextStage];

      const requestData = {
        phase: nextPhase,
        stage: nextStage,
        status: nextStatus,
        notes: `Moved from ${currentStudent.currentStage} to ${nextStage} after completing all checklist items`,
      };

      // Add application officer ID if provided
      if (applicationOfficerId) {
        requestData.applicationOfficerId = applicationOfficerId;
      }

      const response = await axios.patch(
        `${API_URL}/api/students/${student._id}/status`,
        requestData,
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setSuccess(`Successfully moved to ${nextStage}!`);
        setApplicationOfficerModalOpen(false);
        setSelectedApplicationOfficer('');

        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to move to next stage:', err);
      setError(err.response?.data?.message || 'Failed to move to next stage');
    } finally {
      setMovingStage(false);
    }
  };

  const handleAssignApplicationOfficer = async () => {
    if (!selectedApplicationOfficer) {
      setError('Please select an application officer');
      return;
    }

    await proceedToNextStage(selectedApplicationOfficer);
  };

  if (!student || !currentStudent) return null;

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
            Student Followup - {currentStudent.name} ({STAGE_CODES[currentStudent.currentStage] || ''})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setChecklistModalOpen(true)}
              sx={{ textTransform: 'none' }}
            >
              Checklist
            </Button>
            {STAGE_FLOW[currentStudent.currentStage] && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleMoveToNextStage}
                disabled={!checklistProgress || checklistProgress.percentage !== 100 || movingStage}
                sx={{
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'success.main',
                    filter: 'brightness(0.95)',
                  }
                }}
              >
                {movingStage ? 'Moving...' : `Move to Next Stage`}
              </Button>
            )}
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Student Basic Details */}
        <Card sx={{ mb: 3, bgcolor: "background.default" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid
              container
              spacing={2}
              sx={{ display: "flex", flexWrap: "wrap" }}
            >
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Student ID
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {currentStudent.studentId}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{currentStudent.email}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">
                  {currentStudent.phoneCode} {currentStudent.phone}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Stage
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                  <Chip
                    label={currentStudent.currentPhase}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={currentStudent.currentStage}
                    size="small"
                    color="secondary"
                  />
                  <Chip label={currentStudent.currentStatus} size="small" />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Assignment Section */}
        <Card sx={{ mb: 3, bgcolor: "background.default" }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Counselor
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentStudent.assigned?.counselor?.name ? (
                    <>Assigned to: <strong>{currentStudent.assigned.counselor.name}</strong></>
                  ) : (
                    <>Not assigned to any counselor</>
                  )}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => setAssignModalOpen(true)}
                disabled={loading}
              >
                {currentStudent.assigned?.counselor ? 'Reassign' : 'Assign'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Assignment Dialog */}
        <Dialog open={assignModalOpen} onClose={() => setAssignModalOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>
            {currentStudent.assigned?.counselor ? 'Reassign Counselor' : 'Assign Counselor'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                select
                label="Select Counselor"
                value={selectedCounselor}
                onChange={(e) => setSelectedCounselor(e.target.value)}
              >
                {counselors.map((counselor) => (
                  <MenuItem key={counselor._id} value={counselor._id}>
                    {counselor.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignCounselor} variant="contained">
              Assign
            </Button>
          </DialogActions>
        </Dialog>

        {/* Application Officer Assignment Dialog */}
        <Dialog
          open={applicationOfficerModalOpen}
          onClose={() => {
            setApplicationOfficerModalOpen(false);
            setSelectedApplicationOfficer('');
            setMovingStage(false);
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            Assign Application Officer
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              Moving to Application Submission stage requires an Application Officer assignment.
            </Alert>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                select
                label="Select Application Officer"
                value={selectedApplicationOfficer}
                onChange={(e) => setSelectedApplicationOfficer(e.target.value)}
              >
                {applicationOfficers.map((officer) => (
                  <MenuItem key={officer._id} value={officer._id}>
                    {officer.name} - {officer.designation || 'Application Officer'}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setApplicationOfficerModalOpen(false);
                setSelectedApplicationOfficer('');
                setMovingStage(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignApplicationOfficer}
              variant="contained"
              disabled={!selectedApplicationOfficer || movingStage}
            >
              {movingStage ? 'Assigning...' : 'Assign & Move to Next Stage'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Followup Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add Followup
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid
            container
            spacing={2}
            sx={{ display: "flex", flexWrap: "wrap" }}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="outcome"
                label="Outcome"
                value={followupData.outcome}
                onChange={handleFollowupChange}
                disabled={loading}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                name="actionTaken"
                label="Action Taken"
                value={followupData.actionTaken}
                onChange={handleFollowupChange}
                disabled={loading}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Next Followup Date"
                  value={followupData.nextFollowupDate ? dayjs(followupData.nextFollowupDate) : null}
                  onChange={(newValue) => {
                    setFollowupData({
                      ...followupData,
                      nextFollowupDate: newValue ? newValue.format('YYYY-MM-DD') : '',
                    });
                  }}
                  disabled={loading}
                  minDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                name="newStatus"
                label="Status"
                value={followupData.newStatus}
                onChange={handleFollowupChange}
                disabled={loading}
              >
                {availableStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="notes"
                label="Followup Notes"
                value={followupData.notes}
                onChange={handleFollowupChange}
                disabled={loading}
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleAddFollowup}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Followup"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Followup History */}
        {student.followup?.followupHistory &&
          student.followup.followupHistory.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Followups
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {student.followup.followupHistory
                  .slice(-5)
                  .reverse()
                  .map((item, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        bgcolor: "background.default",
                        mb: 1,
                        borderRadius: 1,
                      }}
                    >
                      <ListItemText
                        primary={item.notes}
                        secondary={
                          <>
                            <Typography variant="caption" display="block">
                              Date: {new Date(item.date).toLocaleDateString()}
                            </Typography>
                            {item.outcome && (
                              <Typography variant="caption" display="block">
                                Outcome: {item.outcome}
                              </Typography>
                            )}
                            {item.actionTaken && (
                              <Typography variant="caption" display="block">
                                Action Taken: {item.actionTaken}
                              </Typography>
                            )}
                            {item.nextFollowupDate && (
                              <Typography variant="caption" display="block">
                                Next Followup: {new Date(item.nextFollowupDate).toLocaleDateString()}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </Box>
          )}
      </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Checklist Dialog */}
      <Dialog
        open={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        maxWidth="md"
        fullWidth
        slots={{
          transition: Transition,
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Stage Checklist - {currentStudent?.currentStage}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Student: <strong>{currentStudent?.name}</strong> | Stage: <strong>{currentStudent?.currentStage}</strong>
          </Typography>
          {currentStudent && (
            <StageChecklist
              studentId={currentStudent._id}
              stage={currentStudent.currentStage}
              onChecklistUpdate={fetchChecklistProgress}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChecklistModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentFollowupModal;
