import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import NavbarBreadcrumbs from "./NavbarBreadcrumbs";
import ColorModeIconDropdown from "../theme/shared/ColorModeIconDropdown";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { logout } from "../store/slices/userSlice";
import api from "../utils/api";
import Tooltip from "@mui/material/Tooltip";
import MenuButton from "./MenuButton";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Badge from "@mui/material/Badge";
import ChatIcon from "@mui/icons-material/Chat";
import NotificationIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import { initiateSocketConnection, disconnectSocket, joinAdminRoom } from "../utils/socket";
import AdminNotificationFeed from "./AdminNotificationFeed";

export default function Header({ onOpenCommandBar, onOpenMessageCenter }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/api/students/messages/all");
      if (res.data.status === 'success') {
        const totalUnread = res.data.chats.reduce((acc, chat) => acc + (chat.unreadCount > 0 ? 1 : 0), 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error("Failed to fetch unread messages count:", error);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      if (res.data.status === 'success') {
        const count = res.data.notifications.filter(n => !n.read).length;
        setUnreadNotifications(count);
      }
    } catch (error) {
      console.error("Failed to fetch unread notifications count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadNotifications();
    
    // Real-time updates via Socket
    const socket = initiateSocketConnection();
    joinAdminRoom();

    socket.on('new_message', (msg) => {
      if (msg.sender === 'student') {
        fetchUnreadCount();
      }
    });

    socket.on('messages_read', () => {
      fetchUnreadCount();
    });

    socket.on('new_admin_notification', () => {
      fetchUnreadNotifications();
    });

    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchUnreadNotifications();
    }, 60000);

    return () => {
      clearInterval(interval);
      disconnectSocket();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/v2/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: "none", md: "flex" },
        width: "100%",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        pt: 1.5,
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction="row" sx={{ gap: 2 }} alignItems="center">
        {/* Command Trigger */}
        <ButtonBase
          onClick={onOpenCommandBar}
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1,
            borderRadius: '12px',
            bgcolor: alpha(theme.palette.divider, 0.05),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.divider, 0.1),
              borderColor: alpha(theme.palette.primary.main, 0.3),
            }
          }}
        >
          <SearchRoundedIcon sx={{ fontSize: '1.2rem', color: 'text.secondary', opacity: 0.7 }} />
          <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 600 }}>
            Search or command...
          </Typography>
          <Box sx={{ 
            px: 0.8, 
            py: 0.2, 
            bgcolor: alpha(theme.palette.divider, 0.1), 
            borderRadius: '6px',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
          }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: 'text.secondary' }}>⌘K</Typography>
          </Box>
        </ButtonBase>

        <ColorModeIconDropdown />

        <Tooltip title="Messages">
          <MenuButton 
            aria-label="messages" 
            onClick={onOpenMessageCenter}
            sx={{
              color: unreadCount > 0 ? 'primary.main' : 'inherit'
            }}
          >
            <Badge 
              badgeContent={unreadCount} 
              color="error"
              sx={{ '& .MuiBadge-badge': { fontWeight: 900 } }}
            >
              <ChatIcon />
            </Badge>
          </MenuButton>
        </Tooltip>

        <Tooltip title="Notifications">
          <MenuButton 
            aria-label="notifications" 
            onClick={(e) => setNotifAnchor(e.currentTarget)}
            sx={{
              color: unreadNotifications > 0 ? 'primary.main' : 'inherit'
            }}
          >
            <Badge 
              badgeContent={unreadNotifications} 
              color="error"
              sx={{ '& .MuiBadge-badge': { fontWeight: 900 } }}
            >
              <NotificationIcon />
            </Badge>
          </MenuButton>
        </Tooltip>

        <AdminNotificationFeed 
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => {
            setNotifAnchor(null);
            fetchUnreadNotifications();
          }}
        />

        <Tooltip title="Logout">
          <MenuButton 
            aria-label="logout" 
            onClick={handleLogout}
            sx={{
              '&:hover': {
                color: '#FF0000',
                bgcolor: alpha('#FF0000', 0.1)
              }
            }}
          >
            <PowerSettingsNewIcon />
          </MenuButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
