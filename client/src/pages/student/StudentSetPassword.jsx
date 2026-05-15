import { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, InputAdornment, IconButton, alpha, Paper } from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined as LockIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    bgcolor: '#f8fafc',
    color: '#1e293b',
    '& input': { color: '#1e293b', '&::placeholder': { color: '#94a3b8', opacity: 1 } },
    '& fieldset': { borderColor: alpha('#94a3b8', 0.25) },
    '&:hover fieldset': { borderColor: '#3B82F6' },
    '&.Mui-focused fieldset': { borderColor: '#3B82F6' },
  },
};

const StudentSetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const spToken = sessionStorage.getItem('sp_token');
      await axios.post(
        `${API_URL}/api/student-portal/change-password`,
        { newPassword: password },
        {
          withCredentials: true,
          headers: spToken ? { Authorization: `Bearer ${spToken}` } : {},
        }
      );
      sessionStorage.removeItem('sp_token');
      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Paper elevation={0} sx={{ maxWidth: 440, width: '100%', p: 5, borderRadius: '32px', border: `1px solid ${alpha('#94a3b8', 0.12)}`, boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ width: 56, height: 56, bgcolor: alpha('#3B82F6', 0.1), borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <LockIcon sx={{ color: '#3B82F6', fontSize: 26 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', mb: 1 }}>Set Your Password</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Welcome! Create a secure password for your student account.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', mb: 0.8 }}>New Password</Typography>
            <TextField
              fullWidth
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              sx={fieldSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPwd(p => !p)} edge="end">
                      {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3, display: 'block', mb: 0.8 }}>Confirm Password</Typography>
            <TextField
              fullWidth
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              sx={fieldSx}
            />
          </Box>

          {error && (
            <Box sx={{ p: 2, bgcolor: alpha('#EF4444', 0.06), borderRadius: '12px', border: `1px solid ${alpha('#EF4444', 0.2)}`, mb: 2.5 }}>
              <Typography variant="body2" sx={{ color: '#DC2626', fontWeight: 700, fontSize: '0.82rem' }}>{error}</Typography>
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !password || !confirm}
            sx={{ py: 1.6, borderRadius: '14px', fontWeight: 800, textTransform: 'none', fontSize: '0.95rem', bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' } }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Set Password & Continue'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default StudentSetPassword;
