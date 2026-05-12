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
import axios from 'axios';
import AdvancedDataTable from '../components/AdvancedDataTable';
import AddUserModal from '../components/modals/AddUserModal';
import EditUserModal from '../components/modals/EditUserModal';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
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

function Users() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/users`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setUsers(response.data?.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setAddModalOpen(false);
    fetchUsers();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleUpdateUser = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setPasswordModalOpen(true);
  };

  const handlePasswordChanged = () => {
    setPasswordModalOpen(false);
    setSelectedUser(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'default';
      case 'Suspended':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleExportCSV = (data) => {
    if (!data || data.length === 0) return;

    const csvData = data.map((user) => ({
      'Name': user.name,
      'Email': user.email,
      'Phone': `${user.phoneCode} ${user.phone}`,
      'Role': user.role?.name || 'N/A',
      'Designation': user.designation || '-',
      'Status': user.status,
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
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Column definitions
  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      render: (value) => (
        <Typography variant="body2" fontWeight={600}>
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
      field: 'role.name',
      headerName: 'Role',
      render: (value, row) => (
        <Chip
          label={row.role?.name || 'N/A'}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'designation',
      headerName: 'Designation',
      render: (value) => (
        <Typography variant="body2">{value || '-'}</Typography>
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
            color="primary"
            onClick={() => handleEditUser(row)}
            title="Edit User"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => handleChangePassword(row)}
            title="Change Password"
          >
            <LockResetIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    'name',
    'email',
    'phone',
    'role.name',
    'designation',
    'status',
  ];

  // Sort options
  const sortOptions = [
    { label: 'Sort By Name', value: 'name' },
    { label: 'Sort By Email', value: 'email' },
    { label: 'Sort By Role', value: 'role.name' },
    { label: 'Sort By Status', value: 'status' },
    { label: 'Sort By Created Date', value: 'createdAt' },
  ];

  return (
    <>
      <HeroBox>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: -1.5, color: 'text.primary', mb: 0.5 }}>
              Users
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.7 }}>
              Operational management of {users.length} authorized personnel
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
            Add New User
          </Button>
        </Box>
      </HeroBox>

      <GlassCard>
        <AdvancedDataTable
          columns={columns}
          data={users}
          loading={loading}
          filterOptions={filterOptions}
          sortOptions={sortOptions}
        />
      </GlassCard>

      <AddUserModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onUserAdded={handleAddUser}
      />

      <EditUserModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUpdateUser}
        user={selectedUser}
      />

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setSelectedUser(null);
        }}
        onPasswordChanged={handlePasswordChanged}
        user={selectedUser}
      />
    </>
  );
}

export default Users;
