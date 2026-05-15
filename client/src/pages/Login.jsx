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
  Container,
  alpha,
  useTheme
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, EmailOutlined } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/userSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const GlassCard = ({ children, sx }) => (
  <Paper
    elevation={0}
    sx={{
      background: (theme) => alpha(theme.palette.background.paper, 0.7),
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      border: '1px solid',
      borderColor: (theme) => alpha(theme.palette.divider, 0.1),
      p: { xs: 3, sm: 6 },
      boxShadow: (theme) => `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
      ...sx
    }}
  >
    {children}
  </Paper>
);

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    dispatch(loginStart());
    try {
      const response = await axios.post(
        `${API_URL}/api/login`,
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );
      if (response.data.status === 'success') {
        const userData = { ...response.data.user, token: response.data.token || 'dummy-token' };
        dispatch(loginSuccess(userData));
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
                     radial-gradient(circle at 100% 100%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 50%)`,
        bgcolor: 'background.default',
        p: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Circles */}
      <Box sx={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: alpha(theme.palette.primary.main, 0.1), filter: 'blur(50px)' }} />
      <Box sx={{ position: 'absolute', bottom: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: alpha(theme.palette.secondary.main, 0.1), filter: 'blur(50px)' }} />

      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              letterSpacing: '-2px',
              mb: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: '"Outfit", sans-serif'
            }}
          >
            Stedinow
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, opacity: 0.8 }}>
            Admin Portal Management System
          </Typography>
        </Box>

        <GlassCard>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textAlign: 'center', fontFamily: '"Outfit", sans-serif' }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center', fontWeight: 500 }}>
            Enter your administrative credentials
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{ mb: 3 }}
              InputProps={{
                sx: { borderRadius: '16px', bgcolor: alpha(theme.palette.divider, 0.03) },
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: 'text.secondary', opacity: 0.5 }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{ mb: 1 }}
              InputProps={{
                sx: { borderRadius: '16px', bgcolor: alpha(theme.palette.divider, 0.03) },
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'text.secondary', opacity: 0.5 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'primary.main',
                  cursor: 'pointer',
                  fontWeight: 700,
                  '&:hover': { opacity: 0.8 },
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
                py: 2,
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: 800,
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                color: '#fff',
                '&:hover': {
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.35)}`,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </Button>
          </Box>
        </GlassCard>

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
            © {new Date().getFullYear()} Stedinow CRM • Secure Admin Access
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;
