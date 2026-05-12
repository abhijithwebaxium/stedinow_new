import * as React from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

export default function CustomInput({
  label,
  placeholder,
  type,
  onChange,
  value,
  name,
  error,
  startIcon,
  className,
  disabled,
  iconSx,
}) {
  return (
    <StyledTextField
      fullWidth
      size="small"
      label={label}
      placeholder={placeholder}
      type={type}
      value={value}
      name={name}
      onChange={onChange}
      error={!!error}
      helperText={error}
      disabled={disabled}
      className={className}
      InputProps={{
        startAdornment: startIcon ? (
          <span style={{ marginRight: 8, display: 'flex', alignItems: 'center' }}>
            {startIcon}
          </span>
        ) : undefined,
      }}
      sx={{
        '& .MuiInputBase-root': {
          fontSize: '0.875rem',
        },
      }}
    />
  );
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderRadius: '8px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));
