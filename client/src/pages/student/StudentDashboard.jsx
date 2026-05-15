import { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Grid, Paper, alpha, useTheme, LinearProgress,
  Stack, Chip, Avatar, Skeleton, Button, Stepper, Step, StepLabel,
} from "@mui/material";
import {
  RocketLaunchOutlined as RocketIcon,
  DescriptionOutlined as DocIcon,
  SchoolOutlined as ApplicationsIcon,
  AccountCircleOutlined as ProfileIcon,
  TrendingUp as PhaseIcon,
  ArrowForwardIos as ArrowIcon,
  TipsAndUpdates as InsightIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PHASE_COLORS = {
  "Lead Acquisition": "#F59E0B",
  "Student Onboarding": "#3B82F6",
  "Visa Preparation": "#8B5CF6",
  "Post-Arrival Support": "#10B981",
};

const COUNTRY_FLAGS = {
  UK: '🇬🇧', Canada: '🇨🇦', Australia: '🇦🇺', USA: '🇺🇸',
  Ireland: '🇮🇪', Germany: '🇩🇪', 'New Zealand': '🇳🇿', Singapore: '🇸🇬', Netherlands: '🇳🇱',
};

const INTAKE_MONTHS = {
  UK:            [{ month: 9, label: 'September Intake' }, { month: 1, label: 'January Intake' }],
  Canada:        [{ month: 9, label: 'Fall Intake' }, { month: 1, label: 'Winter Intake' }, { month: 5, label: 'Summer Intake' }],
  Australia:     [{ month: 2, label: 'February Intake' }, { month: 7, label: 'July Intake' }],
  USA:           [{ month: 9, label: 'Fall Semester' }, { month: 1, label: 'Spring Semester' }],
  Ireland:       [{ month: 9, label: 'September Intake' }, { month: 1, label: 'January Intake' }],
  Germany:       [{ month: 10, label: 'Winter Semester' }, { month: 4, label: 'Summer Semester' }],
  'New Zealand': [{ month: 2, label: 'Feb Intake' }, { month: 7, label: 'July Intake' }],
  Singapore:     [{ month: 8, label: 'August Intake' }, { month: 1, label: 'January Intake' }],
  Netherlands:   [{ month: 9, label: 'September Intake' }, { month: 2, label: 'February Intake' }],
};

const getNextIntakes = (targetCountries) => {
  const now = new Date();
  const countries = targetCountries?.length > 0 ? targetCountries : ['UK', 'Canada', 'Australia', 'USA'];
  const seen = new Set();
  const intakes = [];

  countries.forEach(country => {
    const months = INTAKE_MONTHS[country];
    if (!months) return;
    months.forEach(({ month, label }) => {
      let d = new Date(now.getFullYear(), month - 1, 1);
      if (d <= now) d = new Date(now.getFullYear() + 1, month - 1, 1);
      const daysLeft = Math.ceil((d - now) / 86400000);
      const key = `${country}-${month}`;
      if (!seen.has(key)) { seen.add(key); intakes.push({ country, label, daysLeft }); }
    });
  });

  return intakes.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4);
};

