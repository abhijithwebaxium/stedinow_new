import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export default function BasicMenu({ buttonText, sx, startIcon, menuSx, data }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (onClick) => {
    if (typeof onClick === 'function') {
      onClick();
    }

    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={startIcon}
        sx={sx}
      >
        {buttonText}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        sx={{
          '& .MuiPaper-root': menuSx,
        }}
      >
        {data.map((entry, idx) => (
          <MenuItem key={idx} onClick={() => handleClose(entry?.onClick)}>
            {entry.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
