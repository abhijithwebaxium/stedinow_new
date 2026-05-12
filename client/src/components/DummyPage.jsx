import { Box, Typography, Button, Stack, alpha, useTheme, styled } from '@mui/material';
import { 
  RocketLaunch as RocketIcon,
  Engineering as ConstructionIcon,
  AutoAwesome as SparkleIcon,
  ChevronLeft as BackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HeroBox = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.5)
    : alpha(theme.palette.background.paper, 0.3),
  borderRadius: '40px',
  padding: theme.spacing(8, 6),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  minHeight: '60vh',
  justifyContent: 'center',
  backdropFilter: "blur(24px) saturate(180%)",
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
    filter: 'blur(80px)',
    zIndex: 0,
  }
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  width: 100,
  height: 100,
  borderRadius: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.05)} 100%)`,
  color: color,
  border: `1px solid ${alpha(color, 0.3)}`,
  marginBottom: theme.spacing(4),
  position: 'relative',
  zIndex: 1,
  boxShadow: `0 20px 40px ${alpha(color, 0.15)}`,
  animation: 'float 6s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-20px)' },
  }
}));

const DummyPage = ({ title = "Under Development", description = "We're currently building something amazing here. Stay tuned for updates!" }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <HeroBox>
        <IconWrapper color={theme.palette.primary.main}>
          <ConstructionIcon sx={{ fontSize: 48 }} />
        </IconWrapper>
        
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
            <SparkleIcon sx={{ color: 'warning.main', fontSize: 20 }} />
            <Typography variant="caption" sx={{ 
              fontWeight: 900, 
              textTransform: 'uppercase', 
              letterSpacing: '0.3em', 
              color: 'text.secondary',
              opacity: 0.8
            }}>
              Module Initialization
            </Typography>
            <SparkleIcon sx={{ color: 'warning.main', fontSize: 20 }} />
          </Stack>

          <Typography variant="h1" sx={{ 
            fontWeight: 900, 
            letterSpacing: -2, 
            mb: 2,
            background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {title}
          </Typography>

          <Typography variant="h6" sx={{ 
            color: 'text.secondary', 
            mb: 5, 
            lineHeight: 1.6,
            fontWeight: 500,
            opacity: 0.8
          }}>
            {description}
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<RocketIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: '16px',
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Return to Control Center
            </Button>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '16px',
                fontWeight: 800,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Go Back
            </Button>
          </Stack>
        </Box>
      </HeroBox>
    </Box>
  );
};

export default DummyPage;