const generateInsight = (student, documents, applications) => {
  if (!student) return null;
  const docTypes = (documents || []).map(d => d.documentType);
  const activeApps = (applications || []).filter(a => !['Rejected', 'Withdrawn'].includes(a.status));

  if (activeApps.length > 0 && !docTypes.includes('Passport')) {
    const target = activeApps.length > 1
      ? `${activeApps.length} active applications`
      : (activeApps[0].university?.name || 'your active application');
    return { color: '#EF4444', text: `Passport copy is missing — it's blocking ${target}. Upload it now to keep things moving.`, action: { label: 'Upload now', path: '/student/documents' } };
  }
  if (!student.academics?.ielts?.overallScore && !student.academics?.toefl?.overallScore && !student.academics?.pte?.overallScore) {
    return { color: '#F59E0B', text: "No English test score on file. IELTS, TOEFL, or PTE is required by almost every university — add yours in Education.", action: { label: 'Add score', path: '/student/profile', tab: 1 } };
  }
  if (!student.academics?.twelfth?.percentage) {
    return { color: '#3B82F6', text: "Your 12th grade results aren't in your profile. Universities use them for shortlisting — adding them improves your eligibility score.", action: { label: 'Add now', path: '/student/profile', tab: 1 } };
  }
  if (!student.personalInfo?.passportNumber) {
    return { color: '#8B5CF6', text: "Your passport number is missing from your profile — it's required on all university and visa application forms.", action: { label: 'Update profile', path: '/student/profile', tab: 0 } };
  }
  if (!student.preferences?.targetCountries?.length) {
    return { color: '#10B981', text: "Set your target countries to get a personalised eligibility score and better university recommendations tailored to you.", action: { label: 'Set now', path: '/student/profile', tab: 2 } };
  }
  const firstName = student.name?.split(' ')[0] || 'there';
  return { color: '#3B82F6', text: `Your profile is looking strong, ${firstName}! Check the Eligibility Meter to see exactly how you match up for your target universities.`, action: { label: 'Check eligibility', path: '/student/eligibility' } };
};

const StatCard = ({ title, value, icon, color, progress, subtitle }) => {
  const theme = useTheme();
  return (
    <Paper sx={{
      p: 3, borderRadius: '24px', bgcolor: 'white',
      border: `1px solid ${alpha(theme.palette.divider, 0.07)}`,
      height: '100%', display: 'flex', flexDirection: 'column',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: alpha(color, 0.1), color }}>
          {icon}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b' }}>{value}</Typography>
      </Stack>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b', mb: subtitle ? 0.5 : 0 }}>{title}</Typography>
      {subtitle && <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>{subtitle}</Typography>}
      {progress !== undefined && (
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color }}>Completion</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b' }}>{progress}%</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6, borderRadius: 3,
              bgcolor: alpha(color, 0.1),
              '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

const DashboardSkeleton = () => (
  <Box>
    <Skeleton variant="text" width={280} height={52} sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width={380} height={28} sx={{ mb: 2 }} />
    <Skeleton variant="rounded" height={62} sx={{ borderRadius: '20px', mb: 4 }} />
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3].map(i => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Skeleton variant="rounded" height={140} sx={{ borderRadius: '24px' }} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={4} sx={{ mb: 4 }}>
      <Grid item xs={12} md={7}>
        <Skeleton variant="text" width={160} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={240} sx={{ borderRadius: '28px' }} />
      </Grid>
      <Grid item xs={12} md={5}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Stack spacing={1.5}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: '14px' }} />
          ))}
        </Stack>
      </Grid>
    </Grid>
    <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
    <Grid container spacing={2}>
      {[1, 2, 3, 4].map(i => (
        <Grid item xs={6} sm={3} key={i}>
          <Skeleton variant="rounded" height={130} sx={{ borderRadius: '20px' }} />
        </Grid>
      ))}
    </Grid>
  </Box>
);

const StudentDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { student, documents } = useOutletContext();
  const [applications, setApplications] = useState([]);
  const firstName = student?.name ? student.name.split(' ')[0] : 'Student';

  useEffect(() => {
    axios.get(`${API_URL}/api/student-portal/applications`, { withCredentials: true })
      .then(res => { if (res.data.status === 'success') setApplications(res.data.applications); })
      .catch(() => {});
  }, []);

  const profileStrength = useMemo(() => {
    if (!student) return 0;
    const checks = [
      !!student.name,
      !!student.phone,
      !!student.personalInfo?.dob,
      !!student.personalInfo?.nationality,
      !!student.personalInfo?.passportNumber,
      !!student.personalInfo?.gender,
      !!student.personalInfo?.currentAddress?.city,
      !!student.academics?.tenth?.percentage,
      !!student.academics?.twelfth?.percentage,
      !!(student.academics?.ielts?.overallScore || student.academics?.toefl?.overallScore),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [student]);

  const docCount = documents?.length || 0;
  const phaseColor = PHASE_COLORS[student?.currentPhase] || '#64748b';
  const insight = useMemo(() => generateInsight(student, documents, applications), [student, documents, applications]);
  const nextIntakes = useMemo(() => getNextIntakes(student?.preferences?.targetCountries), [student]);

  if (!student) return <DashboardSkeleton />;

  const showOnboarding = profileStrength < 100 || docCount < 3;
  const onboardingSteps = [
    { label: 'Basic Info', done: !!student.personalInfo?.dob, path: '/student/profile' },
    { label: 'Academics', done: !!student.academics?.tenth?.percentage, path: '/student/profile', tab: 1 },
    { label: 'Documents', done: docCount >= 3, path: '/student/documents' },
    { label: 'Discovery', done: student.preferences?.targetCountries?.length > 0, path: '/student/discovery' },
  ];
  const activeStep = onboardingSteps.findIndex(s => !s.done);

  const CHECKLIST = [
    { label: 'Full Name', done: !!student.name, tab: 0, icon: <ProfileIcon sx={{ fontSize: 16 }} /> },
    { label: 'Phone Number', done: !!student.phone, tab: 0, icon: <ProfileIcon sx={{ fontSize: 16 }} /> },
    { label: 'Date of Birth', done: !!student.personalInfo?.dob, tab: 0, icon: <ProfileIcon sx={{ fontSize: 16 }} /> },
    { label: 'Nationality', done: !!student.personalInfo?.nationality, tab: 0, icon: <ProfileIcon sx={{ fontSize: 16 }} /> },
    { label: 'Passport Number', done: !!student.personalInfo?.passportNumber, tab: 0, icon: <ProfileIcon sx={{ fontSize: 16 }} /> },
    { label: '10th Grade Marks', done: !!student.academics?.tenth?.percentage, tab: 1, icon: <ApplicationsIcon sx={{ fontSize: 16 }} /> },
    { label: '12th Grade Marks', done: !!student.academics?.twelfth?.percentage, tab: 1, icon: <ApplicationsIcon sx={{ fontSize: 16 }} /> },
    { label: 'English Test Score', done: !!(student.academics?.ielts?.overallScore || student.academics?.toefl?.overallScore), tab: 1, icon: <ApplicationsIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box>
      {/* Greeting */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5, fontFamily: '"Outfit", sans-serif' }}>
          Hello, {firstName}! 👋
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
          Welcome back to your study abroad dashboard. Here's where things stand today.
        </Typography>
      </Box>

      {/* Onboarding Stepper */}
      {showOnboarding && (
        <Paper elevation={0} sx={{ 
          p: 3, mb: 4, borderRadius: '24px', bgcolor: 'white',
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1e293b' }}>Getting Started</Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#3B82F6' }}>
              {onboardingSteps.filter(s => s.done).length} of {onboardingSteps.length} complete
            </Typography>
          </Stack>
          <Stepper activeStep={activeStep} alternativeLabel>
            {onboardingSteps.map((step, index) => (
              <Step key={step.label} completed={step.done}>
                <StepLabel 
                  onClick={() => navigate(step.path, step.tab !== undefined ? { state: { initialTab: step.tab } } : undefined)}
                  sx={{ '& .MuiStepLabel-label': { fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer' } }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* Sarah's Daily Insight */}
      {insight && (
        <Paper elevation={0} sx={{
          p: 2.5, mb: 4, borderRadius: '20px',
          bgcolor: alpha(insight.color, 0.04),
          border: `1px solid ${alpha(insight.color, 0.15)}`,
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <Box sx={{
            p: 1.2, borderRadius: '12px',
            bgcolor: alpha(insight.color, 0.12), color: insight.color,
            display: 'flex', flexShrink: 0,
          }}>
            <InsightIcon />
          </Box>
          <Typography variant="body2" sx={{ flex: 1, fontWeight: 600, color: '#475569', lineHeight: 1.65, fontSize: '0.875rem' }}>
            {insight.text}
          </Typography>
          {insight.action && (
            <Button
              size="small"
              onClick={() => navigate(
                insight.action.path,
                insight.action.tab !== undefined ? { state: { initialTab: insight.action.tab } } : undefined
              )}
              sx={{
                borderRadius: '10px', textTransform: 'none', fontWeight: 800,
                bgcolor: alpha(insight.color, 0.1), color: insight.color,
                '&:hover': { bgcolor: alpha(insight.color, 0.18) },
                flexShrink: 0, px: 2, py: 0.8, fontSize: '0.8rem',
              }}
            >
              {insight.action.label}
            </Button>
          )}
        </Paper>
      )}

      {/* Quick Start Cards */}
      {showOnboarding && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Paper 
              onClick={() => navigate('/student/discovery')}
              sx={{ 
                p: 2.5, borderRadius: '20px', cursor: 'pointer',
                bgcolor: alpha('#8B5CF6', 0.04), border: `1px solid ${alpha('#8B5CF6', 0.15)}`,
                display: 'flex', alignItems: 'center', gap: 2,
                transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(139,92,246,0.1)' }
              }}
            >
              <Avatar sx={{ bgcolor: alpha('#8B5CF6', 0.1), color: '#8B5CF6' }}><ApplicationsIcon /></Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Explore Universities</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Find courses matching your profile</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper 
              onClick={() => navigate('/student/finance')}
              sx={{ 
                p: 2.5, borderRadius: '20px', cursor: 'pointer',
                bgcolor: alpha('#10B981', 0.04), border: `1px solid ${alpha('#10B981', 0.15)}`,
                display: 'flex', alignItems: 'center', gap: 2,
                transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(16,185,129,0.1)' }
              }}
            >
              <Avatar sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981' }}><MoneyIcon /></Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Plan Your Budget</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Calculate tuition and living costs</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

          {/* Quick Action Banners */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            onClick={() => navigate('/student/discovery')}
            sx={{
              p: 3.5, borderRadius: '28px', cursor: 'pointer',
              bgcolor: alpha('#8B5CF6', 0.05), border: `1px solid ${alpha('#8B5CF6', 0.15)}`,
              transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', bgcolor: alpha('#8B5CF6', 0.08) },
              display: 'flex', alignItems: 'center', gap: 3
            }}
          >
            <Avatar sx={{ bgcolor: '#8B5CF6', width: 56, height: 56, borderRadius: '16px' }}>
              <ApplicationsIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>Explore Universities</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Find courses matching your profile and preferences.</Typography>
            </Box>
            <ArrowIcon sx={{ ml: 'auto', fontSize: 18, color: '#8B5CF6' }} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            onClick={() => navigate('/student/finance')}
            sx={{
              p: 3.5, borderRadius: '28px', cursor: 'pointer',
              bgcolor: alpha('#10B981', 0.05), border: `1px solid ${alpha('#10B981', 0.15)}`,
              transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', bgcolor: alpha('#10B981', 0.08) },
              display: 'flex', alignItems: 'center', gap: 3
            }}
          >
            <Avatar sx={{ bgcolor: '#10B981', width: 56, height: 56, borderRadius: '16px' }}>
              <MoneyIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>Financial Planner</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Calculate tuition, living costs, and scholarships.</Typography>
            </Box>
            <ArrowIcon sx={{ ml: 'auto', fontSize: 18, color: '#10B981' }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Profile Strength', value: `${profileStrength}%`, icon: <RocketIcon />, color: '#3B82F6', subtitle: 'Completion Score', progress: profileStrength },
          { title: 'Documents', value: docCount, icon: <DocIcon />, color: '#10B981', subtitle: 'Files Uploaded' },
          { title: 'Current Phase', value: student.currentPhase ? student.currentPhase.split(' ')[0] : '—', icon: <PhaseIcon />, color: phaseColor, subtitle: student.currentStage || 'Not assigned' },
          { title: 'Eligibility', value: student.academics?.tenth?.percentage ? 'Good' : 'N/A', icon: <InsightIcon />, color: '#8B5CF6', subtitle: 'Academic Standing' },
        ].map((stat, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Application Status & Timeline */}
        <Grid size={{ xs: 12, xl: 8 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 2 }}>Detailed Progress Tracker</Typography>
          <Paper sx={{
            p: 4, borderRadius: '32px', bgcolor: 'white',
            border: `1px solid ${alpha(theme.palette.divider, 0.07)}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            height: '100%'
          }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" sx={{ mb: 5 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar variant="rounded" sx={{ width: 80, height: 80, bgcolor: alpha(phaseColor, 0.1), color: phaseColor, fontSize: '2.2rem', borderRadius: '22px' }}>
                  🎓
                </Avatar>
                <Box sx={{ position: 'absolute', bottom: -5, right: -5, width: 24, height: 24, bgcolor: '#10B981', borderRadius: '50%', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>✓</Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5 }}>{student.name}</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>ID: {student.studentId || 'STD-000000'}</Typography>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                  <Typography variant="body2" sx={{ color: phaseColor, fontWeight: 800 }}>{student.currentStatus || 'In Processing'}</Typography>
                </Stack>
              </Box>
              <Button variant="outlined" sx={{ borderRadius: '14px', textTransform: 'none', fontWeight: 800, px: 3 }}>View Full Roadmap</Button>
            </Stack>

            <Grid container spacing={3} sx={{ mb: 5 }}>
              {[
                { label: 'Application Phase', value: student.currentPhase || '—', color: phaseColor, detail: 'Next: Admission' },
                { label: 'Current Stage', value: student.currentStage || '—', color: '#1e293b', detail: 'Update: 2 days ago' },
                { label: 'Assigned Team', value: 'Stedinow Global', color: '#64748b', detail: 'Support 24/7' },
                { label: 'Target Destination', value: student.preferences?.targetCountries?.[0] || 'Multiple', color: '#10B981', detail: 'Fall 2024' },
              ].map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
                  <Box sx={{ p: 2, borderRadius: '20px', bgcolor: '#f8fafc', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 900, color: item.color, mb: 0.5 }}>
                      {item.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>{item.detail}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ pt: 4, borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', mb: 3, display: 'block', letterSpacing: 1 }}>Recent Activity Timeline</Typography>
              <Stack spacing={3}>
                {[
                  { date: 'Today', event: 'Document Verification', desc: 'Counselor is reviewing your academic transcripts.', status: 'In Progress', color: '#3B82F6' },
                  { date: 'Yesterday', event: 'Finance Profile Created', desc: 'Financial planning module successfully initialized.', status: 'Done', color: '#10B981' },
                  { date: '2 days ago', event: 'Profile Updated', desc: 'Academic details and preferences synchronized.', status: 'Done', color: '#10B981' },
                ].map((m, i) => (
                  <Stack key={i} direction="row" spacing={3}>
                    <Box sx={{ textAlign: 'right', minWidth: 90 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, display: 'block' }}>{m.date}</Typography>
                    </Box>
                    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'white', border: `3px solid ${m.color}`, zIndex: 1 }} />
                      {i !== 2 && <Box sx={{ width: 2, flex: 1, bgcolor: alpha(theme.palette.divider, 0.1), my: 0.5 }} />}
                    </Box>
                    <Box sx={{ flex: 1, pb: i === 2 ? 0 : 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>{m.event}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{m.desc}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Action Center & Profile Completion */}
        <Grid size={{ xs: 12, xl: 4 }}>
          <Stack spacing={4} sx={{ height: '100%' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 2 }}>Priority Tasks</Typography>
              <Paper sx={{ 
                p: 3, borderRadius: '32px', bgcolor: 'white',
                border: `1px solid ${alpha(theme.palette.divider, 0.07)}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              }}>
                <Stack spacing={2}>
                  {CHECKLIST.map((item) => (
                    <Box
                      key={item.label}
                      onClick={() => !item.done && navigate('/student/profile', { state: { initialTab: item.tab } })}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2.5,
                        p: 2, borderRadius: '20px',
                        bgcolor: item.done ? alpha('#10B981', 0.04) : '#f8fafc',
                        border: `1px solid ${item.done ? alpha('#10B981', 0.1) : 'transparent'}`,
                        cursor: item.done ? 'default' : 'pointer',
                        transition: '0.3s',
                        '&:hover': !item.done ? {
                          bgcolor: 'white',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                          transform: 'translateX(5px)',
                          borderColor: alpha('#3B82F6', 0.2)
                        } : {},
                      }}
                    >
                      <Box sx={{ 
                        p: 1.2, borderRadius: '14px',
                        bgcolor: item.done ? alpha('#10B981', 0.1) : 'white',
                        color: item.done ? '#10B981' : '#cbd5e1',
                        display: 'flex', boxShadow: item.done ? 'none' : '0 2px 8px rgba(0,0,0,0.04)'
                      }}>
                        {item.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: item.done ? '#1e293b' : '#64748b' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>{item.done ? 'Verified' : 'Required for admission'}</Typography>
                      </Box>
                      {item.done && <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</Box>}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 2 }}>Quick Resource Hub</Typography>
              <Paper sx={{ 
                p: 3, borderRadius: '32px', bgcolor: '#1e293b', color: 'white',
                height: 'calc(100% - 40px)', position: 'relative', overflow: 'hidden'
              }}>
                <Box sx={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, bgcolor: alpha('#3B82F6', 0.1), borderRadius: '50%', filter: 'blur(40px)' }} />
                <Stack spacing={2}>
                  {[
                    { title: 'Visa Guide', icon: '🛂', path: '/student/visa' },
                    { title: 'SOP Writing Tips', icon: '📝', path: '/student/profile' },
                    { title: 'Financial Planning', icon: '🏦', path: '/student/finance' },
                    { title: 'University Discovery', icon: '🏛️', path: '/student/discovery' },
                  ].map((item, i) => (
                    <Box key={i} 
                      onClick={() => navigate(item.path)}
                      sx={{ 
                      p: 2.5, bgcolor: alpha('#ffffff', 0.05), borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 2.5,
                      cursor: 'pointer', transition: '0.3s', '&:hover': { bgcolor: alpha('#ffffff', 0.1), transform: 'translateX(8px)' },
                      border: `1px solid ${alpha('#ffffff', 0.05)}`
                    }}>
                      <Typography sx={{ fontSize: '1.5rem' }}>{item.icon}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: 'white' }}>{item.title}</Typography>
                      <ArrowIcon sx={{ ml: 'auto', fontSize: 14, color: alpha('#ffffff', 0.3) }} />
                    </Box>
                  ))}
                </Stack>
                <Box sx={{ mt: 4, p: 2.5, bgcolor: alpha('#3B82F6', 0.1), borderRadius: '20px', border: `1px solid ${alpha('#3B82F6', 0.2)}` }}>
                  <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.7), fontWeight: 700, display: 'block', mb: 1 }}>COUNSELOR TIP</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontStyle: 'italic' }}>"Upload your transcripts today to speed up your eligibility check!" — Sarah</Typography>
                </Box>
              </Paper>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Upcoming Intakes */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CalendarIcon sx={{ color: '#64748b', fontSize: 26 }} />
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b' }}>Upcoming Admission Deadlines</Typography>
          </Stack>
        </Stack>
        <Grid container spacing={3}>
          {nextIntakes.map(({ country, label, daysLeft }) => {
            const color = daysLeft <= 30 ? '#EF4444' : daysLeft <= 90 ? '#F59E0B' : '#10B981';
            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={`${country}-${label}`}>
                <Paper elevation={0} sx={{
                  p: 4, borderRadius: '32px', textAlign: 'center',
                  bgcolor: 'white',
                  border: `1px solid ${alpha(color, 0.2)}`,
                  boxShadow: `0 8px 30px ${alpha(color, 0.05)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: `0 15px 40px ${alpha(color, 0.15)}`, transform: 'translateY(-8px)' },
                }}>
                  <Typography sx={{ fontSize: '3rem', mb: 2 }}>{COUNTRY_FLAGS[country] || '🌍'}</Typography>
                  <Typography variant="h2" sx={{ fontWeight: 900, color, mb: 1 }}>{daysLeft}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 900, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 2, mb: 2 }}>days remaining</Typography>
                  <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 900, mb: 0.5 }}>{country}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>{label}</Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
