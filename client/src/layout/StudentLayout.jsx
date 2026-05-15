import {
  Box, Stack, alpha, useTheme, Typography, Avatar, IconButton,
  Badge, Drawer, useMediaQuery,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  DashboardOutlined as DashboardIcon,
  PersonOutline as ProfileIcon,
  DescriptionOutlined as DocumentsIcon,
  SchoolOutlined as ApplicationsIcon,
  LogoutOutlined as LogoutIcon,
  NotificationsNoneOutlined as NotificationIcon,
  ChatBubbleOutline as MessageIcon,
  FlightTakeoff as VisaIcon,
  ChecklistOutlined as TasksIcon,
  InsightsOutlined as EligibilityIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ExploreOutlined as DiscoveryIcon,
  AccountBalanceWalletOutlined as FinanceIcon
} from "@mui/icons-material";
import StudentAIChat from "../components/StudentAIChat";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { initiateSocketConnection, disconnectSocket, joinStudentRoom } from "../utils/socket";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const NAV_ITEMS = [
  { text: "Overview", icon: <DashboardIcon />, path: "/student/dashboard" },
  { text: "Discovery", icon: <DiscoveryIcon />, path: "/student/discovery" },
  { text: "Eligibility", icon: <EligibilityIcon />, path: "/student/eligibility" },
  { text: "My Profile", icon: <ProfileIcon />, path: "/student/profile" },
  { text: "Documents", icon: <DocumentsIcon />, path: "/student/documents" },
  { text: "Finance", icon: <FinanceIcon />, path: "/student/finance" },
  { text: "Applications", icon: <ApplicationsIcon />, path: "/student/applications" },
  { text: "Visa Tracker", icon: <VisaIcon />, path: "/student/visa" },
  { text: "My Tasks", icon: <TasksIcon />, path: "/student/tasks" },
  { text: "Messages", icon: <MessageIcon />, path: "/student/messages" },
];

const SidebarContent = ({ onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'S';

  const handleNav = (path) => { navigate(path); onClose?.(); };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/student/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6, px: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', fontFamily: '"Outfit", sans-serif' }}>
          Stedi<Box component="span" sx={{ color: '#3B82F6' }}>Now</Box>
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Stack spacing={0.5} sx={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Box
              key={item.text}
              onClick={() => handleNav(item.path)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                p: 1.5, borderRadius: '14px', cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: active ? alpha('#3B82F6', 0.08) : 'transparent',
                color: active ? '#3B82F6' : '#64748b',
                '&:hover': {
                  bgcolor: active ? alpha('#3B82F6', 0.1) : alpha(theme.palette.divider, 0.04),
                  transform: 'translateX(3px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', color: active ? '#3B82F6' : '#94a3b8', '& svg': { fontSize: 22 } }}>
                {item.icon}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: active ? 800 : 600, fontSize: '0.875rem' }}>
                {item.text}
              </Typography>
              {active && <Box sx={{ ml: 'auto', width: 6, height: 6, borderRadius: '50%', bgcolor: '#3B82F6' }} />}
            </Box>
          );
        })}
      </Stack>

      <Box sx={{ p: 2, borderRadius: '20px', bgcolor: alpha('#3B82F6', 0.05), border: `1px solid ${alpha('#3B82F6', 0.1)}` }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: '#3B82F6', fontWeight: 800, width: 36, height: 36, fontSize: '0.9rem' }}>{userInitial}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name || 'Student'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.68rem' }}>Student Portal</Typography>
          </Box>
          <IconButton size="small" sx={{ color: '#EF4444', p: 0.5 }} onClick={handleLogout}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};

const StudentLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const pollRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/student-portal/me`, { withCredentials: true });
      if (res.data.status === 'success') {
        setStudent(res.data.student);
        const unread = (res.data.student?.notifications || []).filter(n => !n.read).length;
        setUnreadNotifs(unread);
      }
    } catch (err) { console.error("Profile fetch failed", err); }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/student-portal/documents`, { withCredentials: true });
      if (res.data.status === 'success') setDocuments(res.data.documents);
    } catch (err) { console.error("Documents fetch failed", err); }
  }, []);

  const fetchUnreadMessages = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/student-portal/messages/unread-count`, { withCredentials: true });
      if (res.data.status === 'success') setUnreadMessages(res.data.count);
    } catch (err) { console.error("Unread messages fetch failed", err); }
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchProfile();
        fetchUnreadMessages();
      }
    }, 30000);
  }, [fetchProfile, fetchUnreadMessages]);

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
    fetchUnreadMessages();
    startPolling();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      const socket = initiateSocketConnection();
      joinStudentRoom(user.id);

      socket.on('new_message', (msg) => {
        if (msg.sender === 'counselor') {
          setUnreadMessages(prev => prev + 1);
        }
      });

      socket.on('messages_read', () => {
        setUnreadMessages(0);
      });

      socket.on('new_notification', () => {
        setUnreadNotifs(prev => prev + 1);
      });

      socket.on('new_task', (data) => {
        const title = data?.task?.title || 'a new task';
        enqueueSnackbar(`Your counselor assigned you: "${title}"`, { variant: 'info' });
      });
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchProfile();
        fetchUnreadMessages();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      disconnectSocket();
    };
  }, [fetchProfile, fetchDocuments, fetchUnreadMessages, startPolling]);

  const sidebarWidth = 260;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box sx={{
          width: sidebarWidth, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
          bgcolor: 'white', borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}>
          <SidebarContent />
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: 280, bgcolor: 'white' } }}
        >
          <SidebarContent onClose={() => setDrawerOpen(false)} />
        </Drawer>
      )}

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Top Bar */}
        <Box sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 }, pb: 0,
        }}>
          {isMobile && (
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <MenuIcon sx={{ color: '#64748b' }} />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => navigate('/student/messages')}
              sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
            >
              <Badge badgeContent={unreadMessages || undefined} color="error">
                <MessageIcon sx={{ color: '#64748b', fontSize: 20 }} />
              </Badge>
            </IconButton>
            <IconButton
              onClick={() => navigate('/student/notifications')}
              sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
            >
              <Badge badgeContent={unreadNotifs || undefined} color="error">
                <NotificationIcon sx={{ color: '#64748b', fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Stack>
        </Box>

        <Box sx={{ 
          px: { xs: 2, md: 4 }, 
          pb: { xs: 2, md: 4 },
          pt: { xs: 2, md: 2.5 },
          width: '100%'
        }}>
          <Outlet context={{ student, fetchProfile, documents, fetchDocuments }} />
        </Box>
      </Box>

      <StudentAIChat student={student} onUpdate={fetchProfile} />
    </Box>
  );
};

export default StudentLayout;
