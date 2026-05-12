import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import PartnerSideMenu from "../components/partner/PartnerSideMenu";
import PartnerNavbar from "../components/partner/PartnerNavbar";
import PartnerHeader from "../components/partner/PartnerHeader";
import { Stack, alpha } from "@mui/material";

const PartnerLayout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      <PartnerSideMenu />
      <PartnerNavbar />
      {/* Main content */}
      <Box
        component="main"
        sx={(theme) => ({
          flex: "1 1 0",
          width: 0,
          height: "100vh",
          scrollBehavior: "smooth",
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
            : alpha(theme.palette.background.default, 1),
          overflowY: "auto",
          overflowX: "hidden",
        })}
      >
        <Stack
          spacing={2}
          sx={{
            pb: 5,
            px: { xs: 1, md: 1.5 },
            pt: { xs: 8, md: 2 },
            mb: "52px",
          }}
        >
          <PartnerHeader />
          <Outlet />
        </Stack>
      </Box>
    </Box>
  );
};

export default PartnerLayout;
