import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Link,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FollowUpIcon from '@mui/icons-material/Assignment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LockIcon from '@mui/icons-material/Lock';
import axios from 'axios';
import AdvancedDataTable from '../components/AdvancedDataTable';
import AddStudentModal from '../components/modals/AddStudentModal';
import StudentFollowupModal from '../components/modals/StudentFollowupModal';
import StudentDocumentsModal from '../components/modals/StudentDocumentsModal';
import { alpha, useTheme, styled } from '@mui/material/styles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

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
  backdropFilter: 'blur(24px) saturate(180%)',
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
  },
}));

const GlassCard = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.4)
    : alpha('#FFFFFF', 0.8),
  backdropFilter: 'blur(24px) saturate(180%)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: '32px',
  overflow: 'hidden',
}));

function Leads() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuLead, setMenuLead] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/students`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        const all = response.data?.students || [];
        setLeads(all.filter((s) => s.currentPhase === 'Lead Acquisition'));
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = (newStudent) => {
    setAddModalOpen(false);
    if (newStudent && newStudent.currentPhase === 'Lead Acquisition') {
      setLeads((prev) => [newStudent, ...prev]);
    }
    fetchLeads();
  };

  const handleFollowup = (lead) => {
    setSelectedLead(lead);
    setFollowupModalOpen(true);
  };

  const handleFollowupClose = () => {
    setFollowupModalOpen(false);
    setSelectedLead(null);
    fetchLeads();
  };

  const handleDocumentsClose = () => {
    setDocumentsModalOpen(false);
    setSelectedLead(null);
    fetchLeads();
  };

  const handleMenuOpen = (event, lead) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuLead(lead);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuLead(null);
  };

  const handleFreezeStudent = async () => {
    if (!menuLead) return;
    try {
      await axios.post(
        `${API_URL}/api/students/${menuLead._id}/freeze`,
        { reason: 'Frozen by user', notes: 'Lead temporarily removed from active pipeline' },
        { withCredentials: true }
      );
      handleMenuClose();
      fetchLeads();
    } catch (err) {
      console.error('Failed to freeze lead:', err);
      alert('Failed to freeze lead');
    }
  };

  const handleLockStudent = async () => {
    if (!menuLead) return;
    try {
      await axios.post(
        `${API_URL}/api/students/${menuLead._id}/lock`,
        { reason: 'Locked by admin', notes: 'Restricted access' },
        { withCredentials: true }
      );
      handleMenuClose();
      fetchLeads();
    } catch (err) {
      console.error('Failed to lock lead:', err);
      alert(err.response?.data?.message || 'Failed to lock lead');
    }
  };

  const columns = [
    {
      field: 'studentId',
      headerName: 'Lead ID',
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
            '&:hover': { textDecoration: 'underline' },
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
            fontSize: '0.65rem',
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
            fontSize: '0.65rem',
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
      field: 'leadSource.source',
      headerName: 'Lead Source',
      render: (value, row) => (
        <Typography variant="body2" color="text.secondary">
          {row.leadSource?.source || '—'}
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

  const filterOptions = [
    { label: 'Name', value: 'name' },
    { label: 'Email', value: 'email' },
    { label: 'Stage', value: 'currentStage' },
    { label: 'Status', value: 'currentStatus' },
    { label: 'Lead Source', value: 'leadSource.source' },
  ];

  const sortOptions = [
    { label: 'Sort By Lead ID', value: 'studentId' },
    { label: 'Sort By Name', value: 'name' },
    { label: 'Sort By Stage', value: 'currentStage' },
    { label: 'Sort By Status', value: 'currentStatus' },
  ];

  const handleExportCSV = (data) => {
    if (!data || data.length === 0) return;
    const csvData = data.map((lead) => ({
      'Lead ID': lead.studentId,
      'Name': lead.name,
      'Email': lead.email,
      'Phone': `${lead.phoneCode} ${lead.phone}`,
      'Stage': lead.currentStage,
      'Status': lead.currentStatus,
      'Lead Source': lead.leadSource?.source || '',
    }));
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        headers.map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <HeroBox>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: -1.5, color: 'text.primary', mb: 0.5 }}>
              Leads
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.7 }}>
              {leads.length} active lead{leads.length !== 1 ? 's' : ''} in acquisition phase
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddModalOpen(true)}
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
              transition: 'all 0.3s ease',
            }}
          >
            Deploy New Entity
          </Button>
        </Box>
      </HeroBox>

      <GlassCard>
        <AdvancedDataTable
          columns={columns}
          data={leads}
          loading={loading}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
          onExportCSV={handleExportCSV}
        />
      </GlassCard>

      <AddStudentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onStudentAdded={handleAddLead}
      />

      <StudentFollowupModal
        open={followupModalOpen}
        onClose={handleFollowupClose}
        student={selectedLead}
      />

      <StudentDocumentsModal
        open={documentsModalOpen}
        onClose={handleDocumentsClose}
        student={selectedLead}
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
          <ListItemText>Freeze Lead</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLockStudent}>
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Lock Lead</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default Leads;
