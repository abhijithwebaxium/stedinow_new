import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PHONE_CODES = [
  { value: '+91', label: '+91 (India)' },
  { value: '+1', label: '+1 (USA/Canada)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+64', label: '+64 (New Zealand)' },
];

function PartnerAddStudent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneCode: '+91',
    phone: '',
    dob: '',
    gender: '',
    nationality: '',
    passportNumber: '',
    interestedCountry: '',
    interestedCourse: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${API_URL}/api/partner-portal/students`,
        formData,
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        setSuccess('Student added successfully!');
        setTimeout(() => {
          navigate('/partner/students');
        }, 1500);
      }
    } catch (err) {
      console.error('Error adding student:', err);
      setError(
        err.response?.data?.message || 'Failed to add student. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Add New Student
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the student details below to add them to your portal
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Personal Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Phone Code"
                name="phoneCode"
                value={formData.phoneCode}
                onChange={handleChange}
              >
                {PHONE_CODES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                required
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Passport Number"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
              />
            </Grid>

            {/* Study Interests */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Study Interests
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Interested Country"
                name="interestedCountry"
                value={formData.interestedCountry}
                onChange={handleChange}
                placeholder="e.g., USA, UK, Canada"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Interested Course"
                name="interestedCourse"
                value={formData.interestedCourse}
                onChange={handleChange}
                placeholder="e.g., Computer Science, Business"
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/partner/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Adding Student...' : 'Add Student'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default PartnerAddStudent;
