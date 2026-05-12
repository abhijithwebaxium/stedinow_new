import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import ContactPhoneRoundedIcon from "@mui/icons-material/ContactPhoneRounded";
import { selectUser } from "../store/slices/userSlice";

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);

  const menuGroups = [
    {
      label: "System",
      items: [
        { text: "Dashboard", icon: <HomeRoundedIcon />, path: "/dashboard" },
      ],
    },
    {
      label: "Academics",
      items: [
        { text: "Leads", icon: <ContactPhoneRoundedIcon />, path: "/leads" },
        { text: "Students", icon: <SchoolRoundedIcon />, path: "/students" },
        { text: "Applications", icon: <AssignmentRoundedIcon />, path: "/applications" },
      ],
    },
    {
      label: "Operations",
      items: [
        { text: "Visa", icon: <FlightTakeoffRoundedIcon />, path: "/visa" },
        { text: "Documents", icon: <DescriptionRoundedIcon />, path: "/documents" },
        { text: "Payments", icon: <PaymentRoundedIcon />, path: "/payments" },
      ],
    },
    {
      label: "Management",
      items: [
        { text: "Partners", icon: <HandshakeRoundedIcon />, path: "/partners" },
        { text: "Reports", icon: <AssessmentRoundedIcon />, path: "/reports" },
        { text: "Users", icon: <PeopleRoundedIcon />, path: "/users" },
      ],
    },
    {
      label: "Miscellaneous",
      items: [
        { text: "Courses", icon: <MenuBookRoundedIcon />, path: "/courses" },
      ],
    },
  ];

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 2, justifyContent: "space-between", gap: 4 }}>
      <Box>
        {menuGroups.map((group, gIndex) => (
          <Box key={gIndex} sx={{ mb: 4 }}>
            <Typography
              variant="caption"
              sx={{
                px: 2,
                mb: 1.5,
                display: 'block',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'text.secondary',
                opacity: 0.5,
                fontSize: '0.6rem'
              }}
            >
              {group.label}
            </Typography>
            <List dense disablePadding>
              {group.items.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem key={index} disablePadding sx={{ display: "block", mb: 0.5 }}>
                    <ListItemButton
                      selected={isActive}
                      onClick={() => handleNavigation(item.path)}
                      sx={(theme) => ({
                        borderRadius: '12px',
                        py: 1,
                        px: 2,
                        position: 'relative',
                        '&.Mui-selected': {
                          bgcolor: '#101935 !important', // Deep Navy
                          color: '#ffffff !important',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '20%',
                            height: '60%',
                            width: '4px',
                            borderRadius: '0 4px 4px 0',
                            bgcolor: '#3b82f6', // Bright blue indicator
                            opacity: 1,
                          },
                          '&:hover': {
                            bgcolor: '#1e293b !important',
                          },
                          '& .MuiListItemIcon-root': {
                            color: '#ffffff !important',
                          },
                          '& .MuiListItemText-primary': {
                            color: '#ffffff !important',
                          }
                        },
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      })}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: isActive ? '#ffffff' : 'text.secondary' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.85rem',
                          fontWeight: isActive ? 800 : 600,
                          letterSpacing: -0.2,
                          color: isActive ? '#ffffff' : 'inherit',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
