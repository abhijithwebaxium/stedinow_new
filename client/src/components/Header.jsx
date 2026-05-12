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
import { alpha, useTheme } from "@mui/material/styles";

export default function Header({ onOpenCommandBar }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

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
