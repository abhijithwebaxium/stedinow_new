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
import { Visibility, VisibilityOff, PhoneOutlined, EmailOutlined } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/userSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const GlassCard = ({ children, sx }) => (
  <Paper
    elevation={0}
    sx={{
      background: (theme) => alpha(theme.palette.background.paper, 0.6),
      backdropFilter: 'blur(15px)',
      borderRadius: '32px',
      border: '1px solid',
      borderColor: (theme) => alpha(theme.palette.divider, 0.1),
      p: { xs: 3, sm: 6 },
      boxShadow: (theme) => `0 30px 60px ${alpha(theme.palette.common.black, 0.15)}`,
      ...sx
    }}
  >
    {children}
  </Paper>
);

function StudentLogin() {
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
      setError('Please provide your email and phone number');
      return;
    }
    setLoading(true);
    dispatch(loginStart());
    try {
      const response = await axios.post(
        `${API_URL}/api/student-portal/login`,
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );
      if (response.data.status === 'success') {
        const userData = { ...response.data.user, role: 'student' };
        dispatch(loginSuccess(userData));
        localStorage.setItem('user', JSON.stringify(userData));
        // First-time login — force password change before continuing
        if (response.data.mustChangePassword) {
          navigate('/student/set-password', { replace: true });
        } else {
          navigate('/student/dashboard');
        }
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
        background: `linear-gradient(135deg, ${alpha('#3B82F6', 0.1)} 0%, ${alpha('#8B5CF6', 0.1)} 100%)`,
        bgcolor: '#f8fafc',
        p: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Abstract Background Shapes */}
      <Box sx={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'linear-gradient(45deg, #3B82F6, #60A5FA)', opacity: 0.1, filter: 'blur(80px)', animation: 'pulse 10s infinite' }} />
      <Box sx={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'linear-gradient(45deg, #8B5CF6, #A78BFA)', opacity: 0.1, filter: 'blur(100px)', animation: 'pulse 15s infinite' }} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '24px', bgcolor: 'white', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', mb: 3 }}>
             <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-1.5px', fontFamily: '"Outfit", sans-serif' }}>
               Stedi<Box component="span" sx={{ color: '#3B82F6' }}>Now</Box>
             </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#334155', mb: 1, fontFamily: '"Outfit", sans-serif' }}>
            Student Success Portal
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
            Your journey to global education starts here.
          </Typography>
        </Box>

        <GlassCard>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#1e293b', textAlign: 'center', fontFamily: '"Outfit", sans-serif' }}>
            Student Login
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 4, textAlign: 'center', fontWeight: 600 }}>
            Enter your email and registered phone number
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '16px', fontWeight: 600 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Email Address</Typography>
            <TextField
              fullWidth
              placeholder="e.g. alex@example.com"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{ mb: 3 }}
              InputProps={{
                sx: {
                  borderRadius: '16px',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#1e293b',
                  '& input': { color: '#1e293b', '&::placeholder': { color: '#94a3b8', opacity: 1 } },
                  '&:hover': { borderColor: '#3B82F6' },
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Typography variant="caption" sx={{ ml: 1, mb: 1, display: 'block', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Phone Number (Password)</Typography>
            <TextField
              fullWidth
              placeholder="e.g. 9876543210"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{ mb: 4 }}
              InputProps={{
                sx: {
                  borderRadius: '16px',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#1e293b',
                  '& input': { color: '#1e293b', '&::placeholder': { color: '#94a3b8', opacity: 1 } },
                  '&:hover': { borderColor: '#3B82F6' },
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlined sx={{ color: '#94a3b8' }} />
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
                fontWeight: 900,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                color: '#fff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  boxShadow: '0 15px 35px rgba(59, 130, 246, 0.4)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Entering Portal...' : 'Launch Student Dashboard'}
            </Button>
          </Box>
        </GlassCard>

        <Box sx={{ mt: 5, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 3 }}>
           <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#3B82F6' } }}>Need Help?</Typography>
           <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, cursor: 'pointer', '&:hover': { color: '#3B82F6' } }}>Privacy Policy</Typography>
        </Box>
      </Container>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.1; }
            50% { transform: scale(1.1); opacity: 0.15; }
            100% { transform: scale(1); opacity: 0.1; }
          }
        `}
      </style>
    </Box>
  );
}

export default StudentLogin;
