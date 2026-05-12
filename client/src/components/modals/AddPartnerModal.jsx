import React, { useState } from 'react';
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
  InputAdornment,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Common country codes
const COUNTRY_CODES = [
  { code: '+1', country: 'USA/Canada', length: 10 },
  { code: '+44', country: 'UK', length: 10 },
  { code: '+91', country: 'India', length: 10 },
  { code: '+61', country: 'Australia', length: 9 },
  { code: '+971', country: 'UAE', length: 9 },
  { code: '+966', country: 'Saudi Arabia', length: 9 },
];

const getPhoneLengthForCode = (code) => {
  const country = COUNTRY_CODES.find(c => c.code === code);
  return country ? country.length : 10;
};

const BUSINESS_TYPES = [
  'Individual Agent',
  'Agency',
  'Educational Institute',
  'Corporate',
  'Other',
];

const COMMISSION_TYPES = ['Percentage', 'Fixed Amount', 'Tiered', 'Custom'];

const AddPartnerModal = ({ open, onClose, onPartnerAdded }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPersonName: '',
    email: '',
    phone: '',
    phoneCode: '+91',
    alternativePhone: '',
    alternativePhoneCode: '+91',
    password: '',
    businessType: 'Individual Agent',
    website: '',
    commissionRate: '',
    commissionType: 'Percentage',
    // Address
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone' || name === 'alternativePhone') {
      const numericValue = value.replace(/\D/g, '');
      const codeField = name === 'phone' ? 'phoneCode' : 'alternativePhoneCode';
      const maxLength = getPhoneLengthForCode(formData[codeField]);

      if (numericValue.length <= maxLength) {
        setFormData({
          ...formData,
          [name]: numericValue,
        });
      }
    } else if (name === 'commissionRate') {
      const numValue = value.replace(/[^\d.]/g, '');
      if (numValue === '' || (parseFloat(numValue) >= 0 && parseFloat(numValue) <= 100)) {
        setFormData({
          ...formData,
          [name]: numValue,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.companyName || !formData.contactPersonName || !formData.email || !formData.phone || !formData.password) {
      setError('Company Name, Contact Person, Email, Phone, and Password are required');
      return;
    }

    const expectedLength = getPhoneLengthForCode(formData.phoneCode);
    if (formData.phone.length !== expectedLength) {
      setError(`Phone number must be exactly ${expectedLength} digits for ${formData.phoneCode}`);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
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
        password: formData.password,
        businessType: formData.businessType,
        commissionType: formData.commissionType,
      };

      // Optional fields
      if (formData.alternativePhone) {
        payload.alternativePhone = formData.alternativePhone;
        payload.alternativePhoneCode = formData.alternativePhoneCode;
      }
      if (formData.website) payload.website = formData.website;
      if (formData.commissionRate) payload.commissionRate = parseFloat(formData.commissionRate);

      // Address
      if (formData.street || formData.city || formData.state || formData.country || formData.postalCode) {
        payload.address = {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
        };
      }

      await axios.post(
        `${API_URL}/api/partners`,
        payload,
        { withCredentials: true }
      );

      // Reset form
      setFormData({
        companyName: '',
        contactPersonName: '',
        email: '',
        phone: '',
        phoneCode: '+91',
        alternativePhone: '',
        alternativePhoneCode: '+91',
        password: '',
        businessType: 'Individual Agent',
        website: '',
        commissionRate: '',
        commissionType: 'Percentage',
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      });
      setShowPassword(false);

      onPartnerAdded();
      alert('Partner created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating partner');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        companyName: '',
        contactPersonName: '',
        email: '',
        phone: '',
        phoneCode: '+91',
        alternativePhone: '',
        alternativePhoneCode: '+91',
        password: '',
        businessType: 'Individual Agent',
        website: '',
        commissionRate: '',
        commissionType: 'Percentage',
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      });
      setShowPassword(false);
      setError('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slots={{
        transition: Transition,
      }}
      keepMounted
    >
      <DialogTitle>Add New Partner</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Basic Information */}
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
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Contact Information */}
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Contact Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                required
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
                    {item.code} ({item.country})
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
                helperText={`Enter ${getPhoneLengthForCode(formData.phoneCode)} digit phone number`}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                name="alternativePhoneCode"
                label="Alt Phone Code"
                value={formData.alternativePhoneCode}
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
                fullWidth
                name="alternativePhone"
                label="Alternative Phone (Optional)"
                value={formData.alternativePhone}
                onChange={handleChange}
                disabled={loading}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="website"
                label="Website (Optional)"
                value={formData.website}
                onChange={handleChange}
                disabled={loading}
                placeholder="https://example.com"
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* Address Information */}
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Address Information (Optional)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
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

          <Divider sx={{ mb: 3 }} />

          {/* Commission & Authentication */}
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Commission & Authentication
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
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
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="commissionRate"
                label="Commission Rate (%)"
                value={formData.commissionRate}
                onChange={handleChange}
                disabled={loading}
                type="number"
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.1,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                helperText="Minimum 8 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Adding...' : 'Add Partner'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPartnerModal;
