import { useState, useMemo, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, alpha, useTheme, Stack, TextField,
  InputAdornment, MenuItem, Button, LinearProgress, Card,
} from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  Calculate as CalcIcon,
  CurrencyExchange as ExchangeIcon,
  AccountBalance as BankIcon,
  TrendingUp as SavingsIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import { useOutletContext } from 'react-router-dom';

const RATES = {
  GBP: 106.5,
  CAD: 61.2,
  AUD: 55.8,
  USD: 83.4,
  EUR: 90.1,
};

const StudentFinance = () => {
  const theme = useTheme();
  const { student } = useOutletContext();
  const [tuition, setTuition] = useState(25000);
  const [currency, setCurrency] = useState("GBP");
  const [livingMonths, setLivingMonths] = useState(12);
  const [monthlyExpense, setMonthlyExpense] = useState(1000);

  // EMI Calculator state
  const [loanAmount, setLoanAmount] = useState(1500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenureYears, setTenureYears] = useState(10);

  const emi = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 100 / 12;
    const n = tenureYears * 12;
    if (!P || !r || !n) return 0;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [loanAmount, interestRate, tenureYears]);

  const totalPayment = emi * tenureYears * 12;
  const totalInterest = totalPayment - loanAmount;

  const livingTotal = livingMonths * monthlyExpense;
  const grandTotal = tuition + livingTotal;
  const inINR = grandTotal * RATES[currency];

  const budgetItems = [
    { label: "Tuition Fee", amount: tuition, color: "#3B82F6", icon: <BankIcon /> },
    { label: "Living Expenses", amount: livingTotal, color: "#10B981", icon: <SavingsIcon /> },
    { label: "Visa & Insurance", amount: 1500, color: "#F59E0B", icon: <MoneyIcon /> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 1, fontFamily: '"Outfit", sans-serif' }}>
          Financial Planner
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
          Manage your budget, explore scholarships, and plan your global education investment.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Budget Calculator */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper sx={{ 
            p: 4, borderRadius: '32px', bgcolor: 'white',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            boxShadow: '0 4px 24px rgba(0,0,0,0.03)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalcIcon color="primary" /> Cost Estimator
            </Typography>

            <Stack spacing={4}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>Target Currency</Typography>
                <TextField
                  select
                  fullWidth
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  InputProps={{ sx: { borderRadius: '16px', bgcolor: '#f8fafc', '& fieldset': { border: 'none' }, fontWeight: 700 } }}
                >
                  {Object.keys(RATES).map(c => <MenuItem key={c} value={c}>{c} — {RATES[c]} INR</MenuItem>)}
                </TextField>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>Annual Tuition ({currency})</Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={tuition}
                    onChange={(e) => setTuition(Number(e.target.value))}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { fontWeight: 900, color: '#3B82F6' } }}>{currency}</InputAdornment>,
                      sx: { borderRadius: '16px', bgcolor: '#f8fafc', '& fieldset': { border: 'none' }, fontWeight: 700 } 
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>Monthly Living ({currency})</Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={monthlyExpense}
                    onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { fontWeight: 900, color: '#10B981' } }}>{currency}</InputAdornment>,
                      sx: { borderRadius: '16px', bgcolor: '#f8fafc', '& fieldset': { border: 'none' }, fontWeight: 700 } 
                    }}
                  />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>Course Duration (Months)</Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={livingMonths}
                  onChange={(e) => setLivingMonths(Number(e.target.value))}
                  InputProps={{ sx: { borderRadius: '16px', bgcolor: '#f8fafc', '& fieldset': { border: 'none' }, fontWeight: 700 } }}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Breakdown Card */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper sx={{ 
            p: 4, borderRadius: '32px', bgcolor: '#1e293b', color: 'white',
            boxShadow: '0 20px 50px rgba(30,41,59,0.3)',
            height: '100%', display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden'
          }}>
            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', bgcolor: alpha('#3B82F6', 0.1), filter: 'blur(40px)' }} />
            
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, color: alpha('#ffffff', 0.6), textTransform: 'uppercase', letterSpacing: 1 }}>Total Investment</Typography>
            
            <Box sx={{ mb: 6 }}>
              <Typography variant="h1" sx={{ fontWeight: 900, mb: 1, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                {currency} {grandTotal.toLocaleString()}
              </Typography>
              <Typography variant="h5" sx={{ color: '#3B82F6', fontWeight: 800 }}>
                ≈ ₹{(inINR / 100000).toFixed(2)} Lakhs
              </Typography>
            </Box>

            <Stack spacing={4} sx={{ flex: 1 }}>
              {budgetItems.map(item => (
                <Box key={item.label}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(item.color, 0.15), color: item.color, display: 'flex' }}>{item.icon}</Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.label}</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 900 }}>{currency} {item.amount.toLocaleString()}</Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={(item.amount / grandTotal) * 100} 
                    sx={{ 
                      height: 8, borderRadius: 4, bgcolor: alpha('#ffffff', 0.08),
                      '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 4 }
                    }} 
                  />
                </Box>
              ))}
            </Stack>

            <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${alpha('#ffffff', 0.1)}` }}>
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<ExchangeIcon />}
                sx={{ borderRadius: '16px', py: 1.5, bgcolor: '#3B82F6', fontWeight: 800, textTransform: 'none' }}
              >
                Download Financial Report
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Scholarships */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 2 }}>Scholarship Opportunities</Typography>
          <Stack spacing={2}>
            {[
              { name: 'Global Excellence Award', amount: '5,000', match: '95%', deadline: 'June 15' },
              { name: 'Commonwealth Scholarship', amount: 'Full Tuition', match: '88%', deadline: 'July 01' },
              { name: 'STEM Leadership Grant', amount: '10,000', match: '82%', deadline: 'Aug 10' },
            ].map((s, i) => (
              <Paper key={i} sx={{ 
                p: 2.5, borderRadius: '24px', border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                display: 'flex', alignItems: 'center', gap: 2, transition: '0.2s',
                '&:hover': { transform: 'translateX(5px)', borderColor: alpha('#3B82F6', 0.2) }
              }}>
                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha('#F59E0B', 0.1), color: '#D97706', fontWeight: 900 }}>🏆</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>{s.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Value: <Box component="span" sx={{ color: '#10B981' }}>{s.amount}</Box> • Ends {s.deadline}</Typography>
                </Box>
                <Chip label={`${s.match} Match`} size="small" sx={{ fontWeight: 800, bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6' }} />
              </Paper>
            ))}
          </Stack>
        </Grid>

        {/* Education Loans */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 2 }}>Loan Assistance</Typography>
          <Paper sx={{ p: 4, borderRadius: '32px', bgcolor: alpha('#3B82F6', 0.03), border: `1px dashed ${alpha('#3B82F6', 0.2)}` }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>Prequalified Loan Partners</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 3 }}>Based on your profile, you are eligible for preferential rates from our banking partners.</Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '16px', flex: 1, textAlign: 'center', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, display: 'block', mb: 0.5 }}>STARTING AT</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#3B82F6' }}>8.5% p.a.</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '16px', flex: 1, textAlign: 'center', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, display: 'block', mb: 0.5 }}>MAX TENURE</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#3B82F6' }}>15 Years</Typography>
                </Box>
              </Stack>
              <Button fullWidth sx={{ py: 1.5, borderRadius: '14px', textTransform: 'none', fontWeight: 800, bgcolor: '#1e293b', color: 'white', '&:hover': { bgcolor: '#334155' } }}>
                Speak to Loan Expert
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* EMI Calculator */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b', mb: 3 }}>EMI Calculator</Typography>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper sx={{ p: 4, borderRadius: '32px', bgcolor: 'white', border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>Loan Amount (₹)</Typography>
                  <TextField
                    fullWidth type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    InputProps={{ startAdornment: <InputAdornment position="start" sx={{ '& .MuiTypography-root': { fontWeight: 900, color: '#3B82F6' } }}>₹</InputAdornment>, sx: { borderRadius: '16px', bgcolor: '#f8fafc', '& fieldset': { border: 'none' }, fontWeight: 700 } }}
                  />
                </Box>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>Annual Interest Rate (%)</Typography>
                    <TextField
                      fullWidth type="number" inputProps={{ step: 0.1, min: 1, max: 30 }}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment>, sx: { borderRadius: '16px', bgcolor: '#f8fafc', '& fieldset': { border: 'none' }, fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>Loan Tenure (Years)</Typography>
                    <TextField
                      fullWidth type="number" inputProps={{ step: 1, min: 1, max: 30 }}
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                      InputProps={{ endAdornment: <InputAdornment position="end">yrs</InputAdornment>, sx: { borderRadius: '16px', bgcolor: '#f8fafc', '& fieldset': { border: 'none' }, fontWeight: 700 } }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper sx={{ p: 4, borderRadius: '32px', bgcolor: '#1e293b', color: 'white', boxShadow: '0 20px 50px rgba(30,41,59,0.3)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ color: alpha('#fff', 0.5), fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Monthly EMI</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#3B82F6', mt: 0.5 }}>
                  ₹{Math.round(emi).toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Box sx={{ pt: 3, borderTop: `1px solid ${alpha('#fff', 0.1)}` }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.6), fontWeight: 600 }}>Principal Amount</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>₹{loanAmount.toLocaleString('en-IN')}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.6), fontWeight: 600 }}>Total Interest</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#F59E0B' }}>₹{Math.round(totalInterest).toLocaleString('en-IN')}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.6), fontWeight: 600 }}>Total Payment</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#10B981' }}>₹{Math.round(totalPayment).toLocaleString('en-IN')}</Typography>
                  </Stack>
                </Stack>
              </Box>
              <LinearProgress
                variant="determinate"
                value={loanAmount > 0 ? (loanAmount / totalPayment) * 100 : 0}
                sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#fff', 0.08), '& .MuiLinearProgress-bar': { bgcolor: '#3B82F6', borderRadius: 4 } }}
              />
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), textAlign: 'center' }}>
                Principal {loanAmount > 0 ? Math.round((loanAmount / totalPayment) * 100) : 0}% · Interest {loanAmount > 0 ? Math.round((totalInterest / totalPayment) * 100) : 0}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default StudentFinance;
