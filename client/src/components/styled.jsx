import { styled, alpha } from '@mui/material/styles';
import { Box, Card } from '@mui/material';
import { brand, gray } from '../theme/shared/themePrimitives';

/**
 * HeroBox - Premium page header container with glassmorphism and subtle gradients.
 */
export const HeroBox = styled(Box)(({ theme }) => ({
  background: (theme.vars || theme).palette.mode === 'dark'
    ? alpha('#121214', 0.4)
    : alpha('#FFFFFF', 0.3),
  borderRadius: '40px',
  padding: theme.spacing(6, 6),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  backdropFilter: "blur(24px) saturate(180%)",
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-30%',
    right: '-10%',
    width: '400px',
    height: '400px',
    background: `radial-gradient(circle, ${alpha(brand[400], 0.08)} 0%, transparent 70%)`,
    filter: 'blur(60px)',
    zIndex: 0,
  },
  ...theme.applyStyles('dark', {
    background: `linear-gradient(135deg, ${alpha('#121214', 0.8)} 0%, ${alpha('#0A0A0B', 0.9)} 100%)`,
    borderColor: alpha(theme.palette.divider, 0.15),
    boxShadow: `0 8px 32px 0 ${alpha('#000', 0.4)}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: `linear-gradient(90deg, transparent, ${alpha(brand[400], 0.3)}, transparent)`,
      zIndex: 1,
    }
  })
}));

/**
 * GlassCard - Premium content container with glassmorphism effects.
 */
export const GlassCard = styled(Box)(({ theme }) => ({
  background: (theme.vars || theme).palette.mode === 'dark' 
    ? alpha('#121214', 0.6) 
    : alpha('#FFFFFF', 0.8),
  backdropFilter: "blur(24px) saturate(180%)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: "32px",
  overflow: 'hidden',
  boxShadow: (theme.vars || theme).palette.mode === 'dark'
    ? `0 8px 32px 0 ${alpha('#000', 0.4)}`
    : `0 8px 32px 0 ${alpha(theme.palette.grey[300], 0.3)}`,
  ...theme.applyStyles('dark', {
    background: alpha('#121214', 0.8),
    borderColor: alpha(theme.palette.divider, 0.1),
    boxShadow: `0 16px 48px ${alpha('#000', 0.6)}`,
  })
}));

/**
 * StyledFormContainer - Glassmorphism container for forms and modals.
 */
export const StyledFormContainer = styled(Box)(({ theme }) => ({
  background: (theme.vars || theme).palette.mode === 'dark'
    ? alpha('#121214', 0.8)
    : alpha('#FFFFFF', 0.9),
  backdropFilter: "blur(24px) saturate(180%)",
  borderRadius: '32px',
  padding: theme.spacing(4),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  ...theme.applyStyles('dark', {
    borderColor: alpha(theme.palette.divider, 0.2),
    boxShadow: `0 24px 48px ${alpha('#000', 0.5)}`,
  })
}));

/**
 * PremiumButton - A highly aesthetic button with glassmorphism and smooth transitions.
 */
export const PremiumButton = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.2, 3),
  borderRadius: '14px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: theme.palette.mode === 'dark'
    ? alpha(brand[500], 0.15)
    : alpha(brand[500], 0.08),
  color: brand[500],
  border: `1px solid ${alpha(brand[500], 0.2)}`,
  position: 'relative',
  overflow: 'hidden',
  userSelect: 'none',
  '&:hover': {
    background: brand[500],
    color: '#fff',
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px ${alpha(brand[500], 0.3)}`,
    borderColor: brand[500],
  },
  '&:active': {
    transform: 'translateY(0)',
  }
}));
