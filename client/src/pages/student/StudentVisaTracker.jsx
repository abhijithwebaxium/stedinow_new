import { useState, useEffect } from 'react';
import {
  Box, Typography, Stack, Paper, alpha, useTheme,
  CircularProgress, Chip, Grid, LinearProgress,
} from '@mui/material';
import {
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as PendingIcon,
  DescriptionOutlined as DocIcon,
  SchoolOutlined as AppIcon,
  LockOutlined as LockedIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const VISA_STAGES = [
  {
    key: 'offer',
    label: 'Offer Letter Received',
    description: 'University has issued your offer letter',
    check: ({ app }) =>
      app && (['Conditional Offer', 'Unconditional Offer', 'Accepted'].includes(app.status) || app.offerLetterReceived),
  },
  {
    key: 'deposit',
    label: 'Enrollment Confirmed',
    description: 'Enrollment deposit paid to secure your place',
    check: ({ app }) => app?.depositRequired?.paid,
  },
  {
    key: 'cas',
    label: 'CAS / I-20 / CoE Issued',
    description: 'Official study authorization document received',
    check: ({ docs }) =>
      docs.some(d => ['CAS/I-20/CoE', 'Enrollment Confirmation Letter'].includes(d.documentType)),
  },
  {
    key: 'visa_filed',
    label: 'Visa Application Filed',
    description: 'Student visa application submitted to embassy',
    check: ({ currentStage }) =>
      currentStage?.toLowerCase().includes('visa'),
  },
  {
    key: 'biometrics',
    label: 'Biometrics Completed',
    description: 'Biometrics appointment attended',
    check: () => false,
  },
  {
    key: 'visa_granted',
    label: 'Visa Granted',
    description: 'Your student visa has been approved!',
    check: ({ currentStatus }) =>
      currentStatus?.toLowerCase().includes('visa') && currentStatus?.toLowerCase().includes('approv'),
  },
];

const VISA_DOCS = [
  { key: 'Passport', label: 'Passport', required: true },
  { key: 'Passport Size Photo', label: 'Passport Size Photo', required: true },
  { key: 'Bank Statement', label: 'Bank Statement', required: true },
  { key: 'IELTS Scorecard', label: 'English Test Score', required: false, anyOf: ['IELTS Scorecard', 'TOEFL Scorecard', 'PTE Scorecard'] },
];

const STATUS_COLORS = {
  'Accepted': '#10B981',
  'Unconditional Offer': '#10B981',
  'Conditional Offer': '#3B82F6',
  'Under Review': '#F59E0B',
  'Submitted': '#8B5CF6',
  'Rejected': '#EF4444',
  'Withdrawn': '#94a3b8',
  'Deferred': '#F59E0B',
};

const StudentVisaTracker = () => {
  const theme = useTheme();
  // Use shared documents from layout context — stays in sync with all uploads
  const { documents: contextDocs } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/student-portal/visa-status`, { withCredentials: true });
        if (res.data.status === 'success') setData(res.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const app = data?.bestApplication;
  // Always use live context documents — reflects uploads from any page instantly
  const docs = contextDocs || [];
  const currentStage = data?.currentStage;
  const currentStatus = data?.currentStatus;

  const stageContext = { app, docs, currentStage, currentStatus };
  const completedCount = VISA_STAGES.filter(s => s.check(stageContext)).length;
  const progressPct = Math.round((completedCount / VISA_STAGES.length) * 100);
  const firstIncomplete = VISA_STAGES.findIndex(s => !s.check(stageContext));

  const hasActiveApp = app && !['Draft', 'Rejected', 'Withdrawn'].includes(app.status);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', fontFamily: '"Outfit", sans-serif' }}>
            Visa Journey
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600, mt: 0.3 }}>
            Track your path from offer letter to visa approval.
          </Typography>
        </Box>
        {completedCount > 0 && (
          <Chip
            label={`${completedCount} / ${VISA_STAGES.length} stages`}
            sx={{ bgcolor: alpha('#10B981', 0.1), color: '#059669', fontWeight: 800, borderRadius: '12px' }}
          />
        )}
      </Stack>

      {/* No application state */}
      {!hasActiveApp && (
        <Paper elevation={0} sx={{ p: 8, borderRadius: '28px', border: `1px solid rgba(0,0,0,0.06)`, textAlign: 'center' }}>
          <Box sx={{ fontSize: '3rem', mb: 2 }}>✈️</Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            Your Visa Journey Starts Here
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, maxWidth: 420, mx: 'auto' }}>
            Once your university application is processed and you receive an offer letter, your visa journey will be tracked here.
          </Typography>
          {data?.totalApplications > 0 && (
            <Chip
              label={`${data.totalApplications} application${data.totalApplications > 1 ? 's' : ''} in progress`}
              sx={{ mt: 3, bgcolor: alpha('#3B82F6', 0.08), color: '#2563EB', fontWeight: 700 }}
            />
          )}
        </Paper>
      )}

      {hasActiveApp && (
        <Grid container spacing={3}>
          {/* Left: Progress + Stages */}
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Overall Progress */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid rgba(0,0,0,0.06)`, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>Overall Progress</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: progressPct === 100 ? '#10B981' : '#3B82F6' }}>
                  {progressPct}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressPct}
                sx={{
                  height: 10, borderRadius: 5,
                  bgcolor: alpha('#3B82F6', 0.08),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: progressPct === 100 ? '#10B981' : '#3B82F6',
                    borderRadius: 5,
                  },
                }}
              />
            </Paper>

            {/* Stage Stepper */}
            <Stack spacing={0}>
              {VISA_STAGES.map((stage, idx) => {
                const done = stage.check(stageContext);
                const isCurrent = idx === firstIncomplete;
                const isLocked = idx > firstIncomplete;

                return (
                  <Box key={stage.key} sx={{ display: 'flex', gap: 2 }}>
                    {/* Connector line */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: done ? '#10B981' : isCurrent ? alpha('#3B82F6', 0.1) : '#f1f5f9',
                        border: isCurrent ? `2px solid #3B82F6` : done ? 'none' : `2px solid #e2e8f0`,
                        transition: 'all 0.2s',
                      }}>
                        {done ? (
                          <DoneIcon sx={{ fontSize: 18, color: 'white' }} />
                        ) : isLocked ? (
                          <LockedIcon sx={{ fontSize: 15, color: '#cbd5e1' }} />
                        ) : (
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#3B82F6' }} />
                        )}
                      </Box>
                      {idx < VISA_STAGES.length - 1 && (
                        <Box sx={{ width: 2, flex: 1, my: 0.5, minHeight: 24, bgcolor: done ? '#10B981' : '#e2e8f0', transition: 'all 0.2s' }} />
                      )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ pb: idx < VISA_STAGES.length - 1 ? 2 : 0, flex: 1 }}>
                      <Paper elevation={0} sx={{
                        p: 2, borderRadius: '16px',
                        border: `1px solid ${done ? alpha('#10B981', 0.15) : isCurrent ? alpha('#3B82F6', 0.15) : 'rgba(0,0,0,0.05)'}`,
                        bgcolor: done ? alpha('#10B981', 0.03) : isCurrent ? alpha('#3B82F6', 0.03) : '#fafafa',
                      }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: done ? '#059669' : isCurrent ? '#1e293b' : '#94a3b8' }}>
                              {stage.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                              {stage.description}
                            </Typography>
                          </Box>
                          {done ? (
                            <Chip label="Done" size="small" sx={{ bgcolor: alpha('#10B981', 0.1), color: '#059669', fontWeight: 800, fontSize: '0.68rem' }} />
                          ) : isCurrent ? (
                            <Chip label="Current" size="small" sx={{ bgcolor: alpha('#3B82F6', 0.1), color: '#2563EB', fontWeight: 800, fontSize: '0.68rem' }} />
                          ) : null}
                        </Stack>
                      </Paper>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Grid>

          {/* Right: Application Info + Visa Docs */}
          <Grid size={{ xs: 12, md: 5 }}>
            {/* Application Card */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid rgba(0,0,0,0.06)`, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: alpha('#3B82F6', 0.08), color: '#3B82F6', display: 'flex' }}>
                  <AppIcon />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>Application Details</Typography>
              </Stack>

              <Stack spacing={1.5}>
                {[
                  { label: 'University', value: app.university?.name, icon: '🏛️' },
                  { label: 'Country', value: app.university?.country, icon: '🌍' },
                  { label: 'Course', value: app.course?.name, icon: '📚' },
                  { label: 'Intake', value: app.intake, icon: '📅' },
                ].map(item => item.value && (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Typography sx={{ fontSize: '1rem', mt: 0.1 }}>{item.icon}</Typography>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{item.value}</Typography>
                    </Box>
                  </Box>
                ))}
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
                    Status
                  </Typography>
                  <Chip
                    label={app.status}
                    size="small"
                    sx={{
                      bgcolor: alpha(STATUS_COLORS[app.status] || '#64748b', 0.1),
                      color: STATUS_COLORS[app.status] || '#64748b',
                      fontWeight: 800, borderRadius: '10px',
                    }}
                  />
                </Box>
              </Stack>
            </Paper>

            {/* Visa Document Checklist */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid rgba(0,0,0,0.06)`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: alpha('#8B5CF6', 0.08), color: '#8B5CF6', display: 'flex' }}>
                  <DocIcon />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>Visa Documents</Typography>
              </Stack>

              <Stack spacing={1}>
                {VISA_DOCS.map(vd => {
                  const uploaded = vd.anyOf
                    ? docs.some(d => vd.anyOf.includes(d.documentType))
                    : docs.some(d => d.documentType === vd.key);
                  const doc = uploaded ? (vd.anyOf
                    ? docs.find(d => vd.anyOf.includes(d.documentType))
                    : docs.find(d => d.documentType === vd.key)) : null;

                  return (
                    <Box key={vd.key} sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      p: 1.5, borderRadius: '12px',
                      bgcolor: uploaded ? alpha('#10B981', 0.05) : alpha('#EF4444', 0.03),
                      border: `1px solid ${uploaded ? alpha('#10B981', 0.12) : alpha('#EF4444', 0.08)}`,
                    }}>
                      {uploaded ? (
                        <DoneIcon sx={{ fontSize: 18, color: '#10B981', flexShrink: 0 }} />
                      ) : (
                        <PendingIcon sx={{ fontSize: 18, color: '#cbd5e1', flexShrink: 0 }} />
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: uploaded ? '#1e293b' : '#94a3b8', fontSize: '0.825rem' }}>
                          {vd.label}
                        </Typography>
                        {doc && (
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                            {doc.status}
                          </Typography>
                        )}
                      </Box>
                      {vd.required && !uploaded && (
                        <Chip label="Required" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: alpha('#EF4444', 0.08), color: '#EF4444', '& .MuiChip-label': { px: 0.8 } }} />
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StudentVisaTracker;
