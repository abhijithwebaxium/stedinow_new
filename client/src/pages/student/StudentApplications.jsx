import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Stack, Chip, alpha, useTheme,
  CircularProgress, Grid, Divider, Avatar, Stepper, Step, StepLabel,
} from '@mui/material';
import {
  SchoolOutlined as UnivIcon,
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as PendingDot,
  FiberManualRecord as ActiveDot,
  CalendarToday as CalIcon,
  AttachMoney as FeeIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const APPLICATION_STAGES = [
  'Document Collection',
  'Document Verification',
  'Application Submission',
  'Awaiting Response',
  'Offer Letter Received',
  'Completed',
];

const STATUS_COLORS = {
  'Draft': { bg: '#F1F5F9', text: '#64748b' },
  'In Progress': { bg: alpha('#3B82F6', 0.1), text: '#2563EB' },
  'Submitted': { bg: alpha('#8B5CF6', 0.1), text: '#7C3AED' },
  'Under Review': { bg: alpha('#F59E0B', 0.1), text: '#D97706' },
  'Conditional Offer': { bg: alpha('#F59E0B', 0.12), text: '#B45309' },
  'Unconditional Offer': { bg: alpha('#10B981', 0.1), text: '#059669' },
  'Rejected': { bg: alpha('#EF4444', 0.08), text: '#DC2626' },
  'Accepted': { bg: alpha('#10B981', 0.15), text: '#047857' },
  'Withdrawn': { bg: '#F1F5F9', text: '#94a3b8' },
  'Deferred': { bg: alpha('#F59E0B', 0.08), text: '#92400E' },
};

const COUNTRY_FLAGS = {
  'UK': '🇬🇧', 'United Kingdom': '🇬🇧', 'USA': '🇺🇸', 'United States': '🇺🇸',
  'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Germany': '🇩🇪', 'Ireland': '🇮🇪',
  'New Zealand': '🇳🇿', 'France': '🇫🇷', 'Netherlands': '🇳🇱', 'Sweden': '🇸🇪',
};

const ApplicationCard = ({ app }) => {
  const theme = useTheme();
  const statusStyle = STATUS_COLORS[app.status] || { bg: '#F1F5F9', text: '#64748b' };
  const flag = COUNTRY_FLAGS[app.university?.country] || '🎓';
  const stageIndex = APPLICATION_STAGES.indexOf(app.currentStage);

  return (
    <Paper elevation={0} sx={{
      borderRadius: '28px', border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      bgcolor: 'white', overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.08)' },
    }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar variant="rounded" sx={{ width: 52, height: 52, bgcolor: alpha('#3B82F6', 0.08), fontSize: '1.6rem', borderRadius: '14px' }}>
            {flag}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                  {app.university?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mt: 0.3 }}>
                  {app.course?.name} {app.course?.level ? `• ${app.course.level}` : ''} {app.intake ? `• ${app.intake}` : ''}
                </Typography>
              </Box>
              <Chip
                label={app.status}
                size="small"
                sx={{ bgcolor: statusStyle.bg, color: statusStyle.text, fontWeight: 800, borderRadius: '10px', fontSize: '0.72rem' }}
              />
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Stage Progress */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
          Application Progress
        </Typography>
        <Stack direction="row" spacing={0} sx={{ overflowX: 'auto', pb: 0.5 }}>
          {APPLICATION_STAGES.map((stage, idx) => {
            const isDone = idx < stageIndex;
            const isActive = idx === stageIndex;
            return (
              <Box key={stage} sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 70 }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: isDone ? '#10B981' : isActive ? '#3B82F6' : alpha('#94a3b8', 0.1),
                    border: isActive ? `2px solid #3B82F6` : 'none',
                  }}>
                    {isDone
                      ? <DoneIcon sx={{ fontSize: 16, color: 'white' }} />
                      : <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isActive ? '#3B82F6' : '#cbd5e1' }} />
                    }
                  </Box>
                  <Typography variant="caption" sx={{
                    fontSize: '0.6rem', fontWeight: isActive ? 800 : 600, textAlign: 'center', lineHeight: 1.2,
                    color: isDone ? '#10B981' : isActive ? '#3B82F6' : '#94a3b8',
                  }}>
                    {stage.split(' ').slice(0, 2).join(' ')}
                  </Typography>
                </Box>
                {idx < APPLICATION_STAGES.length - 1 && (
                  <Box sx={{ width: 20, height: 2, bgcolor: isDone ? '#10B981' : alpha('#94a3b8', 0.15), mb: 2, flexShrink: 0 }} />
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Divider sx={{ opacity: 0.5 }} />

      {/* Footer */}
      <Box sx={{ px: 3, py: 2 }}>
        <Grid container spacing={2}>
          {app.applicationDate && (
            <Grid item xs={6} sm={3}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <CalIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.65rem', display: 'block', textTransform: 'uppercase' }}>Applied</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.75rem' }}>
                    {new Date(app.applicationDate).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          )}
          {app.tuitionFee?.amount && (
            <Grid item xs={6} sm={3}>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <FeeIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.65rem', display: 'block', textTransform: 'uppercase' }}>Tuition</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.75rem' }}>
                    {app.tuitionFee.currency || 'GBP'} {app.tuitionFee.amount?.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          )}
          {app.offerType && (
            <Grid item xs={6} sm={3}>
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.65rem', display: 'block', textTransform: 'uppercase', mb: 0.3 }}>Offer Type</Typography>
                <Chip
                  label={app.offerType}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.65rem', fontWeight: 800, borderRadius: '8px',
                    bgcolor: app.offerType === 'Unconditional' ? alpha('#10B981', 0.1) : alpha('#F59E0B', 0.1),
                    color: app.offerType === 'Unconditional' ? '#059669' : '#D97706',
                  }}
                />
              </Box>
            </Grid>
          )}
          {app.offerConditions?.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.65rem', display: 'block', textTransform: 'uppercase', mb: 0.5 }}>Conditions to Clear</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {app.offerConditions.map((c, i) => (
                  <Chip key={i} label={c} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha('#F59E0B', 0.08), color: '#92400E', borderRadius: '8px' }} />
                ))}
              </Stack>
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
};

const StudentApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/student-portal/applications`, { withCredentials: true });
        if (res.data.status === 'success') setApplications(res.data.applications);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5, fontFamily: '"Outfit", sans-serif' }}>
          My Applications
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
          Track your university applications and their current status.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : applications.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, borderRadius: '28px', border: `1px solid rgba(0,0,0,0.06)`, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>🎓</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>No Applications Yet</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            Your counselor will add university applications here once they're initiated.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {applications.map(app => <ApplicationCard key={app._id} app={app} />)}
        </Stack>
      )}
    </Box>
  );
};

export default StudentApplications;
