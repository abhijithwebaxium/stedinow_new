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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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

const AddUserModal = ({ open, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phoneCode: '+1',
    password: '',
    designation: '',
    role: '',
    gender: 'Not Defined',
    dob: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open]);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/roles`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setRoles(response.data.roles);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If phone field is being changed, validate it's numeric and within length
    if (name === 'phone') {
      // Only allow digits
      const numericValue = value.replace(/\D/g, '');
      const maxLength = getPhoneLengthForCode(formData.phoneCode);

      // Limit to country-specific length
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

    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.role) {
      setError('Name, Email, Phone, Password, and Role are required');
      return;
    }

    // Validate phone number length based on country code
    const expectedLength = getPhoneLengthForCode(formData.phoneCode);
    if (formData.phone.length !== expectedLength) {
      setError(`Phone number must be exactly ${expectedLength} digits for ${formData.phoneCode}`);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/users`,
        formData,
        { withCredentials: true }
      );

      setFormData({
        name: '',
        email: '',
        phone: '',
        phoneCode: '+1',
        password: '',
        designation: '',
        role: '',
        gender: 'Not Defined',
        dob: '',
      });
      setShowPassword(false);

      onUserAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating user');
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
        password: '',
        designation: '',
        role: '',
        gender: 'Not Defined',
        dob: '',
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
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={8}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
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
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                select
                name="role"
                label="Role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                {roles.map((role) => (
                  <MenuItem key={role._id} value={role._id}>
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="designation"
                label="Designation"
                value={formData.designation}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                name="gender"
                label="Gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Prefer Not To Say">Prefer Not To Say</MenuItem>
                <MenuItem value="Not Defined">Not Defined</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="dob"
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
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
          {loading ? 'Adding...' : 'Add User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserModal;
