import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  Box, 
  InputBase, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  alpha, 
  useTheme,
  Divider,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon,
  School as StudentIcon,
  Assignment as AppIcon,
  Description as DocIcon,
  Dashboard as DashIcon,
  PersonAdd as AddIcon,
  Chat as ChatIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const CommandBar = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigationItems = [
    { text: 'Dashboard', icon: <DashIcon />, path: '/dashboard', category: 'Navigation' },
    { text: 'Students', icon: <StudentIcon />, path: '/students', category: 'Navigation' },
    { text: 'Applications', icon: <AppIcon />, path: '/applications', category: 'Navigation' },
  ];

  const actionItems = [
    { text: 'Register New Student', icon: <AddIcon />, path: '/applications', action: 'add', category: 'Quick Actions' },
    { text: 'View All Documents', icon: <DocIcon />, path: '/documents', category: 'Quick Actions' },
    { text: 'Open AI Assistant', icon: <ChatIcon />, action: 'ai', category: 'Quick Actions' },
  ];

  useEffect(() => {
    if (query.length > 1) {
      handleSearch();
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/students`, { withCredentials: true });
      if (res.data.status === 'success') {
        const filtered = res.data.students
          .filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.studentId.includes(query))
          .slice(0, 5)
          .map(s => ({
            text: s.name,
            subtext: `ID: #${s.studentId} • ${s.currentPhase}`,
            icon: <StudentIcon />,
            path: `/students/${s._id}`,
            category: 'Students'
          }));
        setResults(filtered);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleKeyDown = (e) => {
    const totalItems = results.length + navigationItems.length + actionItems.length;
    if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      const allItems = [...results, ...navigationItems, ...actionItems];
      handleSelect(allItems[selectedIndex]);
    }
  };

  const handleSelect = (item) => {
    if (item.path) {
      navigate(item.path);
    }
    onClose();
    setQuery('');
  };

  const renderItems = (items, startIndex) => (
    items.map((item, index) => {
      const actualIndex = startIndex + index;
      const isSelected = selectedIndex === actualIndex;
      
      return (
        <ListItem key={actualIndex} disablePadding>
          <ListItemButton 
            selected={isSelected}
            onClick={() => handleSelect(item)}
            sx={{
              borderRadius: '12px',
              mx: 1,
              my: 0.5,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              secondary={item.subtext}
              primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }}
              secondaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
            />
            {isSelected && <ArrowIcon sx={{ fontSize: '1rem', opacity: 0.5 }} />}
          </ListItemButton>
        </ListItem>
      );
    })
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha('#FFFFFF', 0.9),
          backdropFilter: 'blur(20px) saturate(180%)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          backgroundImage: 'none',
          top: '-15%'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SearchIcon sx={{ color: 'text.secondary', opacity: 0.5 }} />
        <InputBase
          autoFocus
          fullWidth
          placeholder="Type to search students, pages or actions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ 
            fontSize: '1.1rem', 
            fontWeight: 600,
            color: 'text.primary'
          }}
        />
        <Chip label="ESC" size="small" variant="outlined" sx={{ borderRadius: '6px', fontWeight: 800, fontSize: '0.6rem', opacity: 0.5 }} />
      </Box>
      <Divider sx={{ opacity: 0.05 }} />
      <DialogContent sx={{ p: 0, maxHeight: 400 }}>
        <List sx={{ pt: 1, pb: 1 }}>
          {results.length > 0 && (
            <>
              <Typography variant="caption" sx={{ px: 3, py: 1, display: 'block', fontWeight: 800, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}>
                Search Results
              </Typography>
              {renderItems(results, 0)}
              <Divider sx={{ mx: 2, my: 1, opacity: 0.05 }} />
            </>
          )}
          
          <Typography variant="caption" sx={{ px: 3, py: 1, display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5 }}>
            Navigation
          </Typography>
          {renderItems(navigationItems, results.length)}
          
          <Divider sx={{ mx: 2, my: 1, opacity: 0.05 }} />
          
          <Typography variant="caption" sx={{ px: 3, py: 1, display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5 }}>
            Quick Actions
          </Typography>
          {renderItems(actionItems, results.length + navigationItems.length)}
        </List>
      </DialogContent>
      <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5), display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.5 }}>
          Use <Box component="span" sx={{ border: '1px solid', borderRadius: '4px', px: 0.5, py: 0.1, mx: 0.2 }}>↑↓</Box> to navigate • <Box component="span" sx={{ border: '1px solid', borderRadius: '4px', px: 0.5, py: 0.1, mx: 0.2 }}>↵</Box> to select
        </Typography>
      </Box>
    </Dialog>
  );
};

export default CommandBar;
