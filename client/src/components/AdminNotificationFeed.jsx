import { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, alpha, useTheme, Paper, Chip,
  CircularProgress, IconButton, Divider, ListItemButton,
  Avatar, Menu,
} from '@mui/material';
import {
  NotificationsNoneOutlined as BellIcon,
  DescriptionOutlined as DocIcon,
  SchoolOutlined as AppIcon,
  ChatBubbleOutline as MsgIcon,
  CheckCircleOutline as TaskIcon,
  PersonOutline as StudentIcon,
  MoreVert as MoreIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { initiateSocketConnection } from '../utils/socket';

const TYPE_CONFIG = {
  document_verified: { icon: <TaskIcon sx={{ fontSize: 18 }} />, color: '#10B981' },
  document_rejected: { icon: <DeleteIcon sx={{ fontSize: 18 }} />, color: '#EF4444' },
  info: { icon: <DocIcon sx={{ fontSize: 18 }} />, color: '#3B82F6' },
  success: { icon: <TaskIcon sx={{ fontSize: 18 }} />, color: '#10B981' },
  warning: { icon: <BellIcon sx={{ fontSize: 18 }} />, color: '#F59E0B' },
  error: { icon: <DeleteIcon sx={{ fontSize: 18 }} />, color: '#EF4444' },
};

const AdminNotificationFeed = ({ anchorEl, open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      if (res.data.status === 'success') setNotifications(res.data.notifications);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  useEffect(() => {
    const socket = initiateSocketConnection();
    socket.on('new_admin_notification', (n) => {
      setNotifications(prev => [n, ...prev]);
    });
  }, []);

  const handleRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (_) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (_) {}
  };

  const handleClick = (n) => {
    handleRead(n._id);
    onClose();
    if (n.link) {
      navigate(n.link);
    }
  };

  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(date).toLocaleDateString('en', { day: 'numeric', month: 'short' });
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 1.5,
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }
        }
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Notifications
            {unread > 0 && <Chip label={unread} size="small" color="error" sx={{ ml: 1, height: 18, fontSize: '0.65rem', fontWeight: 900 }} />}
          </Typography>
          {unread > 0 && (
            <Typography 
              variant="caption" 
              onClick={handleMarkAllRead}
              sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
            >
              Mark all as read
            </Typography>
          )}
        </Stack>
      </Box>
      <Divider sx={{ opacity: 0.6 }} />

      <Box sx={{ overflowY: 'auto', maxHeight: 400 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>No notifications yet.</Typography>
          </Box>
        ) : (
          notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
            return (
              <ListItemButton 
                key={n._id} 
                onClick={() => handleClick(n)}
                sx={{ 
                  py: 1.8, px: 2, 
                  bgcolor: !n.read ? alpha(cfg.color, 0.03) : 'transparent',
                  borderLeft: `3px solid ${!n.read ? cfg.color : 'transparent'}`,
                  '&:hover': { bgcolor: alpha(theme.palette.divider, 0.04) }
                }}
              >
                <Stack direction="row" spacing={1.8} alignItems="flex-start" sx={{ width: '100%' }}>
                  <Avatar sx={{ 
                    width: 36, height: 36, 
                    bgcolor: alpha(cfg.color, 0.1), 
                    color: cfg.color,
                    fontSize: '1rem'
                  }}>
                    {cfg.icon}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.85rem', lineHeight: 1.3 }}>
                      {n.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 0.3, fontSize: '0.78rem', lineHeight: 1.4 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, mt: 0.8, display: 'block', fontSize: '0.68rem' }}>
                      {formatTime(n.createdAt)}
                    </Typography>
                  </Box>
                  {!n.read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cfg.color, mt: 1 }} />}
                </Stack>
              </ListItemButton>
            );
          })
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 1, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800 }}>
          STEDINOW CRM
        </Typography>
      </Box>
    </Menu>
  );
};

export default AdminNotificationFeed;
