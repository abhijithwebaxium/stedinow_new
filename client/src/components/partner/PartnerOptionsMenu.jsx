import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function PartnerOptionsMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/partner-portal/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('partner');
      navigate('/partner/login');
    }
  };

  const handleProfile = () => {
    handleClose();
    navigate('/partner/profile');
  };

  return (
    <>
      <IconButton
        aria-label="options"
        onClick={handleClick}
        sx={{ color: 'text.secondary' }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'options-button',
        }}
      >
        <MenuItem onClick={handleProfile}>
          <AccountCircleRoundedIcon sx={{ mr: 1 }} fontSize="small" />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutRoundedIcon sx={{ mr: 1 }} fontSize="small" />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
