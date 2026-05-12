import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import SideMenu from "../components/SideMenu";
import AppNavbar from "../components/AppNavbar";
import Header from "../components/Header";
import { Stack, alpha } from "@mui/material";
import AIAssistant from "../components/AIAssistant";
import CommandBar from "../components/CommandBar";
import { useState, useEffect } from "react";

const RootLayout = () => {
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandBarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      <SideMenu />
      <AppNavbar />
      {/* Main content */}
      <Box
        component="main"
        sx={(theme) => ({
          flex: "1 1 0",
          width: 0,
          height: "100vh",
          scrollBehavior: "smooth",
          backgroundColor: theme.palette.mode === 'dark' ? '#0A0A0B' : '#F8F9FB',
          backgroundImage: theme.palette.mode === 'dark' 
            ? `radial-gradient(at 0% 0%, ${alpha(theme.palette.primary.main, 0.05)} 0, transparent 50%), 
               radial-gradient(at 50% 0%, ${alpha(theme.palette.secondary.main, 0.05)} 0, transparent 50%)`
            : `radial-gradient(at 0% 0%, ${alpha(theme.palette.primary.main, 0.03)} 0, transparent 50%), 
               radial-gradient(at 50% 0%, ${alpha(theme.palette.secondary.main, 0.03)} 0, transparent 50%)`,
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
          <Header onOpenCommandBar={() => setCommandBarOpen(true)} />
          <Outlet />
        </Stack>
        <AIAssistant />
        <CommandBar 
          open={commandBarOpen} 
          onClose={() => setCommandBarOpen(false)} 
        />
      </Box>
    </Box>
  );
};

export default RootLayout;
