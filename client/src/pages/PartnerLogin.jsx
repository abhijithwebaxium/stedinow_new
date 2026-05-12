import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material';
import { Visibility, VisibilityOff, Business } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function PartnerLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please provide email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/partner-portal/login`,
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        // Store partner data
        localStorage.setItem('partner', JSON.stringify(response.data.data.partner));

        // Navigate to partner dashboard
        navigate('/partner/dashboard');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* Left Side - Gradient Section */}
      <Box
        sx={{
          flex: { xs: 0, md: 1.2, lg: 1.5 },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 6,
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Business sx={{ fontSize: 60, mb: 2 }} />
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, mb: 2, letterSpacing: -1 }}
          >
            Partner Portal
          </Typography>
          <Typography
            variant="h5"
            sx={{ opacity: 0.9, fontWeight: 300, maxWidth: '500px' }}
          >
            Welcome to Stedinow Partner Portal. Manage your students and track your performance.
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Form Section */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, sm: 6, md: 8 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: '450px',
            width: '100%',
            bgcolor: 'transparent',
          }}
        >
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}
            >
              Partner Login
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Access your partner dashboard
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{ mb: 2.5 }}
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{ mb: 1 }}
              InputProps={{
                sx: { borderRadius: 2 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { color: 'primary.main' },
                }}
                onClick={() => navigate('/login')}
              >
                ← Admin Login
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'primary.main',
                  cursor: 'pointer',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: '#FFFFFF',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                  background: 'linear-gradient(135deg, #0e8070 0%, #2dd46b 100%)',
                },
              }}
            >
              {loading ? 'Verifying...' : 'Sign In as Partner'}
            </Button>
          </Box>
        </Paper>

        <Box sx={{ mt: 'auto', pt: 4 }}>
          <Typography variant="caption" color="text.disabled">
            © {new Date().getFullYear()} Stedinow CRM - Partner Portal. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default PartnerLogin;
