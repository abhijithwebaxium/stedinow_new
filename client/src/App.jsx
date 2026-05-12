import { CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { useEffect } from "react";
import Login from "./pages/Login";
import PartnerLogin from "./pages/PartnerLogin";
import PartnerDashboardNew from "./pages/partner/PartnerDashboardNew";
import PartnerAddStudent from "./pages/partner/PartnerAddStudent";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Leads from "./pages/Leads";
import StudentProfile from "./pages/StudentProfile";
import Applications from "./pages/Applications";
import Visa from "./pages/Visa";
import Documents from "./pages/Documents";
import Payments from "./pages/Payments";
import Users from "./pages/Users";
import Partners from "./pages/Partners";
import Reports from "./pages/Reports";
import Courses from "./pages/Courses";
import Marketplace from "./pages/Marketplace";
import RootLayout from "./layout/RootLayout";
import PartnerLayout from "./layout/PartnerLayout";
import store from "./store";
import { loadUserFromStorage } from "./store/slices/userSlice";
import {
  chartsCustomizations,
  dataGridCustomizations,
} from "./theme/customizations";
import AppTheme from "./theme/shared/AppTheme";
import "./App.css";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
};

// Component to initialize Redux on mount
function AppInitializer({ children }) {
  useEffect(() => {
    // Load user from localStorage on app start
    store.dispatch(loadUserFromStorage());
  }, []);

  return children;
}

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App(props) {
  return (
    <Provider store={store}>
      <AppTheme {...props} themeComponents={xThemeComponents}>
        <CssBaseline enableColorScheme />
        <AppInitializer>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/partner/login" element={<PartnerLogin />} />

              {/* Partner Portal Routes */}
              <Route path="/partner" element={<PartnerLayout />}>
                <Route path="dashboard" element={<PartnerDashboardNew />} />
                <Route path="add-student" element={<PartnerAddStudent />} />
              </Route>

              {/* Admin Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <RootLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/students" element={<Students />} />
                <Route path="/students/:id" element={<StudentProfile />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/visa" element={<Visa />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<Users />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/marketplace" element={<Marketplace />} />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AppInitializer>
      </AppTheme>
    </Provider>
  );
}

export default App;
