import { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, alpha, useTheme, Paper, Chip,
  CircularProgress, IconButton, Tooltip,
} from '@mui/material';
import {
  NotificationsNoneOutlined as BellIcon,
  CheckCircleOutline as CheckIcon,
  DescriptionOutlined as DocIcon,
  SchoolOutlined as AppIcon,
  SwapHoriz as PhaseIcon,
  ChatBubbleOutline as MsgIcon,
  CalendarToday as DeadlineIcon,
  DoneAll as MarkAllIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const TYPE_CONFIG = {
  document_verified: { icon: <DocIcon sx={{ fontSize: 18 }} />, color: '#10B981' },
  document_rejected: { icon: <DocIcon sx={{ fontSize: 18 }} />, color: '#EF4444' },
  phase_changed: { icon: <PhaseIcon sx={{ fontSize: 18 }} />, color: '#3B82F6' },
  application_update: { icon: <AppIcon sx={{ fontSize: 18 }} />, color: '#8B5CF6' },
  message: { icon: <MsgIcon sx={{ fontSize: 18 }} />, color: '#F59E0B' },
  deadline: { icon: <DeadlineIcon sx={{ fontSize: 18 }} />, color: '#EF4444' },
  general: { icon: <BellIcon sx={{ fontSize: 18 }} />, color: '#64748b' },
};

const StudentNotifications = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/student-portal/notifications`, { withCredentials: true });
      if (res.data.status === 'success') setNotifications(res.data.notifications);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotifications();
    // Mark all as read after viewing
    const timer = setTimeout(async () => {
      try {
        await axios.patch(`${API_URL}/api/student-portal/notifications/read`, {}, { withCredentials: true });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (_) {}
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(date).toLocaleDateString('en', { day: 'numeric', month: 'short' });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', fontFamily: '"Outfit", sans-serif' }}>
              Notifications
            </Typography>
            {unread > 0 && (
              <Chip label={`${unread} new`} size="small" sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#DC2626', fontWeight: 800, fontSize: '0.72rem', borderRadius: '10px' }} />
            )}
          </Stack>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600, mt: 0.3 }}>
            Updates from your counselor and application activity.
          </Typography>
        </Box>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : notifications.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, borderRadius: '28px', border: `1px solid rgba(0,0,0,0.06)`, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem', mb: 2 }}>🔔</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>All Caught Up!</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            No notifications yet. Updates about your documents and applications will appear here.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
            return (
              <Paper key={n._id} elevation={0} sx={{
                p: 2.5, borderRadius: '18px',
                border: `1px solid ${!n.read ? alpha(cfg.color, 0.2) : alpha(theme.palette.divider, 0.07)}`,
                bgcolor: !n.read ? alpha(cfg.color, 0.03) : 'white',
                transition: 'all 0.2s',
              }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: alpha(cfg.color, 0.1), color: cfg.color, display: 'flex', flexShrink: 0, mt: 0.2 }}>
                    {cfg.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>
                        {n.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.68rem' }}>
                        {formatTime(n.createdAt)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mt: 0.4, fontSize: '0.83rem' }}>
                      {n.message}
                    </Typography>
                  </Box>
                  {!n.read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0, mt: 1 }} />}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default StudentNotifications;
