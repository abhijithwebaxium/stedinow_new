import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  Slide,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  Chip,
  TextField,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import StageChecklist from '../StageChecklist';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Mandatory documents for study abroad
const MANDATORY_DOCUMENTS = [
  'Passport',
  'Photo',
  '10th Certificate',
  '10th Marksheet',
  '12th Certificate',
  '12th Marksheet',
  'Degree Certificate',
  'Degree Marksheet',
  'IELTS Certificate',
  'Bank Statement',
];

// Optional documents
const OPTIONAL_DOCUMENTS = [
  'Aadhar Card',
  'PAN Card',
  'Degree Transcript',
  'Provisional Certificate',
  'Consolidated Marksheet',
  'Migration Certificate',
  'PG Certificate',
  'PG Marksheet',
  'PG Transcript',
  'Work Experience Certificate',
  'Salary Slips',
  'TOEFL Certificate',
  'PTE Certificate',
  'Duolingo Certificate',
  'GRE Scorecard',
  'GMAT Scorecard',
  'SAT Scorecard',
  'LOR - Letter of Recommendation',
  'SOP - Statement of Purpose',
  'CV/Resume',
  'ITR',
  'Loan Sanction Letter',
  'Sponsor Letter',
  'Affidavit of Support',
  'Offer Letter',
  'Acceptance Letter',
  'Visa Application',
  'Visa Approval',
  'Medical Certificate',
  'Police Clearance',
  'Other',
];

