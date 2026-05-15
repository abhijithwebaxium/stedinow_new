import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Grid, Paper, alpha, useTheme, Stack, TextField,
  InputAdornment, MenuItem, Button, IconButton, Chip, Skeleton,
} from "@mui/material";
import {
  Search as SearchIcon,
  FavoriteBorder as HeartIcon,
  Favorite as HeartFilledIcon,
  TrendingUp as RankIcon,
  FilterList as FilterIcon,
  Public as CountryIcon,
  SchoolOutlined as EmptyIcon,
  LocationOn as CityIcon,
  ArrowForwardIos as ArrowIcon,
} from "@mui/icons-material";
import { useOutletContext } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const countryCodeToFlag = (code) => {
  if (!code || code.length !== 2) return '🏛️';
  return code.toUpperCase().split('').map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('');
};

const UnivCardSkeleton = () => (
  <Paper sx={{ p: 3, borderRadius: '28px', bgcolor: 'white' }}>
    <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: '12px' }} />
      <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '12px' }} />
    </Stack>
    <Skeleton variant="text" width="30%" height={18} sx={{ mb: 1 }} />
    <Stack direction="row" spacing={0.5} sx={{ mb: 3 }}>
      <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: '8px' }} />
      <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: '8px' }} />
    </Stack>
    <Stack direction="row" justifyContent="space-between">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: '10px' }} />
    </Stack>
  </Paper>
);

const EmptyState = ({ search, country }) => (
  <Grid size={{ xs: 12 }}>
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <EmptyIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#475569', mb: 1 }}>
        {search || country !== 'All' ? 'No universities match your search' : 'No universities added yet'}
      </Typography>
      <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>
        {search || country !== 'All'
          ? 'Try adjusting your search or filters'
          : 'Your counselor will add recommended universities here soon'}
      </Typography>
    </Box>
  </Grid>
);

