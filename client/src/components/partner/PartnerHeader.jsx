import Stack from "@mui/material/Stack";
import ColorModeIconDropdown from "../../theme/shared/ColorModeIconDropdown";
import Tooltip from "@mui/material/Tooltip";
import MenuButton from "../MenuButton";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import { useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function PartnerHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/partner-portal/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('partner');
      navigate("/partner/login");
    }
  };

  // Generate breadcrumbs from path
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap = {
    'partner': 'Partner Portal',
    'dashboard': 'Dashboard',
    'students': 'My Students',
    'add-student': 'Add Student',
    'profile': 'Profile',
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
      <Breadcrumbs aria-label="breadcrumb">
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return last ? (
            <Typography key={to} color="text.primary" fontWeight={600}>
              {breadcrumbNameMap[value] || value}
            </Typography>
          ) : (
            <Link
              key={to}
              underline="hover"
              color="inherit"
              href={to}
              onClick={(e) => {
                e.preventDefault();
                navigate(to);
              }}
            >
              {breadcrumbNameMap[value] || value}
            </Link>
          );
        })}
      </Breadcrumbs>

      <Stack direction="row" sx={{ gap: 1 }} alignItems="center">
        <ColorModeIconDropdown />
        <Tooltip title="Logout">
          <MenuButton aria-label="logout" onClick={handleLogout}>
            <PowerSettingsNewIcon sx={{ color: "#FF0000" }} />
          </MenuButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
