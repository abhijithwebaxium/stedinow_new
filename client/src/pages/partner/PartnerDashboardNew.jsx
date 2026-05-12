import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
} from '@mui/material';
import {
  School,
  TrendingUp,
  CheckCircle,
  PeopleAlt,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Stat Card Component
function StatCard({ title, count, icon: Icon, bgColor, textColor, data, expandColor }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent sx={{ bgcolor: bgColor, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: textColor }}>
            {title}
          </Typography>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: textColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
        </Box>

        <Typography variant="h3" fontWeight={700} sx={{ color: '#2c0b47', mb: 2 }}>
          {count}
        </Typography>

        <Collapse in={expanded}>
          <Box sx={{ bgcolor: expandColor, borderRadius: 1.5, p: 1.5, mb: 2 }}>
            <List dense disablePadding>
              {data && Object.entries(data).map(([key, value]) => (
                <ListItem
                  key={key}
                  disablePadding
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 0.5,
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <ListItemText
                    primary={key}
                    primaryTypographyProps={{ variant: 'body2', color: '#4B4B4B' }}
                  />
                  <Typography variant="body2" fontWeight={700}>
                    {value}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>

        <Button
          fullWidth
          variant="contained"
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          sx={{
            bgcolor: '#3A0CA2',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#2d0980',
            },
          }}
        >
          {expanded ? 'Close' : 'Click to Expand'}
        </Button>
      </CardContent>
    </Card>
  );
}

function PartnerDashboardNew() {
  const [partner, setPartner] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
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
        localStorage.removeItem('partner');
        navigate('/partner/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Prepare card data
  const cardData = [
    {
      title: 'Total Students',
      count: dashboardData?.metrics?.totalStudents || 0,
      icon: School,
      bgColor: '#FFE2E5',
      textColor: '#FA5A7D',
      expandColor: '#fff2f3',
      data: dashboardData?.stageStats || {},
    },
    {
      title: 'Active Students',
      count: dashboardData?.metrics?.activeStudents || 0,
      icon: PeopleAlt,
      bgColor: '#E3FFEC',
      textColor: '#05AC21',
      expandColor: '#f5fff8',
      data: dashboardData?.statusStats || {},
    },
    {
      title: 'Converted',
      count: dashboardData?.metrics?.convertedStudents || 0,
      icon: CheckCircle,
      bgColor: '#D8E3FF',
      textColor: '#0C51FF',
      expandColor: '#f1f4fd',
      data: {},
    },
    {
      title: 'Conversion Rate',
      count: `${dashboardData?.metrics?.conversionRate || 0}%`,
      icon: TrendingUp,
      bgColor: '#fbd8ff',
      textColor: '#ff0ccb',
      expandColor: '#fdf1fd',
      data: {},
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {partner?.companyName}!
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Partner ID: {partner?.partnerId} | Contact: {partner?.contactPersonName}
        </Typography>
      </Paper>

      {/* Overview Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Overview
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {cardData.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard {...card} />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Recent Students Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Recent Students ({dashboardData?.recentStudents?.length || 0})
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/partner/students')}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>

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
                  '&:hover': { bgcolor: 'action.hover' },
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/partner/students/${student._id}`)}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" fontWeight={600}>
                      {student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.studentId} | {student.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                      <Chip
                        label={student.currentStage}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={student.currentStatus}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <School sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No students registered yet.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2, textTransform: 'none' }}
              onClick={() => navigate('/partner/add-student')}
            >
              Add Your First Student
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default PartnerDashboardNew;
