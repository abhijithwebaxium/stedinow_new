import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import AdvancedDataTable from '../components/AdvancedDataTable';
import AddPartnerModal from '../components/modals/AddPartnerModal';
import EditPartnerModal from '../components/modals/EditPartnerModal';
import PartnerDetailsModal from '../components/modals/PartnerDetailsModal';
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

function Partners() {
  const theme = useTheme();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/partners`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setPartners(response.data?.data?.partners || []);
      }
    } catch (err) {
      console.error('Failed to fetch partners:', err);
      alert('Failed to fetch partners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPartner = () => {
    setAddModalOpen(false);
    fetchPartners();
  };

  const handleEditPartner = (partner) => {
    setSelectedPartner(partner);
    setEditModalOpen(true);
  };

  const handleUpdatePartner = () => {
    setEditModalOpen(false);
    setSelectedPartner(null);
    fetchPartners();
  };

  const handleViewDetails = (partner) => {
    setSelectedPartner(partner);
    setDetailsModalOpen(true);
  };

  const handleResetPassword = async (partner) => {
    if (!confirm(`Reset password for ${partner.companyName}?`)) return;

    try {
      const response = await axios.patch(
        `${API_URL}/api/partners/${partner._id}/reset-password`,
        {},
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        alert('Password reset successfully. New password has been sent to the partner.');
      }
    } catch (err) {
      console.error('Failed to reset password:', err);
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleChangeStatus = async (partner, newStatus) => {
    if (!confirm(`Change status to ${newStatus} for ${partner.companyName}?`)) return;

    try {
      const response = await axios.patch(
        `${API_URL}/api/partners/${partner._id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        alert('Partner status updated successfully');
        fetchPartners();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'default';
      case 'Suspended':
        return 'error';
      case 'Pending Verification':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return 'success';
      case 'Under Review':
        return 'info';
      case 'Documents Submitted':
        return 'warning';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleExportCSV = (data) => {
    if (!data || data.length === 0) return;

    const csvData = data.map((partner) => ({
      'Partner ID': partner.partnerId,
      'Company Name': partner.companyName,
      'Contact Person': partner.contactPersonName,
      'Email': partner.email,
      'Phone': `${partner.phoneCode} ${partner.phone}`,
      'Business Type': partner.businessType,
      'Total Students': partner.totalStudents,
      'Active Students': partner.activeStudents,
      'Commission Rate': `${partner.commissionRate}%`,
      'Status': partner.status,
      'Verification': partner.verificationStatus,
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
    link.setAttribute('download', `partners_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Column definitions
  const columns = [
    {
      field: 'partnerId',
      headerName: 'ID',
      render: (value) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {value}
        </Typography>
      ),
    },
    {
      field: 'companyName',
      headerName: 'Company Name',
      render: (value) => (
        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'contactPersonName',
      headerName: 'Contact Person',
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
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
      field: 'businessType',
      headerName: 'Business Type',
      render: (value) => (
        <Chip
          label={value}
          size="small"
          variant="outlined"
          color="info"
        />
      ),
    },
    {
      field: 'totalStudents',
      headerName: 'Students',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({row.activeStudents} active)
          </Typography>
        </Box>
      ),
    },
    {
      field: 'commissionRate',
      headerName: 'Commission',
      render: (value, row) => (
        <Typography variant="body2">
          {value}% ({row.commissionType})
        </Typography>
      ),
    },
    {
      field: 'verificationStatus',
      headerName: 'Verification',
      render: (value) => (
        <Chip
          label={value}
          size="small"
          color={getVerificationStatusColor(value)}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      render: (value) => (
        <Chip label={value} size="small" color={getStatusColor(value)} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="info"
            onClick={() => handleViewDetails(row)}
            title="View Details"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEditPartner(row)}
            title="Edit Partner"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => handleResetPassword(row)}
            title="Reset Password"
          >
            <LockResetIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    'partnerId',
    'companyName',
    'contactPersonName',
    'email',
    'phone',
    'businessType',
    'status',
    'verificationStatus',
  ];

  // Sort options
  const sortOptions = [
    { label: 'Sort By Company Name', value: 'companyName' },
    { label: 'Sort By Partner ID', value: 'partnerId' },
    { label: 'Sort By Total Students', value: 'totalStudents' },
    { label: 'Sort By Commission Rate', value: 'commissionRate' },
    { label: 'Sort By Status', value: 'status' },
    { label: 'Sort By Created Date', value: 'createdAt' },
  ];

  return (
    <>
      <HeroBox>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: -1.5, color: 'text.primary', mb: 0.5 }}>
              Partners
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.7 }}>
              Manage {partners.length} partner organizations and their access
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
              transition: 'all 0.3s ease'
            }}
          >
            Add New Partner
          </Button>
        </Box>
      </HeroBox>

      <GlassCard>
        <AdvancedDataTable
          columns={columns}
          data={partners}
          loading={loading}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
        />
      </GlassCard>

      <AddPartnerModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onPartnerAdded={handleAddPartner}
      />

      <EditPartnerModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedPartner(null);
        }}
        onPartnerUpdated={handleUpdatePartner}
        partner={selectedPartner}
      />

      <PartnerDetailsModal
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedPartner(null);
        }}
        partner={selectedPartner}
        onStatusChange={handleChangeStatus}
        onRefresh={fetchPartners}
      />
    </>
  );
}

export default Partners;
