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
} from '@mui/material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Common country codes with phone length validation
const COUNTRY_CODES = [
  { code: '+1', country: 'USA/Canada', length: 10 },
  { code: '+44', country: 'UK', length: 10 },
  { code: '+91', country: 'India', length: 10 },
  { code: '+61', country: 'Australia', length: 9 },
  { code: '+971', country: 'UAE', length: 9 },
  { code: '+966', country: 'Saudi Arabia', length: 9 },
  { code: '+974', country: 'Qatar', length: 8 },
  { code: '+965', country: 'Kuwait', length: 8 },
  { code: '+968', country: 'Oman', length: 8 },
  { code: '+973', country: 'Bahrain', length: 8 },
  { code: '+92', country: 'Pakistan', length: 10 },
  { code: '+880', country: 'Bangladesh', length: 10 },
  { code: '+94', country: 'Sri Lanka', length: 9 },
  { code: '+977', country: 'Nepal', length: 10 },
  { code: '+86', country: 'China', length: 11 },
  { code: '+81', country: 'Japan', length: 10 },
  { code: '+82', country: 'South Korea', length: 10 },
  { code: '+65', country: 'Singapore', length: 8 },
  { code: '+60', country: 'Malaysia', length: 9 },
  { code: '+66', country: 'Thailand', length: 9 },
  { code: '+84', country: 'Vietnam', length: 9 },
  { code: '+62', country: 'Indonesia', length: 10 },
  { code: '+63', country: 'Philippines', length: 10 },
  { code: '+64', country: 'New Zealand', length: 9 },
  { code: '+27', country: 'South Africa', length: 9 },
  { code: '+49', country: 'Germany', length: 10 },
  { code: '+33', country: 'France', length: 9 },
  { code: '+39', country: 'Italy', length: 10 },
  { code: '+34', country: 'Spain', length: 9 },
  { code: '+351', country: 'Portugal', length: 9 },
  { code: '+7', country: 'Russia', length: 10 },
];

// Helper function to get phone length for country code
const getPhoneLengthForCode = (code) => {
  const country = COUNTRY_CODES.find(c => c.code === code);
  return country ? country.length : 10; // default to 10 if not found
};

const AddStudentModal = ({ open, onClose, onStudentAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phoneCode: '+1',
    alternativePhone: '',
    alternativePhoneCode: '+1',
    parentPhone: '',
    parentPhoneCode: '+1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If any phone field is being changed, validate it's numeric and within length
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      const maxLength = getPhoneLengthForCode(formData.phoneCode);
      if (numericValue.length <= maxLength) {
        setFormData({
          ...formData,
          [name]: numericValue,
        });
      }
    } else if (name === 'alternativePhone') {
      const numericValue = value.replace(/\D/g, '');
      const maxLength = getPhoneLengthForCode(formData.alternativePhoneCode);
      if (numericValue.length <= maxLength) {
        setFormData({
          ...formData,
          [name]: numericValue,
        });
      }
    } else if (name === 'parentPhone') {
      const numericValue = value.replace(/\D/g, '');
      const maxLength = getPhoneLengthForCode(formData.parentPhoneCode);
      if (numericValue.length <= maxLength) {
        setFormData({
          ...formData,
          [name]: numericValue,
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

    if (!formData.name || !formData.email || !formData.phone) {
      setError('Name, Email, and Phone are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate main phone number length
    const expectedLength = getPhoneLengthForCode(formData.phoneCode);
    if (formData.phone.length !== expectedLength) {
      setError(`Phone number must be exactly ${expectedLength} digits for ${formData.phoneCode}`);
      return;
    }

    // Validate alternative phone if provided
    if (formData.alternativePhone) {
      const altExpectedLength = getPhoneLengthForCode(formData.alternativePhoneCode);
      if (formData.alternativePhone.length !== altExpectedLength) {
        setError(`Alternative phone must be exactly ${altExpectedLength} digits for ${formData.alternativePhoneCode}`);
        return;
      }
    }

    // Validate parent phone if provided
    if (formData.parentPhone) {
      const parentExpectedLength = getPhoneLengthForCode(formData.parentPhoneCode);
      if (formData.parentPhone.length !== parentExpectedLength) {
        setError(`Parent phone must be exactly ${parentExpectedLength} digits for ${formData.parentPhoneCode}`);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        phoneCode: formData.phoneCode,
      };

      if (formData.alternativePhone) {
        payload.alternativePhone = formData.alternativePhone;
        payload.alternativePhoneCode = formData.alternativePhoneCode;
      }

      if (formData.parentPhone) {
        payload.parentPhone = formData.parentPhone;
        payload.parentPhoneCode = formData.parentPhoneCode;
      }

      const res = await axios.post(
        `${API_URL}/api/students`,
        payload,
        { withCredentials: true }
      );

      setFormData({
        name: '',
        email: '',
        phone: '',
        phoneCode: '+1',
        alternativePhone: '',
        alternativePhoneCode: '+1',
        parentPhone: '',
        parentPhoneCode: '+1',
      });

      onStudentAdded(res.data.student);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating student');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        phoneCode: '+1',
        alternativePhone: '',
        alternativePhoneCode: '+1',
        parentPhone: '',
        parentPhoneCode: '+1',
      });
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
      <DialogTitle>Add New Student</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="name"
                label="Full Name"
                value={formData.name}
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  required
                  select
                  name="phoneCode"
                  label="Code"
                  value={formData.phoneCode}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ width: '120px' }}
                >
                  {COUNTRY_CODES.map((item) => (
                    <MenuItem key={item.code} value={item.code}>
                      {item.code}
                    </MenuItem>
                  ))}
                </TextField>
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
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  select
                  name="alternativePhoneCode"
                  label="Code"
                  value={formData.alternativePhoneCode}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ width: '120px' }}
                >
                  {COUNTRY_CODES.map((item) => (
                    <MenuItem key={item.code} value={item.code}>
                      {item.code}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  name="alternativePhone"
                  label="Alternative Phone"
                  value={formData.alternativePhone}
                  onChange={handleChange}
                  disabled={loading}
                  helperText={`Enter ${getPhoneLengthForCode(formData.alternativePhoneCode)} digit phone number`}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  select
                  name="parentPhoneCode"
                  label="Code"
                  value={formData.parentPhoneCode}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ width: '120px' }}
                >
                  {COUNTRY_CODES.map((item) => (
                    <MenuItem key={item.code} value={item.code}>
                      {item.code}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  name="parentPhone"
                  label="Parent/Guardian Phone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  disabled={loading}
                  helperText={`Enter ${getPhoneLengthForCode(formData.parentPhoneCode)} digit phone number`}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Adding...' : 'Add Student'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStudentModal;
