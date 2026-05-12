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
} from '@mui/material';
import FollowUpIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LockIcon from '@mui/icons-material/Lock';
import axios from 'axios';
import AdvancedDataTable from '../components/AdvancedDataTable';
import StudentFollowupModal from '../components/modals/StudentFollowupModal';
import StudentDocumentsModal from '../components/modals/StudentDocumentsModal';

import { alpha, useTheme } from '@mui/material/styles';
import { HeroBox, GlassCard } from '../components/styled';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// HeroBox and GlassCard are now imported from ../components/styled

function Students() {
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
        const all = response.data?.students || [];
        setStudents(all.filter((s) => s.currentStage === 'Student Registration'));
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

  const handleDocuments = (student) => {
    setSelectedStudent(student);
    setDocumentsModalOpen(true);
  };

  const handleDocumentsClose = () => {
    setDocumentsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleMenuOpen = (event, student) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuStudent(student);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuStudent(null);
  };

  const handleFreezeStudent = async () => {
    if (!menuStudent) return;

    try {
      await axios.post(
        `${API_URL}/api/students/${menuStudent._id}/freeze`,
        {
          reason: 'Frozen by user',
          notes: 'Student temporarily removed from active pipeline',
        },
        { withCredentials: true }
      );
      handleMenuClose();
      fetchStudents();
    } catch (err) {
      console.error('Failed to freeze student:', err);
      alert('Failed to freeze student');
    }
  };

  const handleLockStudent = async () => {
    if (!menuStudent) return;

    try {
      await axios.post(
        `${API_URL}/api/students/${menuStudent._id}/lock`,
        {
          reason: 'Locked by admin',
          notes: 'Restricted access',
        },
        { withCredentials: true }
      );
      handleMenuClose();
      fetchStudents();
    } catch (err) {
      console.error('Failed to lock student:', err);
      alert(err.response?.data?.message || 'Failed to lock student');
    }
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
      'Application Officer': student.assigned?.applicationOfficer?.name || 'Not Assigned',
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
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
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
      field: 'currentPhase',
      headerName: 'Phase',
      render: (value) => (
        <Chip 
          label={value} 
          size="small" 
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.1), 
            color: 'primary.main', 
            fontWeight: 900, 
            borderRadius: '8px',
            fontSize: '0.65rem'
          }} 
        />
      ),
    },
    {
      field: 'currentStage',
      headerName: 'Stage',
      render: (value) => (
        <Chip 
          label={value} 
          size="small" 
          sx={{ 
            bgcolor: alpha(theme.palette.secondary.main, 0.1), 
            color: 'secondary.main', 
            fontWeight: 900, 
            borderRadius: '8px',
            fontSize: '0.65rem'
          }} 
        />
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
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: 'success.main',
            fontWeight: 900,
            borderRadius: '8px',
            fontSize: '0.65rem'
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
      field: 'assigned.applicationOfficer.name',
      headerName: 'Application Officer',
      render: (value, row) => (
        <Typography variant="body2">
          {row.assigned?.applicationOfficer?.name || (
            <Box component="span" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
              Not Assigned
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
            variant="outlined"
            size="small"
            startIcon={<FollowUpIcon />}
            onClick={() => handleFollowup(row)}
            sx={{ textTransform: 'none' }}
          >
            Followup
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
    'currentPhase',
    'currentStage',
    'currentStatus',
    'assigned.counselor.name',
    'assigned.applicationOfficer.name',
  ];

  // Sort options
  const sortOptions = [
    { label: 'Sort By Student ID', value: 'studentId' },
    { label: 'Sort By Name', value: 'name' },
    { label: 'Sort By Phase', value: 'currentPhase' },
    { label: 'Sort By Stage', value: 'currentStage' },
    { label: 'Sort By Status', value: 'currentStatus' },
    { label: 'Sort By Created Date', value: 'createdAt' },
  ];
  return (
    <Box sx={{ p: 3 }}>
      <HeroBox>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: -1.5, color: 'text.primary', mb: 0.5 }}>
              Students
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.7 }}>
              {students.length} student{students.length !== 1 ? 's' : ''} in registration
            </Typography>
          </Box>
        </Box>
      </HeroBox>

      <GlassCard>

        <AdvancedDataTable
          columns={columns}
          data={students}
          loading={loading}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          onExportCSV={handleExportCSV}
        />
      </GlassCard>


      <StudentFollowupModal
        open={followupModalOpen}
        onClose={handleFollowupClose}
        student={selectedStudent}
      />

      <StudentDocumentsModal
        open={documentsModalOpen}
        onClose={handleDocumentsClose}
        student={selectedStudent}
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleFreezeStudent}>
          <ListItemIcon>
            <AcUnitIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Freeze Student</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLockStudent}>
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Lock Student</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default Students;
