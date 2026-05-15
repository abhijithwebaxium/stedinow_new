import { useState, useRef } from 'react';
import { enqueueSnackbar } from 'notistack';
import {
  Box, Typography, Stack, Chip, alpha, useTheme, Paper, InputAdornment,
  TextField, MenuItem, Select, FormControl, CircularProgress, LinearProgress,
  IconButton, Tooltip, Button,
} from '@mui/material';
import {
  DescriptionOutlined as DocIcon,
  CloudUploadOutlined as UploadIcon,
  OpenInNew as PreviewIcon,
  DeleteOutline as DeleteIcon,
  CheckCircle as VerifiedIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AutoAwesomeOutlined as SparkleIcon,
  ReportProblemOutlined as WarningIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const STATUS_CONFIG = {
  Verified: { color: '#10B981', bg: alpha('#10B981', 0.08), icon: <VerifiedIcon sx={{ fontSize: 15 }} />, label: 'Verified' },
  Pending: { color: '#F59E0B', bg: alpha('#F59E0B', 0.08), icon: <PendingIcon sx={{ fontSize: 15 }} />, label: 'Under Review' },
  Rejected: { color: '#EF4444', bg: alpha('#EF4444', 0.08), icon: <RejectedIcon sx={{ fontSize: 15 }} />, label: 'Rejected' },
  Expired: { color: '#94a3b8', bg: alpha('#94a3b8', 0.08), icon: <PendingIcon sx={{ fontSize: 15 }} />, label: 'Expired' },
};

const StudentDocumentsPage = () => {
  const theme = useTheme();
  const { documents, fetchDocuments } = useOutletContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [uploading, setUploading] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [pendingDocType, setPendingDocType] = useState(null);
  const fileInputRef = useRef(null);

  const filtered = (documents || []).filter(d => {
    const matchSearch = d.documentType?.toLowerCase().includes(search.toLowerCase()) ||
      d.fileName?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || d.status === filter;
    return matchSearch && matchFilter;
  });

  const sorted = [...filtered].sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate));

  const triggerUpload = (docType) => { setPendingDocType(docType); fileInputRef.current?.click(); };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !pendingDocType) return;
    e.target.value = '';
    if (file.size > 10 * 1024 * 1024) { enqueueSnackbar('File must be under 10MB', { variant: 'warning' }); return; }
    setUploading(pendingDocType);
    try {
      const fd = new FormData();
      fd.append('document', file);
      fd.append('documentType', pendingDocType);
      await axios.post(`${API_URL}/api/student-portal/documents`, fd, {
        withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchDocuments();
    } catch { enqueueSnackbar('Upload failed. Please try again.', { variant: 'error' }); }
    finally { setUploading(null); setPendingDocType(null); }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.documentType}"?`)) return;
    setDeleting(doc._id);
    try {
      await axios.delete(`${API_URL}/api/student-portal/documents/${doc._id}`, { withCredentials: true });
      await fetchDocuments();
    } catch { enqueueSnackbar('Delete failed. Please try again.', { variant: 'error' }); }
    finally { setDeleting(null); }
  };

  const getSarahFeedback = (doc) => {
    if (uploading === doc.documentType) return { text: "Scanning document...", color: "#3B82F6", icon: <CircularProgress size={14} color="inherit" /> };
    if (doc.status === 'Verified') return { text: "Verified! Your information matches our records perfectly.", color: "#10B981", icon: <SparkleIcon sx={{ fontSize: 14 }} /> };
    if (doc.status === 'Rejected') return { text: `Sarah says: ${doc.rejectionReason || "This document needs to be re-uploaded."}`, color: "#EF4444", icon: <WarningIcon sx={{ fontSize: 14 }} /> };
    
    // Custom heuristic feedback for "Pending" documents
    if (doc.documentType === 'Passport') return { text: "I've detected your name and expiry date. Everything looks standard!", color: "#3B82F6", icon: <SparkleIcon sx={{ fontSize: 14 }} /> };
    return { text: "I've received this. A human counselor will do a final check shortly!", color: "#8B5CF6", icon: <SparkleIcon sx={{ fontSize: 14 }} /> };
  };

  const counts = { All: documents?.length || 0, Pending: 0, Verified: 0, Rejected: 0 };
  (documents || []).forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++; });

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5, fontFamily: '"Outfit", sans-serif' }}>
          My Documents
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
          All your uploaded documents in one place.
        </Typography>
      </Box>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems={{ sm: 'center' }}>
        <TextField
          size="small"
          placeholder="Search documents..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ maxWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'white' } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} /></InputAdornment> }}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {['All', 'Pending', 'Verified', 'Rejected'].map(s => (
            <Chip
              key={s}
              label={`${s} (${counts[s]})`}
              onClick={() => setFilter(s)}
              size="small"
              sx={{
                fontWeight: 700, borderRadius: '10px', cursor: 'pointer',
                bgcolor: filter === s ? '#3B82F6' : 'white',
                color: filter === s ? 'white' : '#64748b',
                border: `1px solid ${filter === s ? '#3B82F6' : alpha('#94a3b8', 0.2)}`,
              }}
            />
          ))}
        </Stack>
      </Stack>

      <input ref={fileInputRef} type="file" hidden accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} />

      {sorted.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, borderRadius: '28px', border: `1px solid rgba(0,0,0,0.06)`, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>📄</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>No Documents Yet</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 3 }}>
            Upload documents in My Profile → Documents tab.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {sorted.map(doc => {
            const cfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.Pending;
            const isUp = uploading === doc.documentType;
            const isDel = deleting === doc._id;
            const sarah = getSarahFeedback(doc);
            return (
              <Paper key={doc._id} elevation={0} sx={{
                p: 2.5, borderRadius: '20px',
                border: `1px solid ${alpha(cfg.color, 0.15)}`,
                bgcolor: cfg.bg,
                boxShadow: 'none',
              }}>
                {isUp && <LinearProgress sx={{ mb: 1.5, borderRadius: 2, height: 3 }} />}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                  <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'white', color: cfg.color, display: 'flex', flexShrink: 0 }}>
                    <DocIcon />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>{doc.documentType}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 0.3 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Box sx={{ color: cfg.color, display: 'flex' }}>{cfg.icon}</Box>
                        <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 700, fontSize: '0.72rem' }}>{cfg.label}</Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.72rem' }}>
                        • {doc.fileName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.72rem' }}>
                        • {new Date(doc.uploadedDate).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Typography>
                    </Stack>
                    
                    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '12px', bgcolor: alpha(sarah.color, 0.04), border: `1px dashed ${alpha(sarah.color, 0.2)}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: sarah.color, display: 'flex' }}>{sarah.icon}</Box>
                      <Typography variant="caption" sx={{ color: sarah.color, fontWeight: 700, fontSize: '0.7rem' }}>
                        {sarah.text}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1} flexShrink={0}>
                    <Tooltip title="Preview">
                      <IconButton size="small" onClick={() => window.open(doc.fileUrl, '_blank')}
                        sx={{ bgcolor: 'white', color: '#3B82F6', '&:hover': { bgcolor: alpha('#3B82F6', 0.08) } }}>
                        <PreviewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Replace">
                      <IconButton size="small" disabled={isUp} onClick={() => triggerUpload(doc.documentType)}
                        sx={{ bgcolor: 'white', color: '#64748b', '&:hover': { bgcolor: alpha('#64748b', 0.08) } }}>
                        <UploadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" disabled={isDel} onClick={() => handleDelete(doc)}
                        sx={{ bgcolor: 'white', color: '#EF4444', '&:hover': { bgcolor: alpha('#EF4444', 0.08) } }}>
                        {isDel ? <CircularProgress size={14} /> : <DeleteIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default StudentDocumentsPage;