const StudentDiscovery = () => {
  const theme = useTheme();
  const { student } = useOutletContext();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/student-portal/discovery/universities`, {
          withCredentials: true,
        });
        setUniversities(res.data.data || []);
      } catch (err) {
        console.error('[Discovery] Failed to load universities:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleShortlist = async (id) => {
    setUniversities(prev =>
      prev.map(u => String(u.id) === String(id) ? { ...u, isShortlisted: !u.isShortlisted } : u)
    );
    try {
      await axios.post(`${API}/api/student-portal/discovery/shortlist/${id}`, {}, {
        withCredentials: true,
      });
    } catch (err) {
      // Revert optimistic update on failure
      setUniversities(prev =>
        prev.map(u => String(u.id) === String(id) ? { ...u, isShortlisted: !u.isShortlisted } : u)
      );
    }
  };

  const filteredUnivs = useMemo(() => {
    return universities.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        u.name.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q) ||
        u.courses.some(c => c.toLowerCase().includes(q));
      const matchCountry = countryFilter === 'All' || u.country === countryFilter;
      return matchSearch && matchCountry;
    });
  }, [universities, search, countryFilter]);

  const countries = useMemo(() =>
    ['All', ...new Set(universities.map(u => u.country).filter(Boolean))],
    [universities]
  );

  const shortlistCount = universities.filter(u => u.isShortlisted).length;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontFamily: '"Outfit", sans-serif' }}>
              Discover Your Future
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
              Explore world-class universities and find the perfect match for your career goals.
            </Typography>
          </Box>
          {shortlistCount > 0 && (
            <Chip
              icon={<HeartFilledIcon sx={{ color: '#EF4444 !important', fontSize: '16px !important' }} />}
              label={`${shortlistCount} shortlisted`}
              sx={{
                fontWeight: 800, fontSize: '0.875rem',
                bgcolor: alpha('#EF4444', 0.08), color: '#EF4444',
                border: `1px solid ${alpha('#EF4444', 0.2)}`,
                px: 1,
              }}
            />
          )}
        </Stack>
      </Box>

          {/* Search & Filters */}
      <Paper sx={{
        p: 3, borderRadius: '24px', mb: 4, bgcolor: 'white',
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <TextField
              fullWidth
              placeholder="Search by university, city, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                sx: { borderRadius: '16px', bgcolor: '#f8fafc', '& fieldset': { border: 'none' } }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              fullWidth
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><CountryIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                sx: { borderRadius: '16px', bgcolor: '#f8fafc', '& fieldset': { border: 'none' } }
              }}
            >
              {countries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="contained"
              sx={{ borderRadius: '14px', py: 1.5, bgcolor: '#3B82F6', textTransform: 'none', fontWeight: 800 }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4}>
        {/* Main University List */}
        <Grid size={{ xs: 12, xl: 9 }}>
          <Grid container spacing={3}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Grid size={{ xs: 12, md: 6 }} key={i}>
                  <UnivCardSkeleton />
                </Grid>
              ))
            ) : filteredUnivs.length === 0 ? (
              <EmptyState search={search} country={countryFilter} />
            ) : (
              filteredUnivs.map((univ) => {
                const flag = countryCodeToFlag(univ.countryCode);
                const feeDisplay = univ.minFee && univ.currency
                  ? `${univ.currency} ${univ.minFee.toLocaleString()}/yr`
                  : 'Contact for fees';

                return (
                  <Grid size={{ xs: 12, md: 6 }} key={String(univ.id)}>
                    <Paper sx={{
                      p: 4, borderRadius: '32px', height: '100%', position: 'relative',
                      bgcolor: 'white', border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' },
                      display: 'flex', flexDirection: 'column',
                    }}>
                      <IconButton
                        onClick={() => toggleShortlist(univ.id)}
                        sx={{
                          position: 'absolute', top: 20, right: 20,
                          color: univ.isShortlisted ? '#EF4444' : '#94a3b8',
                          bgcolor: alpha(univ.isShortlisted ? '#EF4444' : '#94a3b8', 0.05),
                          '&:hover': { bgcolor: alpha(univ.isShortlisted ? '#EF4444' : '#94a3b8', 0.1) }
                        }}
                      >
                        {univ.isShortlisted ? <HeartFilledIcon /> : <HeartIcon />}
                      </IconButton>

                      <Box sx={{ fontSize: '3.5rem', mb: 3 }}>{flag}</Box>

                      <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#1e293b', pr: 5 }}>
                        {univ.name}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          label={univ.country}
                          sx={{ fontWeight: 800, bgcolor: alpha('#3B82F6', 0.08), color: '#3B82F6', borderRadius: '10px' }}
                        />
                        {univ.rank && (
                          <Chip
                            icon={<RankIcon sx={{ fontSize: '16px !important' }} />}
                            label={`Top #${univ.rank}`}
                            sx={{ fontWeight: 800, bgcolor: alpha('#F59E0B', 0.08), color: '#D97706', borderRadius: '10px' }}
                          />
                        )}
                      </Stack>

                      {univ.city && (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
                          <CityIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                          <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 700 }}>
                            {univ.city}
                          </Typography>
                        </Stack>
                      )}

                      <Box sx={{ flex: 1, mb: 3 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1.5, letterSpacing: 1 }}>
                          Featured Programs
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {univ.courses.slice(0, 5).map(c => (
                            <Chip key={c} label={c} variant="outlined" sx={{ borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, borderColor: alpha(theme.palette.divider, 0.1) }} />
                          ))}
                        </Box>
                      </Box>

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mt: 'auto', pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}` }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>
                            Yearly Tuition
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: univ.minFee ? '#1e293b' : '#94a3b8' }}>
                            {feeDisplay}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          onClick={() => toggleShortlist(univ.id)}
                          sx={{
                            borderRadius: '14px', textTransform: 'none', fontWeight: 800, px: 3,
                            bgcolor: univ.isShortlisted ? '#EF4444' : '#1e293b',
                            '&:hover': { bgcolor: univ.isShortlisted ? '#DC2626' : '#334155' }
                          }}
                        >
                          {univ.isShortlisted ? 'Shortlisted' : 'Shortlist'}
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })
            )}
          </Grid>
        </Grid>

        {/* Sidebar Insights */}
        <Grid size={{ xs: 12, xl: 3 }}>
          <Stack spacing={4}>
            <Paper sx={{ p: 4, borderRadius: '32px', bgcolor: '#1e293b', color: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Why Shortlist?</Typography>
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mb: 3, lineHeight: 1.6 }}>
                Shortlisting a university allows our AI "Sarah" and your counselor to analyze your specific match and requirements.
              </Typography>
              <Stack spacing={2}>
                {[
                  'Priority Eligibility Checks',
                  'Fee Waiver Alerts',
                  'Personalized SOP Tips',
                  'Application Fee Deadlines'
                ].map(text => (
                  <Stack key={text} direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#3B82F6' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2, color: '#1e293b' }}>Popular Destinations</Typography>
              <Stack spacing={1.5}>
                {[
                  { name: 'United Kingdom', count: 142, flag: '🇬🇧' },
                  { name: 'Canada', count: 89, flag: '🇨🇦' },
                  { name: 'Australia', count: 64, flag: '🇦🇺' },
                  { name: 'United States', count: 112, flag: '🇺🇸' },
                ].map(d => (
                  <Box key={d.name} sx={{ 
                    p: 2, bgcolor: 'white', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: 2,
                    cursor: 'pointer', transition: '0.2s', '&:hover': { transform: 'translateX(5px)', bgcolor: alpha('#3B82F6', 0.05) },
                    border: '1px solid rgba(0,0,0,0.02)'
                  }}>
                    <Typography sx={{ fontSize: '1.4rem' }}>{d.flag}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#1e293b' }}>{d.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>{d.count} Universities</Typography>
                    </Box>
                    <ArrowIcon sx={{ fontSize: 12, color: '#cbd5e1' }} />
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDiscovery;