const StudentDocumentsModal = ({ open, onClose, student }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDocId, setSelectedDocId] = useState(null);

  useEffect(() => {
    if (open && student) {
      fetchDocuments();
    }
  }, [open, student]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/api/students/${student._id}/documents`,
        { withCredentials: true }
      );
      if (response.data.status === 'success') {
        setDocuments(response.data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (documentType, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(documentType);
    setError('');
    setUploadProgress({ ...uploadProgress, [documentType]: 0 });

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    formData.append('description', '');

    try {
      await axios.post(
        `${API_URL}/api/students/${student._id}/documents`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress({ ...uploadProgress, [documentType]: percentCompleted });
          },
        }
      );

      setSuccess(`${documentType} uploaded successfully`);
      fetchDocuments();

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(null);
      setUploadProgress({ ...uploadProgress, [documentType]: 0 });
    }
  };

  const handlePreview = async (documentId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/students/${student._id}/documents/${documentId}/download`,
        {
          withCredentials: true,
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (err) {
      setError('Failed to preview document');
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/students/${student._id}/documents/${documentId}/download`,
        {
          withCredentials: true,
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download document');
    }
  };

  const handleDelete = async (documentId, documentType) => {
    if (!window.confirm(`Are you sure you want to delete this ${documentType}?`)) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/students/${student._id}/documents/${documentId}`,
        { withCredentials: true }
      );
      setSuccess('Document deleted successfully');
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleVerify = async (documentId) => {
    try {
      await axios.patch(
        `${API_URL}/api/students/${student._id}/documents/${documentId}/verify`,
        {},
        { withCredentials: true }
      );
      setSuccess('Document verified successfully');
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify document');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/api/students/${student._id}/documents/${selectedDocId}/reject`,
        { reason: rejectionReason },
        { withCredentials: true }
      );
      setSuccess('Document rejected');
      setRejectDialogOpen(false);
      setRejectionReason('');
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isDocumentUploaded = (docType) => {
    return documents.find(doc => doc.documentType === docType);
  };

  const renderDocumentCard = (docType) => {
    const uploadedDoc = isDocumentUploaded(docType);
    const isUploading = uploading === docType;
    const progress = uploadProgress[docType] || 0;

    return (
      <Card
        key={docType}
        sx={{
          mb: 2,
          border: uploadedDoc ? '2px solid' : '1px solid',
          borderColor: uploadedDoc 
            ? (uploadedDoc.status === 'Verified' ? 'success.main' : uploadedDoc.status === 'Rejected' ? 'error.main' : 'warning.main') 
            : 'divider',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body1" fontWeight={600}>
                  {docType}
                </Typography>
                {uploadedDoc && (
                  <Chip 
                    label={uploadedDoc.status} 
                    size="small" 
                    color={uploadedDoc.status === 'Verified' ? 'success' : uploadedDoc.status === 'Rejected' ? 'error' : 'warning'}
                    icon={uploadedDoc.status === 'Verified' ? <CheckCircleIcon /> : uploadedDoc.status === 'Rejected' ? <ErrorIcon /> : <PendingIcon />}
                    sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.65rem', fontWeight: 900 } }}
                  />
                )}
              </Box>

              {uploadedDoc && (
                <>
                  <Typography variant="caption" color="text.secondary" display="block">
                    File: {uploadedDoc.fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Size: {formatFileSize(uploadedDoc.fileSize)} |
                    Uploaded: {new Date(uploadedDoc.uploadedDate || uploadedDoc.uploadedAt).toLocaleDateString()}
                  </Typography>
                  {uploadedDoc.status === 'Rejected' && (
                    <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5, fontWeight: 600 }}>
                      Reason: {uploadedDoc.rejectionReason}
                    </Typography>
                  )}
                </>
              )}

              {isUploading && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress variant="determinate" value={progress} />
                  <Typography variant="caption" color="text.secondary">
                    Uploading... {progress}%
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              {uploadedDoc ? (
                <>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handlePreview(uploadedDoc._id)}
                    title="Preview"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleDownload(uploadedDoc._id, uploadedDoc.fileName)}
                    title="Download"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(uploadedDoc._id, docType)}
                    title="Delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, alignSelf: 'center' }} />
                  
                  {uploadedDoc.status !== 'Verified' && (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleVerify(uploadedDoc._id)}
                      title="Approve Document"
                    >
                      <ThumbUpIcon fontSize="small" />
                    </IconButton>
                  )}
                  
                  {uploadedDoc.status !== 'Rejected' && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedDocId(uploadedDoc._id);
                        setRejectDialogOpen(true);
                      }}
                      title="Reject Document"
                    >
                      <ThumbDownIcon fontSize="small" />
                    </IconButton>
                  )}
                </>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  disabled={isUploading}
                >
                  Upload
                  <input
                    type="file"
                    hidden
                    onChange={(e) => handleFileSelect(docType, e)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    setUploadProgress({});
    onClose();
  };

  if (!student) return null;

  const mandatoryCount = MANDATORY_DOCUMENTS.filter(doc => isDocumentUploaded(doc)).length;
  const optionalCount = OPTIONAL_DOCUMENTS.filter(doc => isDocumentUploaded(doc)).length;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slots={{
        transition: Transition,
      }}
      keepMounted
    >
      <DialogTitle>
        <Box>
          <Typography variant="h6">Documents - {student.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            Student ID: {student.studentId}
          </Typography>
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

        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label={`Mandatory Documents (${mandatoryCount}/${MANDATORY_DOCUMENTS.length})`} />
          <Tab label={`Optional Documents (${optionalCount}/${OPTIONAL_DOCUMENTS.length})`} />
          <Tab label="Stage Checklist" />
        </Tabs>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="body2" color="text.secondary">
              Loading documents...
            </Typography>
          </Box>
        ) : (
          <Box>
            {tabValue === 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  These documents are required for application processing
                </Typography>
                {MANDATORY_DOCUMENTS.map(renderDocumentCard)}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload these documents as needed based on your destination and course
                </Typography>
                {OPTIONAL_DOCUMENTS.map(renderDocumentCard)}
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Current Stage: <strong>{student.currentStage}</strong>
                </Typography>
                <StageChecklist
                  studentId={student._id}
                  stage={student.currentStage}
                  onChecklistUpdate={fetchDocuments}
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this document. This will be visible to the student.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error" variant="contained">Reject</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default StudentDocumentsModal;
