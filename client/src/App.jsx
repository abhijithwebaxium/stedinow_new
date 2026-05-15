import { CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { SnackbarProvider } from "notistack";
import ErrorBoundary from "./components/ErrorBoundary";
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
import StudentLayout from "./layout/StudentLayout";
import StudentLogin from "./pages/student/StudentLogin";
import StudentSetPassword from "./pages/student/StudentSetPassword";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfilePage from "./pages/student/StudentProfile";
import StudentApplications from "./pages/student/StudentApplications";
import StudentDocumentsPage from "./pages/student/StudentDocumentsPage";
import StudentMessages from "./pages/student/StudentMessages";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentVisaTracker from "./pages/student/StudentVisaTracker";
import StudentTaskBoard from "./pages/student/StudentTaskBoard";
import StudentEligibility from "./pages/student/StudentEligibility";
import StudentDiscovery from "./pages/student/StudentDiscovery";
import StudentFinance from "./pages/student/StudentFinance";
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
function ProtectedRoute({ children, type = 'admin' }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to={type === 'student' ? "/student/login" : "/login"} replace />;
  }

  // If student tries to access admin routes or vice versa
  if (type === 'admin' && user.type === 'student') return <Navigate to="/student/dashboard" replace />;
  if (type === 'student' && user.type !== 'student') return <Navigate to="/dashboard" replace />;

  return children;
}

function App(props) {
  return (
    <Provider store={store}>
      <AppTheme {...props} themeComponents={xThemeComponents}>
        <CssBaseline enableColorScheme />
        <SnackbarProvider maxSnack={4} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} autoHideDuration={3500}>
        <ErrorBoundary>
        <AppInitializer>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/partner/login" element={<PartnerLogin />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/set-password" element={<StudentSetPassword />} />

              {/* Student Portal Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute type="student">
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfilePage />} />
                <Route path="documents" element={<StudentDocumentsPage />} />
                <Route path="applications" element={<StudentApplications />} />
                <Route path="messages" element={<StudentMessages />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="visa" element={<StudentVisaTracker />} />
                <Route path="tasks" element={<StudentTaskBoard />} />
                <Route path="eligibility" element={<StudentEligibility />} />
                <Route path="discovery" element={<StudentDiscovery />} />
                <Route path="finance" element={<StudentFinance />} />
              </Route>
              <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />

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
        </ErrorBoundary>
        </SnackbarProvider>
      </AppTheme>
    </Provider>
  );
}

export default App;
