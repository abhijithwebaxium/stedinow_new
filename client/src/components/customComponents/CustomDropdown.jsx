import * as React from 'react';
import { Box, Paper, Button, ClickAwayListener } from '@mui/material';

export default function CustomDropdown({
  buttonText,
  sx,
  startIcon,
  menuSx,
  content,
  triggerClose,
}) {
  const initialRender = React.useRef(true);

  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    if (!initialRender.current) {
      handleClickAway();
    } else {
      initialRender.current = false;
    }
  }, [triggerClose]);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Button onClick={handleClick} startIcon={startIcon} sx={sx}>
          {buttonText}
        </Button>

        {open && (
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              left: '-3px',
              zIndex: 10,
              mt: 1,
              ...menuSx,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                '& > :not(style)': {
                  width: '100%',
                },
              }}
            >
              <Paper elevation={3}>{content}</Paper>
            </Box>
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
}
