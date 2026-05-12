import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  School,
  TrendingUp,
  CheckCircle,
  PeopleAlt,
  ExitToApp,
  AccountCircle,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function PartnerDashboard() {
  const [partner, setPartner] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get partner from localStorage
    const partnerData = localStorage.getItem('partner');
    if (!partnerData) {
      navigate('/partner/login');
      return;
    }
    setPartner(JSON.parse(partnerData));
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/partner-portal/dashboard`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/partner-portal/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('partner');
      navigate('/partner/login');
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Stedinow Partner Portal
          </Typography>
          <Button color="inherit" sx={{ mr: 2 }}>
            Students
          </Button>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.3)' }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <AccountCircle sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        {/* Welcome Section */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome back, {partner?.companyName}!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Partner ID: {partner?.partnerId} | Contact: {partner?.contactPersonName}
          </Typography>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <School sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {dashboardData?.metrics?.totalStudents || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Students
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleAlt sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {dashboardData?.metrics?.activeStudents || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Students
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {dashboardData?.metrics?.convertedStudents || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Converted
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {dashboardData?.metrics?.conversionRate || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Conversion Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Students */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Students
          </Typography>
          {dashboardData?.recentStudents && dashboardData.recentStudents.length > 0 ? (
            <Box>
              {dashboardData.recentStudents.map((student) => (
                <Box
                  key={student._id}
                  sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" fontWeight={600}>
                        {student.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.studentId} | {student.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                        <Typography variant="caption" sx={{ bgcolor: 'primary.light', px: 1, py: 0.5, borderRadius: 1 }}>
                          {student.currentStage}
                        </Typography>
                        <Typography variant="caption" sx={{ bgcolor: 'info.light', px: 1, py: 0.5, borderRadius: 1 }}>
                          {student.currentStatus}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No students registered yet. Start adding students to see them here.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default PartnerDashboard;
