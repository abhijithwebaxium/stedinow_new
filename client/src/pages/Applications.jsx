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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewKanbanIcon from '@mui/icons-material/ViewQuilt';
import { useTheme, alpha } from '@mui/material/styles';
import { HeroBox, GlassCard } from '../components/styled';
import axios from 'axios';
import AdvancedDataTable from '../components/AdvancedDataTable';
import KanbanBoard from '../components/KanbanBoard';
import StudentFollowupModal from '../components/modals/StudentFollowupModal';
import StudentApplicationsModal from '../components/modals/StudentApplicationsModal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { styled } from '@mui/material/styles';

// HeroBox and GlassCard are now imported from ../components/styled

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Stages that should appear in Applications (2.2 and 2.3 only)
const APPLICATION_STAGES = [
  'Application Submission',      // 2.2
  'Offer Management',            // 2.3
];

function Applications() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [applicationsModalOpen, setApplicationsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuStudent, setMenuStudent] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/students`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        // Filter students to only show those in Application Submission stage (2.2) and above
        const allStudents = response.data.students || [];
        const applicationStudents = allStudents.filter(student =>
          student && student.currentStage && APPLICATION_STAGES.includes(student.currentStage)
        );
        setStudents(applicationStudents);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
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
    fetchApplications();
  };

  const handleMenuOpen = (event, student) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuStudent(student);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuStudent(null);
  };

  const handleManageApplications = () => {
    if (menuStudent) {
      setSelectedStudent(menuStudent);
      setApplicationsModalOpen(true);
    }
    handleMenuClose();
  };

  const handleApplicationsModalClose = () => {
    setApplicationsModalOpen(false);
    setSelectedStudent(null);
    fetchApplications(); // Refresh the list after modal closes
  };

  const handleStageChange = async (studentId, newStage) => {
    try {
      setLoading(true);
      await axios.patch(`${API_URL}/api/students/${studentId}/status`, {
        currentStage: newStage,
      }, { withCredentials: true });
      fetchApplications();
    } catch (err) {
      console.error('Failed to update stage:', err);
      alert('Failed to update application stage');
      fetchApplications();
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
      'Application Officer': student.assigned?.applicationOfficer?.name || 'Unassigned',
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
    link.setAttribute('download', `applications_${new Date().toISOString().split('T')[0]}.csv`);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
          <Typography variant="body2" fontWeight={600}>
            {row.assigned?.applicationOfficer?.name || (
              <Box component="span" sx={{ color: 'error.main', fontStyle: 'italic' }}>
                Not Assigned
              </Box>
            )}
          </Typography>
        </Box>
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
    'currentStage',
    'currentStatus',
    'assigned.counselor.name',
    'assigned.applicationOfficer.name',
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
    <Box sx={{ p: 3 }}>
      <HeroBox>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: -1.5, color: 'text.primary', mb: 0.5 }}>
              Applications
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.7 }}>
              Advanced tracking for {students.length} entities in secondary processing stages
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              bgcolor: alpha(theme.palette.divider, 0.05), 
              borderRadius: '16px', 
              p: 0.7, 
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}` 
            }}>
              <IconButton 
                size="small" 
                onClick={() => setViewMode('list')}
                sx={{ 
                  borderRadius: '12px', 
                  bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: viewMode === 'list' ? 'primary.main' : alpha(theme.palette.divider, 0.1),
                  }
                }}
              >
                <ViewListIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => setViewMode('kanban')}
                sx={{ 
                  borderRadius: '12px', 
                  bgcolor: viewMode === 'kanban' ? 'primary.main' : 'transparent',
                  color: viewMode === 'kanban' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: viewMode === 'kanban' ? 'primary.main' : alpha(theme.palette.divider, 0.1),
                  }
                }}
              >
                <ViewKanbanIcon fontSize="small" />
              </IconButton>
            </Box>
            <Chip
              label={`${students.length} ACTIVE`}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                color: 'primary.main', 
                fontWeight: 900, 
                borderRadius: '10px',
                px: 1
              }}
            />
          </Box>
        </Box>
      </HeroBox>

      <GlassCard>

        {viewMode === 'list' ? (
          <AdvancedDataTable
            columns={columns}
            data={students}
            loading={loading}
            filterOptions={filterOptions}
            sortOptions={sortOptions}
          />
        ) : (
          <Box sx={{ p: 3 }}>
            <KanbanBoard 
              students={students} 
              onStageChange={handleStageChange} 
            />
          </Box>
        )}
      </GlassCard>

      <StudentFollowupModal
        open={followupModalOpen}
        onClose={handleFollowupClose}
        student={selectedStudent}
      />

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleManageApplications}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Applications</ListItemText>
        </MenuItem>
      </Menu>

      <StudentApplicationsModal
        open={applicationsModalOpen}
        onClose={handleApplicationsModalClose}
        student={selectedStudent}
      />
    </Box>
  );
}

export default Applications;
