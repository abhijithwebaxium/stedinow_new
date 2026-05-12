import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  IconButton,
  LinearProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  FlightTakeoff as FlightIcon,
} from '@mui/icons-material';
import { alpha, styled } from '@mui/material/styles';
import { HeroBox } from '../components/styled';

// HeroBox is now imported from ../components/styled
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function Reports() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    reportType: 'eod',
    staffMember: '',
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    phase: '',
    status: '',
  });

  // Data
  const [users, setUsers] = useState([]);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`, { withCredentials: true });
      if (response.data.status === 'success') {
        setUsers(response.data?.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setReportData(null);
    setError('');

    // Set report type based on tab
    const reportTypes = ['eod', 'counselor', 'phase', 'conversion', 'application', 'visa'];
    setFilters({
      ...filters,
      reportType: reportTypes[newValue],
    });
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setReportData(null);

    try {
      const response = await axios.get(`${API_URL}/api/reports/${filters.reportType}`, {
        params: {
          staffMember: filters.staffMember,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          phase: filters.phase,
          status: filters.status,
        },
        withCredentials: true,
      });

      if (response.data.status === 'success') {
        setReportData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Generate CSV
    if (!reportData) return;

    let csvContent = '';
    const reportTitle = `${filters.reportType.toUpperCase()} Report - ${filters.dateFrom} to ${filters.dateTo}\n\n`;
    csvContent += reportTitle;

    if (filters.reportType === 'eod' && reportData.activities) {
      csvContent += 'Time,Activity,Student,Details\n';
      reportData.activities.forEach(activity => {
        csvContent += `${new Date(activity.timestamp).toLocaleString()},${activity.type},${activity.studentName || 'N/A'},${activity.details}\n`;
      });
    } else if (filters.reportType === 'counselor' && reportData.stats) {
      csvContent += 'Metric,Value\n';
      Object.entries(reportData.stats).forEach(([key, value]) => {
        csvContent += `${key},${value}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filters.reportType}_report_${filters.dateFrom}_${filters.dateTo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderEODReport = () => {
    if (!reportData) return null;

    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Activities
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.totalActivities || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Students Contacted
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.studentsContacted || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Followups Done
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.followupsDone || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Documents Processed
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.documentsProcessed || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Activities Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Activity Log
            </Typography>
            <TableContainer>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell><strong>Time</strong></TableCell>
                    <TableCell><strong>Activity Type</strong></TableCell>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell><strong>Details</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.activities && reportData.activities.length > 0 ? (
                    reportData.activities.map((activity, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{new Date(activity.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          <Chip label={activity.type} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>{activity.studentName || 'N/A'}</TableCell>
                        <TableCell>{activity.details}</TableCell>
                        <TableCell>
                          <Chip
                            label={activity.status}
                            size="small"
                            color={activity.status === 'Completed' ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No activities recorded for this period
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderCounselorReport = () => {
    if (!reportData) return null;

    return (
      <Box>
        {/* Performance Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.stats?.totalStudents || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUpIcon color="success" />
                  <Typography variant="body2" color="text.secondary">
                    Conversions
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.stats?.conversions || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ScheduleIcon color="info" />
                  <Typography variant="body2" color="text.secondary">
                    Avg Response Time
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.stats?.avgResponseTime || 0}h
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AssessmentIcon color="warning" />
                  <Typography variant="body2" color="text.secondary">
                    Conversion Rate
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.stats?.conversionRate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Performance Details */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Students by Phase
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {reportData.phaseBreakdown && Object.entries(reportData.phaseBreakdown).map(([phase, count]) => (
                  <Box key={phase} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{phase}</Typography>
                      <Typography variant="body2" fontWeight="bold">{count}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / (reportData.stats?.totalStudents || 1)) * 100}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activities
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {reportData.recentActivities && reportData.recentActivities.length > 0 ? (
                  reportData.recentActivities.map((activity, index) => (
                    <Box key={index} sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {activity.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.studentName} - {new Date(activity.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent activities
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderPhaseReport = () => {
    if (!reportData) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Students by Phase & Status
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell><strong>Phase</strong></TableCell>
                  <TableCell><strong>Stage</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Count</strong></TableCell>
                  <TableCell align="right"><strong>Percentage</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.phaseData && reportData.phaseData.length > 0 ? (
                  reportData.phaseData.map((item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{item.phase}</TableCell>
                      <TableCell>{item.stage}</TableCell>
                      <TableCell>
                        <Chip label={item.status} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                      <TableCell align="right">{item.percentage}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const renderConversionReport = () => {
    if (!reportData) return null;

    return (
      <Box>
        {/* Conversion Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Leads
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.totalLeads || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Converted
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.converted || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Conversion Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.conversionRate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Conversion Funnel */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Conversion Funnel
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {reportData.funnelData && reportData.funnelData.map((stage, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {stage.name}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {stage.count} ({stage.percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stage.percentage}
                  sx={{
                    height: 12,
                    borderRadius: 1,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: stage.color || 'primary.main',
                    }
                  }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderApplicationReport = () => {
    if (!reportData) return null;

    return (
      <Box>
        {/* Application Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Applications
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.totalApplications || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  In Progress
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.inProgress || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Enrolled
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.enrolled || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Success Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.successRate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Application Status Breakdown */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status Breakdown
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {reportData.statusBreakdown && Object.entries(reportData.statusBreakdown).map(([status, count]) => (
                  <Box key={status} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{status}</Typography>
                      <Typography variant="body2" fontWeight="bold">{count}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / (reportData.summary?.totalApplications || 1)) * 100}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Application Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">Submitted</Typography>
                  <Chip label={reportData.summary?.submitted || 0} color="primary" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">Offers Received</Typography>
                  <Chip label={reportData.summary?.offersReceived || 0} color="info" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">Accepted</Typography>
                  <Chip label={reportData.summary?.accepted || 0} color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">Dropped</Typography>
                  <Chip label={reportData.summary?.dropped || 0} color="error" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Applications List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Applications List
            </Typography>
            <TableContainer>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell><strong>Student ID</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Phone</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Counselor</strong></TableCell>
                    <TableCell><strong>Last Updated</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.applicationsList && reportData.applicationsList.length > 0 ? (
                    reportData.applicationsList.map((app, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{app.studentId}</TableCell>
                        <TableCell>{app.studentName}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>{app.phone}</TableCell>
                        <TableCell>
                          <Chip
                            label={app.currentStatus}
                            size="small"
                            color={
                              app.currentStatus === 'Enrollment Confirmed' ? 'success' :
                              app.currentStatus === 'Plan Drop' ? 'error' :
                              app.currentStatus === 'Offer Accepted' ? 'info' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>{app.assignedCounselor}</TableCell>
                        <TableCell>{new Date(app.lastUpdated).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No applications found for this period
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderVisaReport = () => {
    if (!reportData) return null;

    return (
      <Box>
        {/* Visa Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Visa Applications
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.totalVisaApplications || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Approved
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.approved || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Rejected
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.rejected || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Approval Rate
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {reportData.summary?.approvalRate || 0}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Visa Status Breakdown and Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Visa Status Breakdown
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {reportData.visaStatusBreakdown && Object.entries(reportData.visaStatusBreakdown).map(([status, count]) => (
                  <Box key={status} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{status}</Typography>
                      <Typography variant="body2" fontWeight="bold">{count}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(count / (reportData.summary?.totalVisaApplications || 1)) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: status === 'Visa Approved' ? theme.palette.success.main :
                                   status === 'Visa Application Rejected' ? theme.palette.error.main :
                                   theme.palette.primary.main,
                        }
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Visa Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">In Progress</Typography>
                  <Chip label={reportData.summary?.inProgress || 0} color="primary" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">Submitted</Typography>
                  <Chip label={reportData.summary?.submitted || 0} color="info" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">Resubmitted</Typography>
                  <Chip label={reportData.summary?.resubmitted || 0} color="warning" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">Rejection Rate</Typography>
                  <Chip label={`${reportData.summary?.rejectionRate || 0}%`} color="error" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Visa List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Visa Applications List
            </Typography>
            <TableContainer>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell><strong>Student ID</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Phone</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Counselor</strong></TableCell>
                    <TableCell><strong>Last Updated</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.visaList && reportData.visaList.length > 0 ? (
                    reportData.visaList.map((visa, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{visa.studentId}</TableCell>
                        <TableCell>{visa.studentName}</TableCell>
                        <TableCell>{visa.email}</TableCell>
                        <TableCell>{visa.phone}</TableCell>
                        <TableCell>
                          <Chip
                            label={visa.currentStatus}
                            size="small"
                            color={
                              visa.currentStatus === 'Visa Approved' ? 'success' :
                              visa.currentStatus === 'Visa Application Rejected' ? 'error' :
                              visa.currentStatus === 'Visa Application Submitted' ? 'info' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>{visa.assignedCounselor}</TableCell>
                        <TableCell>{new Date(visa.lastUpdated).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No visa applications found for this period
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 1 }}>
      <HeroBox>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: -1.5, color: 'text.primary', mb: 0.5 }}>
              Reports
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.7 }}>
              Advanced analytics and operational intelligence reporting
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ 
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '14px',
                borderWidth: 2,
                '&:hover': { borderWidth: 2 }
              }}
            >
              Print
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={!reportData}
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
              Export CSV
            </Button>
          </Box>
        </Box>
      </HeroBox>

      {/* Report Type Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="EOD Report" icon={<ScheduleIcon />} iconPosition="start" />
          <Tab label="Counselor Report" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Phase Report" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab label="Conversion Report" icon={<TrendingUpIcon />} iconPosition="start" />
          <Tab label="Application Report" icon={<AssignmentIcon />} iconPosition="start" />
          <Tab label="Visa Report" icon={<FlightIcon />} iconPosition="start" />
        </Tabs>

        {/* Filters */}
        <CardContent>
          <Grid container spacing={2}>
            {(activeTab === 0 || activeTab === 1 || activeTab === 4 || activeTab === 5) ? (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Staff Member"
                  name="staffMember"
                  value={filters.staffMember}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Staff</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} - {user.role?.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ) : null}

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={generateReport}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: '12px',
                  }}
                >
                  Generate Report
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Report Content */}
      {reportData && (
        <Box className="print-content">
          {activeTab === 0 && renderEODReport()}
          {activeTab === 1 && renderCounselorReport()}
          {activeTab === 2 && renderPhaseReport()}
          {activeTab === 3 && renderConversionReport()}
          {activeTab === 4 && renderApplicationReport()}
          {activeTab === 5 && renderVisaReport()}
        </Box>
      )}

      {/* Print Styles */}
      <style>
        {`
          @media print {
            .MuiAppBar-root,
            .MuiDrawer-root,
            .MuiButton-root,
            .MuiTabs-root {
              display: none !important;
            }
            .print-content {
              margin: 0;
              padding: 20px;
            }
          }
        `}
      </style>
    </Box>
  );
}

export default Reports;
