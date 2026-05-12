import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Link,
  alpha,
  useTheme,
} from '@mui/material';
import { HeroBox, GlassCard } from '../components/styled';
import FollowUpIcon from '@mui/icons-material/Assignment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import AdvancedDataTable from '../components/AdvancedDataTable';
import StudentFollowupModal from '../components/modals/StudentFollowupModal';
import StudentDocumentsModal from '../components/modals/StudentDocumentsModal';
import { styled } from '@mui/material/styles';

// HeroBox and GlassCard are now imported from ../components/styled

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function Documents() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuStudent, setMenuStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/students`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setStudents(response.data?.students || []);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowup = (student) => {
    setSelectedStudent(student);
    setFollowupModalOpen(true);
  };

  const handleFollowupClose = () => {
    setFollowupModalOpen(false);
    setSelectedStudent(null);
    fetchStudents();
  };

  const handleViewDocuments = (student) => {
    setSelectedStudent(student);
    setDocumentsModalOpen(true);
    handleMenuClose();
  };

  const handleDocumentsModalClose = () => {
    setDocumentsModalOpen(false);
    setSelectedStudent(null);
    fetchStudents();
  };

  const handleMenuOpen = (event, student) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuStudent(student);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuStudent(null);
  };

  const handleViewProfile = () => {
    if (menuStudent) {
      navigate(`/students/${menuStudent._id}`);
    }
    handleMenuClose();
  };

  const handleExportCSV = (data) => {
    if (!data || data.length === 0) return;

    const csvData = data.map((student) => ({
      'Student ID': student.studentId,
      'Name': student.name,
      'Email': student.email,
      'Phone': `${student.phoneCode} ${student.phone}`,
      'Phase': student.currentPhase,
      'Stage': student.currentStage,
      'Status': student.currentStatus,
      'Counselor': student.assigned?.counselor?.name || 'Unassigned',
    }));

    const keys = Object.keys(csvData[0]);
    const csvRows = [
      keys.join(','),
      ...csvData.map((row) =>
        keys.map((field) => `"${row[field]}"`).join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `students_documents_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Column definitions
  const columns = [
    {
      field: 'studentId',
      headerName: 'Student ID',
      render: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      render: (value, row) => (
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate(`/students/${row._id}`)}
          sx={{
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {value}
        </Link>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      render: (value, row) => (
        <Typography variant="body2" color="text.secondary">
          {row.phoneCode} {value}
        </Typography>
      ),
    },
    {
      field: 'currentStage',
      headerName: 'Stage',
      render: (value) => (
        <Chip label={value} size="small" color="secondary" variant="outlined" />
      ),
    },
    {
      field: 'currentStatus',
      headerName: 'Status',
      render: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: 'success.light',
            color: 'success.dark',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: 'assigned.counselor.name',
      headerName: 'Counselor',
      render: (value, row) => (
        <Typography variant="body2">
          {row.assigned?.counselor?.name || (
            <Box component="span" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
              Unassigned
            </Box>
          )}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<FolderOpenIcon />}
            onClick={() => handleViewDocuments(row)}
            sx={{ textTransform: 'none' }}
          >
            Documents
          </Button>
          <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    'studentId',
    'name',
    'email',
    'phone',
    'currentStage',
    'currentStatus',
    'assigned.counselor.name',
  ];

  // Sort options
  const sortOptions = [
    { label: 'Sort By Student ID', value: 'studentId' },
    { label: 'Sort By Name', value: 'name' },
    { label: 'Sort By Stage', value: 'currentStage' },
    { label: 'Sort By Status', value: 'currentStatus' },
    { label: 'Sort By Created Date', value: 'createdAt' },
  ];

  return (
    <>
      <HeroBox>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: -1.5, color: 'text.primary', mb: 0.5 }}>
              Documents
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.7 }}>
              Secure management of {students.length} student document repositories
            </Typography>
          </Box>
          <Chip
            label={`${students.length} ENTITIES`}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1), 
              color: 'primary.main', 
              fontWeight: 900, 
              borderRadius: '10px',
              px: 2,
              py: 1
            }}
          />
        </Box>
      </HeroBox>

      <GlassCard>
        <AdvancedDataTable
          columns={columns}
          data={students}
          loading={loading}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
        />
      </GlassCard>

      <StudentFollowupModal
        open={followupModalOpen}
        onClose={handleFollowupClose}
        student={selectedStudent}
      />

      <StudentDocumentsModal
        open={documentsModalOpen}
        onClose={handleDocumentsModalClose}
        student={selectedStudent}
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleViewDocuments(menuStudent)}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Documents</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleFollowup(menuStudent)}>
          <ListItemIcon>
            <FollowUpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Schedule Followup</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default Documents;
