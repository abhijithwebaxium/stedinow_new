import { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Paper, alpha, useTheme,
  Grid, Chip, LinearProgress, MenuItem, TextField,
} from '@mui/material';
import {
  CheckCircle as MetIcon,
  RemoveCircleOutline as CloseIcon,
  Cancel as NotMetIcon,
  HelpOutline as MissingIcon,
  TipsAndUpdates as TipIcon,
} from '@mui/icons-material';
import { useOutletContext, useNavigate } from 'react-router-dom';

// ─── English score normaliser ───────────────────────────────────────
const getEnglishScore = (student) => {
  if (student.academics?.ielts?.overallScore) return student.academics.ielts.overallScore;
  const toefl = student.academics?.toefl?.overallScore;
  if (toefl) return toefl >= 110 ? 8.0 : toefl >= 100 ? 7.0 : toefl >= 90 ? 6.5 : toefl >= 80 ? 6.0 : toefl >= 70 ? 5.5 : 5.0;
  const pte = student.academics?.pte?.overallScore;
  if (pte) return pte >= 76 ? 8.0 : pte >= 65 ? 7.0 : pte >= 58 ? 6.5 : pte >= 50 ? 6.0 : pte >= 43 ? 5.5 : 5.0;
  return null;
};

const getUGScore = (s) =>
  s.academics?.undergraduate?.percentage ||
  (s.academics?.undergraduate?.cgpa ? s.academics.undergraduate.cgpa * 10 : null);

// ─── Scoring rubrics per country × level ────────────────────────────
const CRITERIA_BY_LEVEL = {
  Undergraduate: [
    {
      key: 'english', label: 'English Score (IELTS equiv.)',
      getValue: getEnglishScore, unit: '',
      thresholds: { UK: 6.0, Canada: 6.0, Australia: 6.0, USA: 6.5, Ireland: 6.0, Germany: 6.0, 'New Zealand': 6.0, Singapore: 6.0, Netherlands: 6.0 },
    },
    {
      key: 'twelfth', label: '12th Grade (%)',
      getValue: (s) => s.academics?.twelfth?.percentage, unit: '%',
      thresholds: { UK: 65, Canada: 65, Australia: 60, USA: 75, Ireland: 65, Germany: 70, 'New Zealand': 65, Singapore: 70, Netherlands: 70 },
    },
  ],
  Postgraduate: [
    {
      key: 'english', label: 'English Score (IELTS equiv.)',
      getValue: getEnglishScore, unit: '',
      thresholds: { UK: 6.5, Canada: 6.5, Australia: 6.5, USA: 6.5, Ireland: 6.5, Germany: 6.5, 'New Zealand': 6.5, Singapore: 6.5, Netherlands: 6.5 },
    },
    {
      key: 'ug', label: 'UG Score (%)',
      getValue: getUGScore, unit: '%',
      thresholds: { UK: 55, Canada: 60, Australia: 60, USA: 60, Ireland: 55, Germany: 60, 'New Zealand': 60, Singapore: 60, Netherlands: 60 },
    },
  ],
  Diploma: [
    {
      key: 'english', label: 'English Score (IELTS equiv.)',
      getValue: getEnglishScore, unit: '',
      thresholds: { UK: 5.5, Canada: 5.5, Australia: 5.5, USA: 6.0, Ireland: 5.5, Germany: 5.5, 'New Zealand': 5.5, Singapore: 5.5, Netherlands: 5.5 },
    },
    {
      key: 'twelfth', label: '12th Grade (%)',
      getValue: (s) => s.academics?.twelfth?.percentage, unit: '%',
      thresholds: { UK: 55, Canada: 55, Australia: 55, USA: 65, Ireland: 55, Germany: 60, 'New Zealand': 55, Singapore: 60, Netherlands: 60 },
    },
  ],
};

const COUNTRY_META = {
  UK: { flag: '🇬🇧', color: '#1D4ED8' },
  Canada: { flag: '🇨🇦', color: '#DC2626' },
  Australia: { flag: '🇦🇺', color: '#2563EB' },
  USA: { flag: '🇺🇸', color: '#1E3A5F' },
  Ireland: { flag: '🇮🇪', color: '#16A34A' },
  Germany: { flag: '🇩🇪', color: '#374151' },
  'New Zealand': { flag: '🇳🇿', color: '#1D4ED8' },
  Singapore: { flag: '🇸🇬', color: '#DC2626' },
  Netherlands: { flag: '🇳🇱', color: '#EA580C' },
};

const DEFAULT_COUNTRIES = ['UK', 'Canada', 'Australia', 'USA'];

// ─── Score calculation ──────────────────────────────────────────────
const calcCountryScore = (student, country, level) => {
  const criteria = CRITERIA_BY_LEVEL[level] || CRITERIA_BY_LEVEL.Postgraduate;
  const results = criteria.map((c) => {
    const val = c.getValue(student);
    const threshold = c.thresholds[country];
    if (val === null || val === undefined || !threshold) {
      return { ...c, studentValue: null, threshold, status: 'missing', points: 0 };
    }
    const ratio = val / threshold;
    const status = ratio >= 1 ? 'met' : ratio >= 0.92 ? 'close' : 'not_met';
    return { ...c, studentValue: val, threshold, status, points: status === 'met' ? 100 : status === 'close' ? 55 : 0 };
  });
  const score = results.length ? Math.round(results.reduce((s, r) => s + r.points, 0) / results.length) : 0;
  return { results, score };
};

const STATUS_CFG = {
  met: { icon: <MetIcon sx={{ fontSize: 16 }} />, color: '#10B981', label: 'Met' },
  close: { icon: <CloseIcon sx={{ fontSize: 16 }} />, color: '#F59E0B', label: 'Close' },
  not_met: { icon: <NotMetIcon sx={{ fontSize: 16 }} />, color: '#EF4444', label: 'Below' },
  missing: { icon: <MissingIcon sx={{ fontSize: 16 }} />, color: '#94a3b8', label: 'Not added' },
};

