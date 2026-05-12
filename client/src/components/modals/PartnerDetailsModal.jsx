import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import PaymentIcon from '@mui/icons-material/Payment';
import SchoolIcon from '@mui/icons-material/School';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PartnerDetailsModal = ({ open, onClose, partner, onStatusChange, onRefresh }) => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && partner) {
      fetchPartnerStats();
      fetchPartnerStudents();
    }
  }, [open, partner]);

  const fetchPartnerStats = async () => {
    if (!partner) return;
    try {
      const response = await axios.get(`${API_URL}/api/partners/${partner._id}/stats`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch partner stats:', err);
    }
  };

  const fetchPartnerStudents = async () => {
    if (!partner) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/partners/${partner._id}/students`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setStudents(response.data.data.students);
      }
    } catch (err) {
      console.error('Failed to fetch partner students:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!partner) return null;

  const getStatusColor = (status) => {
    const colors = {
      Active: 'success',
      Inactive: 'default',
      Suspended: 'error',
      'Pending Verification': 'warning',
      Rejected: 'error',
    };
    return colors[status] || 'default';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Partner Details</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Header Card */}
        <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {partner.companyName}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Partner ID: {partner.partnerId}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Contact: {partner.contactPersonName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Chip
                    label={partner.status}
                    color={getStatusColor(partner.status)}
                    sx={{ bgcolor: 'white' }}
                  />
                  <Chip
                    label={partner.verificationStatus}
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'white' }}
                  />
                  <Chip
                    label={partner.businessType}
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'white' }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab label="Overview" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="Contact Info" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Commission" icon={<PaymentIcon />} iconPosition="start" />
          <Tab label="Students" icon={<SchoolIcon />} iconPosition="start" />
        </Tabs>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Total Students
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {partner.totalStudents}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Active Students
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="success.main">
                      {partner.activeStudents}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Converted
                    </Typography>
                    <Typography variant="h4" fontWeight={600} color="primary.main">
                      {partner.convertedStudents}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Conversion Rate
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {partner.conversionRate || 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Allowed Access
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Phases:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                    {partner.allowedPhases?.map((phase) => (
                      <Chip key={phase} label={phase} size="small" color="primary" variant="outlined" />
                    ))}
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Stages:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                    {partner.allowedStages?.map((stage) => (
                      <Chip key={stage} label={stage} size="small" color="info" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Permissions
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Edit After Stage 2.1:{' '}
                    <Chip
                      label={partner.canEditAfterStage2_1 ? 'Yes' : 'No'}
                      size="small"
                      color={partner.canEditAfterStage2_1 ? 'success' : 'default'}
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Agreement Signed:{' '}
                    <Chip
                      label={partner.agreementSigned ? 'Yes' : 'No'}
                      size="small"
                      color={partner.agreementSigned ? 'success' : 'default'}
                    />
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Contact Info Tab */}
        {tabValue === 1 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Contact Details
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">Email: {partner.email}</Typography>
                  <Typography variant="body2">Phone: {partner.phoneCode} {partner.phone}</Typography>
                  {partner.alternativePhone && (
                    <Typography variant="body2">
                      Alt Phone: {partner.alternativePhoneCode} {partner.alternativePhone}
                    </Typography>
                  )}
                  {partner.website && <Typography variant="body2">Website: {partner.website}</Typography>}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Address
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {partner.address?.street && <Typography variant="body2">{partner.address.street}</Typography>}
                  <Typography variant="body2">
                    {[partner.address?.city, partner.address?.state, partner.address?.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </Typography>
                  {partner.address?.country && <Typography variant="body2">{partner.address.country}</Typography>}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Commission Tab */}
        {tabValue === 2 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Commission Structure
                    </Typography>
                    <Typography variant="body2">Type: {partner.commissionType}</Typography>
                    <Typography variant="body2">Rate: {partner.commissionRate}%</Typography>
                    <Typography variant="h5" fontWeight={600} sx={{ mt: 2 }}>
                      Total Earned: ₹{partner.totalCommissionEarned || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                {partner.bankDetails && (
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Bank Details
                      </Typography>
                      <Typography variant="body2">
                        Account Holder: {partner.bankDetails.accountHolderName}
                      </Typography>
                      <Typography variant="body2">Bank: {partner.bankDetails.bankName}</Typography>
                      <Typography variant="body2">Account: {partner.bankDetails.accountNumber}</Typography>
                      <Typography variant="body2">IFSC: {partner.bankDetails.ifscCode}</Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Students Tab */}
        {tabValue === 3 && (
          <Box>
            {loading ? (
              <Typography>Loading students...</Typography>
            ) : students.length === 0 ? (
              <Typography color="text.secondary">No students registered by this partner yet.</Typography>
            ) : (
              <Box>
                {students.slice(0, 10).map((student) => (
                  <Card key={student._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {student.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.studentId}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                            <Chip label={student.currentStage} size="small" color="primary" />
                            <Chip label={student.currentStatus} size="small" color="info" />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                {students.length > 10 && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Showing 10 of {students.length} students
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartnerDetailsModal;
