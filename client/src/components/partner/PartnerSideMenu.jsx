import { styled } from "@mui/material/styles";
import { useColorScheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState, useEffect } from "react";
import PartnerMenuContent from "./PartnerMenuContent";
import PartnerOptionsMenu from "./PartnerOptionsMenu";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function PartnerSideMenu() {
  const { mode, systemMode } = useColorScheme();
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    const partnerData = localStorage.getItem('partner');
    if (partnerData) {
      setPartner(JSON.parse(partnerData));
    }
  }, []);

  const resolvedMode = (mode === 'system' ? systemMode : mode) || 'light';

  const getInitials = (name) => {
    if (!name) return "P";
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  };

  const displayName = partner?.companyName || "Partner";
  const displayEmail = partner?.email || "partner@email.com";

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
          justifyContent: "center",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <img
            src="/StediNow-Logo.png"
            alt="Stedinow Logo"
            style={{
              maxWidth: "100%",
              height: "auto",
              maxHeight: "50px",
            }}
          />
          <Typography variant="caption" color="primary" fontWeight={600} display="block" sx={{ mt: 0.5 }}>
            Partner Portal
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PartnerMenuContent />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: "center",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Avatar
          sizes="small"
          alt={displayName}
          sx={{ width: 36, height: 36, bgcolor: "success.main" }}
        >
          {getInitials(displayName)}
        </Avatar>
        <Box sx={{ mr: "auto", minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              lineHeight: "16px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
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
            }}
          >
            {displayEmail}
          </Typography>
        </Box>
        <PartnerOptionsMenu />
      </Stack>
    </Drawer>
  );
}