const scoreColor = (score) => score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
const scoreLabel = (score) => score >= 80 ? 'Strong Match' : score >= 50 ? 'Borderline' : 'Needs Work';

// ─── Improvement tips ───────────────────────────────────────────────
const getTips = (student, level) => {
  const tips = [];
  const eng = getEnglishScore(student);
  const ug = getUGScore(student);
  if (!eng) tips.push('Add your IELTS, TOEFL, or PTE score to unlock your English eligibility score.');
  else if (eng < 6.0) tips.push(`Your English score (${eng}) is below the minimum for most countries. Retaking IELTS targeting 6.5+ would open significantly more doors.`);
  if (level === 'Postgraduate' && !ug) tips.push('Add your undergraduate percentage or CGPA to see your full eligibility picture.');
  if (level === 'Undergraduate' && !student.academics?.twelfth?.percentage) tips.push('Add your 12th grade percentage to calculate eligibility accurately.');
  if (tips.length === 0) tips.push('Your profile data is complete! Talk to your counselor about shortlisting universities.');
  return tips;
};

// ─── Country card ───────────────────────────────────────────────────
const CountryCard = ({ country, student, level }) => {
  const theme = useTheme();
  const meta = COUNTRY_META[country] || { flag: '🌍', color: '#64748b' };
  const { results, score } = calcCountryScore(student, country, level);
  const color = scoreColor(score);

  return (
    <Paper elevation={0} sx={{
      p: 3, borderRadius: '24px', height: '100%',
      border: `1px solid ${alpha(color, 0.2)}`,
      bgcolor: alpha(color, 0.02),
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography sx={{ fontSize: '1.6rem' }}>{meta.flag}</Typography>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{country}</Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>{level}</Typography>
          </Box>
        </Stack>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color, lineHeight: 1 }}>{score}%</Typography>
          <Typography variant="caption" sx={{ color, fontWeight: 800 }}>{scoreLabel(score)}</Typography>
        </Box>
      </Stack>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          mb: 2.5, height: 8, borderRadius: 4,
          bgcolor: alpha(color, 0.1),
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
        }}
      />

      {/* Criteria */}
      <Stack spacing={1.5}>
        {results.map((r) => {
          const cfg = STATUS_CFG[r.status];
          return (
            <Box key={r.key} sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              p: 1.5, borderRadius: '12px',
              bgcolor: alpha(cfg.color, 0.05),
              border: `1px solid ${alpha(cfg.color, 0.12)}`,
            }}>
              <Box sx={{ color: cfg.color, display: 'flex', flexShrink: 0 }}>{cfg.icon}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b', display: 'block' }}>{r.label}</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                  {r.studentValue != null ? `Your score: ${r.studentValue}${r.unit}` : 'Not added yet'}&nbsp;
                  {r.threshold ? `· Required: ${r.threshold}${r.unit}` : ''}
                </Typography>
              </Box>
              <Chip
                label={cfg.label}
                size="small"
                sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: alpha(cfg.color, 0.1), color: cfg.color, '& .MuiChip-label': { px: 0.8 }, flexShrink: 0 }}
              />
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

// ─── Main page ──────────────────────────────────────────────────────
const StudentEligibility = () => {
  const { student } = useOutletContext();
  const navigate = useNavigate();
  const [level, setLevel] = useState(student?.preferences?.studyLevel || 'Postgraduate');

  const targetCountries = useMemo(() => {
    const prefs = student?.preferences?.targetCountries || [];
    return prefs.length > 0 ? prefs : DEFAULT_COUNTRIES;
  }, [student]);

  const tips = useMemo(() => getTips(student, level), [student, level]);

  if (!student) return null;

  const hasPrefs = student?.preferences?.targetCountries?.length > 0;

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', fontFamily: '"Outfit", sans-serif' }}>
            Eligibility Check
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600, mt: 0.3 }}>
            See how your academic profile matches up for each destination.
          </Typography>
        </Box>
        <TextField
          select size="small"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'white', fontWeight: 700 } }}
        >
          {['Undergraduate', 'Postgraduate', 'Diploma'].map(l => (
            <MenuItem key={l} value={l}>{l}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {!hasPrefs && (
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '18px', bgcolor: alpha('#F59E0B', 0.05), border: `1px solid ${alpha('#F59E0B', 0.2)}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TipIcon sx={{ color: '#D97706', flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#92400E' }}>
              Showing popular destinations — set your{' '}
              <Box component="span" sx={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/student/profile', { state: { initialTab: 2 } })}>
                target countries in your profile
              </Box>
              {' '}for a personalised check.
            </Typography>
          </Stack>
        </Paper>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {targetCountries.map(country => (
          <Grid item xs={12} sm={6} lg={4} key={country}>
            <CountryCard country={country} student={student} level={level} />
          </Grid>
        ))}
      </Grid>

      {/* Tips card */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: `1px solid ${alpha('#3B82F6', 0.15)}`, bgcolor: alpha('#3B82F6', 0.03) }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <TipIcon sx={{ color: '#3B82F6', mt: 0.2, flexShrink: 0 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>How to improve your score</Typography>
            <Stack spacing={0.8}>
              {tips.map((tip, i) => (
                <Typography key={i} variant="body2" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.855rem' }}>
                  • {tip}
                </Typography>
              ))}
              <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.82rem', mt: 0.5 }}>
                Note: These scores are indicative based on general entry requirements. Actual admission depends on many factors — your counselor will give precise guidance.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default StudentEligibility;
