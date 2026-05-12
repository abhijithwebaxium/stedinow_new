import { styled } from "@mui/material/styles";
import { useColorScheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import OptionsMenu from "./OptionsMenu";
import { selectUser } from "../store/slices/userSlice";
import { alpha, useTheme } from "@mui/material/styles";

const OptionsBtn = ({ onLogout }) => {
  return <OptionsMenu />;
};

const drawerWidth = 260;

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.background.paper, 0.8) 
      : alpha('#FFFFFF', 0.8),
    backdropFilter: "blur(24px) saturate(180%)",
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
      : `linear-gradient(180deg, rgba(255,255,255,0) 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  },
}));

export default function SideMenu() {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const user = useSelector(selectUser);

  // Determine the actual mode being used (system preference or user selection)
  const resolvedMode = (mode === 'system' ? systemMode : mode) || 'light';

  // Get user initials for avatar
  const getInitials = (fullName) => {
    if (!fullName) return "U";
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  };

  // Backward compatibility for user display
  const displayName = user?.fullName
    || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null)
    || user?.firstName
    || user?.name
    || "User";
  const displayEmail = user?.email || "user@email.com";

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          mt: "calc(var(--template-frame-height, 0px) + 8px)",
          p: 3,
        }}
      >
        <img
          src="/StediNow-Logo.png"
          alt="Stedinow Logo"
          style={{
            height: "42px",
            width: "auto",
            filter: resolvedMode === 'dark' ? 'brightness(1.2)' : 'none'
          }}
        />
      </Box>
      <Divider sx={{ opacity: 0.05, mx: 2 }} />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent />
        {/* <CardAlert /> */}
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2.5,
          gap: 2,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.05),
          bgcolor: alpha(theme.palette.background.paper, 0.4)
        }}
      >
        <Avatar
          alt={displayName}
          sx={{ 
            width: 44, 
            height: 44, 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            fontWeight: 900,
            borderRadius: '14px',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          {getInitials(user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim())}
        </Avatar>
        <Box sx={{ mr: "auto", minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 900,
              lineHeight: "1.2",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: 'text.primary',
              letterSpacing: -0.2
            }}
          >
            {displayName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
              fontWeight: 600,
              opacity: 0.7
            }}
          >
            {displayEmail}
          </Typography>
        </Box>
        <OptionsBtn onLogout={() => {}} />
      </Stack>
    </Drawer>
  );
}
