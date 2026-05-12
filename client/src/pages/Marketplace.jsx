import { Box, Typography, Grid, Card, CardContent, Button, Chip, alpha, useTheme, Stack } from '@mui/material';
import { 
  AccountBalance as BankIcon, 
  CurrencyExchange as ForexIcon, 
  Flight as FlightIcon,
  Shield as ShieldIcon,
  Assignment as ApplyIcon,
  Star as StarIcon
} from '@mui/icons-material';

const SERVICES = [
  {
    title: 'Education Loans',
    provider: 'Stedinow Finance Partners',
    description: 'Specialized education loans for international students with competitive interest rates and flexible repayment options.',
    icon: <BankIcon fontSize="large" />,
    color: '#7C3AED',
    badge: 'Popular',
    benefits: ['Up to 100% Funding', 'Collateral-free options', 'Fast Approval']
  },
  {
    title: 'Forex & Payments',
    provider: 'GlobalPay Solutions',
    description: 'The easiest way to pay your university tuition fees and living expenses abroad with the lowest exchange rates.',
    icon: <ForexIcon fontSize="large" />,
    color: '#FF007A',
    badge: 'New',
    benefits: ['Zero Transfer Fees', 'Same-day Settlement', 'Safe & Secure']
  },
  {
    title: 'Travel Insurance',
    provider: 'SafeJourney Insure',
    description: 'Comprehensive travel insurance covering medical emergencies, trip cancellations, and lost baggage.',
    icon: <ShieldIcon fontSize="large" />,
    color: '#10B981',
    badge: 'Essential',
    benefits: ['Global Coverage', 'COVID-19 Protection', '24/7 Support']
  },
  {
    title: 'Flight Booking',
    provider: 'Stedinow Travels',
    description: 'Exclusive student discounts on international flights with extra baggage allowance and flexible dates.',
    icon: <FlightIcon fontSize="large" />,
    color: '#3B82F6',
    benefits: ['Student Discounts', 'Extra Baggage', 'Flexible Rescheduling']
  }
];

import { styled } from '@mui/material/styles';

const GlassCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.4) 
    : alpha('#FFFFFF', 0.8),
  backdropFilter: "blur(24px) saturate(180%)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 10px 40px rgba(0,0,0,0.3)'
    : '0 10px 40px rgba(0,0,0,0.02)',
  borderRadius: "32px",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 60px rgba(0,0,0,0.5)'
      : '0 20px 60px rgba(0,0,0,0.06)',
  },
}));

const HeroBox = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.5)
    : alpha(theme.palette.background.paper, 0.3),
  borderRadius: '40px',
  padding: theme.spacing(6, 6),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(6),
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-30%',
    right: '-10%',
    width: '400px',
    height: '400px',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
    filter: 'blur(60px)',
    zIndex: 0,
  }
}));

const ServiceIconBox = styled(Box)(({ color }) => ({
  background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`,
  color: color,
  border: `1px solid ${alpha(color, 0.2)}`,
  borderRadius: '20px',
  width: 64,
  height: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 8px 24px ${alpha(color, 0.12)}`,
}));

const Marketplace = () => {
  const theme = useTheme();

  return (
    <Box sx={{ pb: 6 }}>
      {/* Hero Header */}
      <HeroBox>
        <Grid container spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h2" fontWeight={900} gutterBottom sx={{ letterSpacing: -1.5, color: 'text.primary' }}>
              Financial Marketplace
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: 600, lineHeight: 1.6 }}>
              Premium services for your study abroad journey. Access specialized financial tools with <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>exclusive student benefits</Box>.
            </Typography>
          </Grid>
        </Grid>
      </HeroBox>

      <Typography variant="caption" sx={{ 
        px: 2, 
        mb: 3, 
        display: 'block', 
        fontWeight: 900, 
        textTransform: 'uppercase', 
        letterSpacing: '0.2em', 
        color: 'text.secondary',
        opacity: 0.6
      }}>
        Featured Opportunities
      </Typography>

      <Grid container spacing={4}>
        {SERVICES.map((service, index) => (
          <Grid item xs={12} md={6} key={index}>
            <GlassCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                  <ServiceIconBox color={service.color}>
                    {service.icon}
                  </ServiceIconBox>
                  {service.badge && (
                    <Chip 
                      label={service.badge} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(service.color, 0.1), 
                        color: service.color, 
                        fontWeight: 900,
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        px: 1,
                        borderRadius: '10px',
                        border: `1px solid ${alpha(service.color, 0.2)}`
                      }} 
                    />
                  )}
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: -1 }}>
                  {service.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 3, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Partner: {service.provider}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.7, fontWeight: 500 }}>
                  {service.description}
                </Typography>

                <Stack spacing={2} sx={{ mb: 5 }}>
                  {service.benefits.map((benefit, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: service.color,
                        boxShadow: `0 0 10px ${service.color}`
                      }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{benefit}</Typography>
                    </Box>
                  ))}
                </Stack>

                <Button 
                  fullWidth 
                  variant="contained" 
                  disableElevation
                  startIcon={<ApplyIcon />}
                  sx={{ 
                    bgcolor: service.color, 
                    color: 'white',
                    py: 2, 
                    borderRadius: '18px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 800,
                    boxShadow: `0 12px 24px ${alpha(service.color, 0.25)}`,
                    '&:hover': {
                      bgcolor: service.color,
                      transform: 'scale(1.02)',
                      boxShadow: `0 16px 32px ${alpha(service.color, 0.35)}`,
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Initiate Application
                </Button>
              </CardContent>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Marketplace;
