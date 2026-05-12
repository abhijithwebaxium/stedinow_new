import * as React from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomComboBox = ({
  label,
  placeholder,
  name,
  data,
  onChange,
  error,
  defaultValue,
  clearValue,
  sx,
}) => {
  const [value, setValue] = React.useState(defaultValue || null);

  const handleChange = (event, newValue) => {
    setValue(clearValue ? null : newValue);
    if (onChange) {
      onChange({
        target: {
          name,
          value: newValue?.value || '',
          label: newValue?.label || ''
        },
      });
    }
  };

  return (
    <Layout>
      {error || (label && <Box sx={{ mb: 0.5 }}>{error ? error : label}</Box>)}
      <StyledAutocomplete
        value={value}
        onChange={handleChange}
        options={data || []}
        getOptionLabel={(option) => option.label || ''}
        isOptionEqualToValue={(option, value) => option.value === value?.value}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            size="small"
            error={!!error}
          />
        )}
        sx={sx}
      />
    </Layout>
  );
};

export default CustomComboBox;

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    padding: '4px 8px',
    fontSize: '0.875rem',
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

const Layout = styled('div')`
  display: flex;
  flex-flow: column nowrap;
  gap: 4px;
`;
