import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { GlassCard as SharedGlassCard } from '../components/styled';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { selectUser } from "../store/slices/userSlice";
import { brand, gray } from "../theme/shared/themePrimitives";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// GlassCard is now imported from ../components/styled
const GlassCard = styled(SharedGlassCard)(({ theme }) => ({
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: 'relative',
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.palette.mode === 'dark'
      ? `0 20px 60px ${alpha('#000', 0.6)}`
      : `0 20px 60px ${alpha(gray[400], 0.08)}`,
    borderColor: alpha(brand[400], 0.3),
  },
}));


const StatIconBox = styled(Box)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`,
  color: color,
  border: `1px solid ${alpha(color, 0.2)}`,
  borderRadius: '20px',
  width: 56,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 8px 24px ${alpha(color, 0.12)}`,
}));

const CardRibbon = styled(Box)(({ theme, color }) => ({
  marginTop: 'auto',
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${alpha(gray[400], 0.1)}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  '&::before': {
    content: '""',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color,
    boxShadow: `0 0 10px ${color}`,
  }
}));

function Dashboard() {
  const user = useSelector(selectUser);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeApplications: 0,
    visaApproved: 0,
    conversionRate: 0,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const studentsRes = await axios.get(`${API_URL}/api/students`, {
        withCredentials: true,
      });

      if (studentsRes.data.status === "success") {
        const students = studentsRes.data.students || [];

        // Calculate stats
        const totalStudents = students.length;
        const activeApplications = students.filter(
          (s) =>
            s.currentPhase === "Student Onboarding" ||
            s.currentPhase === "Visa Preparation",
        ).length;
        const visaApproved = students.filter(
          (s) => s.currentStatus === "Visa Approved",
        ).length;
        const leads = students.filter(
          (s) => s.currentPhase === "Lead Acquisition",
        ).length;
        const converted = students.filter(
          (s) => s.currentStatus === "Converted",
        ).length;
        const conversionRate =
          leads > 0 ? Math.round((converted / leads) * 100) : 0;

        setStats({
          totalStudents,
          activeApplications,
          visaApproved,
          conversionRate,
        });

        // Get recent 5 students
        const recent = students
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentStudents(recent);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const PHASE_COLORS = {
    "Lead Acquisition": "#FF4D4F",
    "Student Onboarding": "#1890FF",
    "Visa Preparation": "#722ED1",
    "Post-Arrival Support": "#52C41A",
  };

  const getStatusColor = (status) => {
    const statusColors = {
      Converted: "success",
      "Visa Approved": "success",
      "New Inquiry": "info",
      "Assessment Pending": "warning",
      "Application on Progress": "primary",
      "Registration Complete": "success",
    };
    return statusColors[status] || "default";
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {loading && <LinearProgress sx={{ mb: 4, borderRadius: 2, height: 6, bgcolor: alpha(brand[400], 0.05) }} />}

      {/* Stats Cards - SkillCity Style */}
      <Box sx={{ mb: 8 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <GlassCard>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>TOTAL STUDENTS</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, mt: 0.5, letterSpacing: -1 }}>{stats.totalStudents}</Typography>
                  </Box>
                  <StatIconBox color={brand[400]}>
                    <GroupIcon />
                  </StatIconBox>
                </Box>
                <CardRibbon color={brand[400]}>
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', tracking: 1.5, opacity: 0.6 }}>Active Registry</Typography>
                </CardRibbon>
              </CardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GlassCard>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>NEW APPLICATIONS</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, mt: 0.5, letterSpacing: -1 }}>{stats.activeApplications}</Typography>
                  </Box>
                  <StatIconBox color="#3B82F6">
                    <AssignmentIcon />
                  </StatIconBox>
                </Box>
                <CardRibbon color="#3B82F6">
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', tracking: 1.5, opacity: 0.6 }}>Review Queue</Typography>
                </CardRibbon>
              </CardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GlassCard>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>VISA APPROVED</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, mt: 0.5, letterSpacing: -1 }}>{stats.visaApproved}</Typography>
                  </Box>
                  <StatIconBox color="#10B981">
                    <CheckCircleIcon />
                  </StatIconBox>
                </Box>
                <CardRibbon color="#10B981">
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', tracking: 1.5, opacity: 0.6 }}>Success Metrics</Typography>
                </CardRibbon>
              </CardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <GlassCard>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>CONVERSION RATE</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 900, mt: 0.5, letterSpacing: -1 }}>{stats.conversionRate}%</Typography>
                  </Box>
                  <StatIconBox color="#F43F5E">
                    <TrendingUpIcon />
                  </StatIconBox>
                </Box>
                <CardRibbon color="#F43F5E">
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', tracking: 1.5, opacity: 0.6 }}>Growth Index</Typography>
                </CardRibbon>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Students Table */}
      <Box sx={{ overflow: "hidden", width: "100%" }}>
        <GlassCard>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                  Recent Registrations
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Eligibility review queue for new students
                </Typography>
              </Box>
              <button
                onClick={() => navigate("/applications")}
                className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-sm font-black uppercase tracking-widest"
              >
                View All Queue
              </button>
            </Box>

            <TableContainer sx={{ borderRadius: "24px", overflow: 'hidden', border: `1px solid ${alpha(gray[300], 0.1)}` }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(gray[100], 0.5) }}>
                    <TableCell sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '0.65rem', py: 3, tracking: 2, textTransform: 'uppercase' }}>Identity</TableCell>
                    {!isMobile && <TableCell sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '0.65rem', py: 3, tracking: 2, textTransform: 'uppercase' }}>Contact</TableCell>}
                    <TableCell sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '0.65rem', py: 3, tracking: 2, textTransform: 'uppercase' }}>Phase</TableCell>
                    {!isTablet && <TableCell sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '0.65rem', py: 3, tracking: 2, textTransform: 'uppercase' }}>Status</TableCell>}
                    {!isMobile && <TableCell align="right" sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '0.65rem', py: 3, tracking: 2, textTransform: 'uppercase' }}>Date</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentStudents.length > 0 ? (
                    recentStudents.map((student) => (
                      <TableRow 
                        key={student._id} 
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'background-color 0.2s ease' }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                            <Avatar sx={{ 
                              width: 44, 
                              height: 44, 
                              bgcolor: alpha(brand[400], 0.1), 
                              color: brand[500], 
                              fontWeight: 900,
                              borderRadius: '14px',
                              fontSize: '1rem'
                            }}>
                              {student.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>{student.name}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ID: #{student.studentId}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>{student.email}</Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>{student.phoneCode} {student.phone}</Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: PHASE_COLORS[student.currentPhase] || "#94a3b8", boxShadow: `0 0 8px ${PHASE_COLORS[student.currentPhase] || "#94a3b8"}` }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', tracking: 1 }}>{student.currentPhase}</Typography>
                          </Box>
                        </TableCell>
                        {!isTablet && (
                          <TableCell>
                            <Chip
                              label={student.currentStatus}
                              size="small"
                              variant="outlined"
                              sx={{
                                color: `${getStatusColor(student.currentStatus)}.main`,
                                borderColor: alpha(theme.palette[getStatusColor(student.currentStatus)]?.main || "#94a3b8", 0.3),
                                fontWeight: 900,
                                fontSize: "0.6rem",
                                borderRadius: '10px',
                                tracking: 1
                              }}
                            />
                          </TableCell>
                        )}
                        {!isMobile && (
                          <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 700, fontSize: '0.8rem' }}>
                            {new Date(student.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 12 }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>No active registrations found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </CardContent>
          </GlassCard>
      </Box>
    </Box>
  );
}

export default Dashboard;
