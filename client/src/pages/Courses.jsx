import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { alpha, useTheme } from '@mui/material';
import axios from 'axios';
import AdvancedDataTable from '../components/AdvancedDataTable';
import { styled } from '@mui/material/styles';

const HeroBox = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.5)
    : alpha(theme.palette.background.paper, 0.3),
  borderRadius: '40px',
  padding: theme.spacing(6, 6),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  backdropFilter: "blur(24px) saturate(180%)",
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-30%',
    right: '-10%',
    width: '400px',
    height: '400px',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
    filter: 'blur(60px)',
    zIndex: 0,
  }
}));

const GlassCard = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.4) 
    : alpha('#FFFFFF', 0.8),
  backdropFilter: "blur(24px) saturate(180%)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: "32px",
  overflow: 'hidden',
}));

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function Courses() {
  const theme = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadResults, setUploadResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/courses`, {
        withCredentials: true,
      });

      if (response.data.status === 'success') {
        setCourses(response.data?.courses || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!validTypes.includes(file.type)) {
        setError('Please select a valid Excel file (.xls or .xlsx)');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(
        `${API_URL}/api/courses/upload`,
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
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data.status === 'success') {
        setSuccess(response.data.message);
        setUploadResults(response.data.results);
        fetchCourses();
        setSelectedFile(null);

        // Close modal after 3 seconds if no errors
        if (response.data.results.failed === 0) {
          setTimeout(() => {
            setUploadModalOpen(false);
            setUploadResults(null);
          }, 3000);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL courses? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/api/courses/all`, {
        withCredentials: true,
      });

      if (response.data.status === 'success') {
        setSuccess(response.data.message);
        fetchCourses();

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.response?.data?.message || 'Failed to delete courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/api/courses/${courseId}`, {
        withCredentials: true,
      });

      if (response.data.status === 'success') {
        setSuccess('Course deleted successfully');
        fetchCourses();

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleExportCSV = (data) => {
    if (!data || data.length === 0) return;

    const csvData = data.map((course) => ({
      'Course Name': course.name,
      'University': course.university?.name || '',
      'Country': course.university?.country?.name || '',
      'City': course.university?.city || '',
      'Level': course.level,
      'Intake Months': course.intakes?.join(', ') || '',
    }));

    const keys = Object.keys(csvData[0]);
    const csvRows = [
      keys.join(','),
      ...csvData.map((row) =>
        keys.map((field) => `"${row[field] || ''}"`).join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `courses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Column definitions
  const columns = [
    {
      field: 'name',
      headerName: 'Course Name',
      render: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'university.name',
      headerName: 'University',
      render: (value, row) => (
        <Typography variant="body2">
          {row.university?.name || '-'}
        </Typography>
      ),
    },
    {
      field: 'university.country',
      headerName: 'Country',
      render: (value, row) => (
        <Chip
          label={row.university?.country?.name || '-'}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'university.city',
      headerName: 'City',
      render: (value, row) => (
        <Typography variant="body2" color="text.secondary">
          {row.university?.city || '-'}
        </Typography>
      ),
    },
    {
      field: 'level',
      headerName: 'Level',
      render: (value) => (
        <Chip label={value} size="small" color="secondary" variant="outlined" />
      ),
    },
    {
      field: 'intakes',
      headerName: 'Intake Months',
      render: (value) => (
        <Typography variant="body2">
          {value && value.length > 0 ? value.join(', ') : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (value, row) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDeleteCourse(row._id)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    'name',
    'university.name',
    'university.country.name',
    'university.city',
    'level',
  ];

  // Sort options
  const sortOptions = [
    { label: 'Sort By Name', value: 'name' },
    { label: 'Sort By University', value: 'university.name' },
    { label: 'Sort By Country', value: 'university.country.name' },
    { label: 'Sort By Level', value: 'level' },
  ];

  return (
    <>
      <HeroBox>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: -1.5, color: 'text.primary', mb: 0.5 }}>
              Courses
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.7 }}>
              Operational management of {courses.length} verified academic programs
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteAll}
              sx={{ 
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '14px',
                borderWidth: 2,
                '&:hover': { borderWidth: 2 }
              }}
            >
              Delete All
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => setUploadModalOpen(true)}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                textTransform: 'none',
                fontWeight: 900,
                px: 4,
                py: 1.5,
                borderRadius: '16px',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: 'all 0.3s ease'
              }}
            >
              Upload Excel
            </Button>
          </Box>
        </Box>
      </HeroBox>

      <GlassCard>
        <AdvancedDataTable
          columns={columns}
          data={courses}
          loading={loading}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
        />
      </GlassCard>

      {/* Upload Modal */}
      <Dialog
        open={uploadModalOpen}
        onClose={() => !uploading && setUploadModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Upload Courses from Excel</Typography>
            <IconButton
              onClick={() => {
                setUploadModalOpen(false);
                setSelectedFile(null);
                setUploadResults(null);
                setError('');
              }}
              disabled={uploading}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Upload an Excel file (.xls or .xlsx) with columns: University, Program Name, Campus, Country, Intake Month. All sheets in the workbook will be processed. (Year column will be ignored if present)
          </Alert>

          {uploadResults && (
            <Alert
              severity={uploadResults.failed > 0 ? 'warning' : 'success'}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Upload Results:
              </Typography>
              {uploadResults.sheetsProcessed !== undefined && (
                <Typography variant="body2">
                  📊 Sheets Processed: {uploadResults.sheetsProcessed} of {uploadResults.totalSheets}
                </Typography>
              )}
              <Typography variant="body2">
                ✓ Successful: {uploadResults.success} courses
              </Typography>
              {uploadResults.failed > 0 && (
                <>
                  <Typography variant="body2">
                    ✗ Failed: {uploadResults.failed} courses
                  </Typography>
                  {uploadResults.errors && uploadResults.errors.length > 0 && (
                    <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                      {uploadResults.errors.slice(0, 5).map((err, idx) => (
                        <Typography key={idx} variant="caption" display="block" color="error">
                          {err.sheet ? `Sheet "${err.sheet}", ` : ''}Row {err.row}: {err.error}
                        </Typography>
                      ))}
                      {uploadResults.errors.length > 5 && (
                        <Typography variant="caption" color="error">
                          ...and {uploadResults.errors.length - 5} more errors
                        </Typography>
                      )}
                    </Box>
                  )}
                </>
              )}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<AddIcon />}
              disabled={uploading}
            >
              {selectedFile ? selectedFile.name : 'Select Excel File'}
              <input
                type="file"
                hidden
                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileSelect}
              />
            </Button>
          </Box>

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Button
              variant="text"
              size="small"
              startIcon={<DownloadIcon />}
              href="/courses.xlsx"
              download
              sx={{ textTransform: 'none' }}
            >
              Download Sample Template
            </Button>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setUploadModalOpen(false);
              setSelectedFile(null);
              setUploadResults(null);
              setError('');
            }}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Courses;
