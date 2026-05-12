import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Slide,
  Grid,
  MenuItem,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const COUNTRY_CODES = [
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+971', country: 'UAE' },
];

const BUSINESS_TYPES = ['Individual Agent', 'Agency', 'Educational Institute', 'Corporate', 'Other'];
const COMMISSION_TYPES = ['Percentage', 'Fixed Amount', 'Tiered', 'Custom'];
const STATUSES = ['Active', 'Inactive', 'Suspended', 'Pending Verification', 'Rejected'];

const EditPartnerModal = ({ open, onClose, onPartnerUpdated, partner }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (partner) {
      setFormData({
        companyName: partner.companyName || '',
        contactPersonName: partner.contactPersonName || '',
        email: partner.email || '',
        phone: partner.phone || '',
        phoneCode: partner.phoneCode || '+91',
        alternativePhone: partner.alternativePhone || '',
        alternativePhoneCode: partner.alternativePhoneCode || '+91',
        businessType: partner.businessType || 'Individual Agent',
        website: partner.website || '',
        commissionRate: partner.commissionRate || '',
        commissionType: partner.commissionType || 'Percentage',
        status: partner.status || 'Active',
        canEditAfterStage2_1: partner.canEditAfterStage2_1 || false,
        street: partner.address?.street || '',
        city: partner.address?.city || '',
        state: partner.address?.state || '',
        country: partner.address?.country || '',
        postalCode: partner.address?.postalCode || '',
      });
    }
  }, [partner]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.companyName || !formData.contactPersonName || !formData.email || !formData.phone) {
      setError('Company Name, Contact Person, Email, and Phone are required');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        companyName: formData.companyName,
        contactPersonName: formData.contactPersonName,
        email: formData.email,
        phone: formData.phone,
        phoneCode: formData.phoneCode,
        businessType: formData.businessType,
        commissionType: formData.commissionType,
        commissionRate: parseFloat(formData.commissionRate) || 0,
        status: formData.status,
        canEditAfterStage2_1: formData.canEditAfterStage2_1,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
        },
      };

      if (formData.alternativePhone) {
        payload.alternativePhone = formData.alternativePhone;
        payload.alternativePhoneCode = formData.alternativePhoneCode;
      }
      if (formData.website) payload.website = formData.website;

      await axios.patch(
        `${API_URL}/api/partners/${partner._id}`,
        payload,
        { withCredentials: true }
      );

      alert('Partner updated successfully!');
      onPartnerUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating partner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slots={{ transition: Transition }}
      keepMounted
    >
      <DialogTitle>Edit Partner</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="companyName"
                label="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="contactPersonName"
                label="Contact Person Name"
                value={formData.contactPersonName}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                name="businessType"
                label="Business Type"
                value={formData.businessType}
                onChange={handleChange}
                disabled={loading}
              >
                {BUSINESS_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Contact Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                name="phoneCode"
                label="Phone Code"
                value={formData.phoneCode}
                onChange={handleChange}
                disabled={loading}
              >
                {COUNTRY_CODES.map((item) => (
                  <MenuItem key={item.code} value={item.code}>
                    {item.code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={9}>
              <TextField
                required
                fullWidth
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="website"
                label="Website"
                value={formData.website}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Commission & Status
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                name="commissionType"
                label="Commission Type"
                value={formData.commissionType}
                onChange={handleChange}
                disabled={loading}
              >
                {COMMISSION_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                name="commissionRate"
                label="Commission Rate (%)"
                value={formData.commissionRate}
                onChange={handleChange}
                disabled={loading}
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                name="status"
                label="Status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                {STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.canEditAfterStage2_1}
                    onChange={handleChange}
                    name="canEditAfterStage2_1"
                    disabled={loading}
                  />
                }
                label="Allow editing students after Stage 2.1 (Student Registration)"
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Address Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="street"
                label="Street Address"
                value={formData.street}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="city"
                label="City"
                value={formData.city}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="state"
                label="State"
                value={formData.state}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="country"
                label="Country"
                value={formData.country}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="postalCode"
                label="Postal Code"
                value={formData.postalCode}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Updating...' : 'Update Partner'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPartnerModal;
