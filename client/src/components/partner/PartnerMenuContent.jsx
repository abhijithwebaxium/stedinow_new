import { useNavigate, useLocation } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";

const menuItems = [
  {
    text: "Dashboard",
    icon: <HomeRoundedIcon />,
    path: "/partner/dashboard",
  },
  {
    text: "My Students",
    icon: <SchoolRoundedIcon />,
    path: "/partner/students",
  },
  {
    text: "Add Student",
    icon: <PersonAddRoundedIcon />,
    path: "/partner/add-student",
  },
];

export default function PartnerMenuContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
