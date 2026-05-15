import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, IconButton, Stack, alpha, useTheme,
  CircularProgress, Paper, Avatar, Chip,
} from '@mui/material';
import { Send as SendIcon, SupportAgent as CounselorIcon } from '@mui/icons-material';
import axios from 'axios';
import { initiateSocketConnection, disconnectSocket, joinStudentRoom } from '../../utils/socket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const StudentMessages = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/student-portal/messages`, { withCredentials: true });
      if (res.data.status === 'success') setMessages(res.data.messages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markAsRead = async () => {
    try {
      await axios.patch(`${API_URL}/api/student-portal/messages/read`, {}, { withCredentials: true });
    } catch (e) { console.error(e); }
  };

  useEffect(() => { 
    fetchMessages(); 
    markAsRead();
    
    if (user.id) {
      const socket = initiateSocketConnection();
      joinStudentRoom(user.id);

      socket.on('new_message', (msg) => {
        // Only add if it's from counselor (student's own message added after API call)
        if (msg.sender === 'counselor') {
          setMessages(current => {
            const exists = current.some(m => m._id === msg._id);
            if (exists) return current;
            return [...current, msg];
          });
          // Mark as read immediately since we are looking at it
          markAsRead();
        }
      });

      return () => {
        disconnectSocket();
      };
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const res = await axios.post(`${API_URL}/api/student-portal/messages`, { message: text }, { withCredentials: true });
      if (res.data.status === 'success') {
        setMessages(prev => [...prev, res.data.message]);
      }
    } catch { setInput(text); }
    finally { setSending(false); }
  };

  const formatTime = (date) => new Date(date).toLocaleString('en', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 0.5, fontFamily: '"Outfit", sans-serif' }}>
          Messages
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
          Direct communication with your counselor.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{
        flex: 1, borderRadius: '28px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
      }}>
        {/* Header */}
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`, bgcolor: '#f8fafc' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6', width: 38, height: 38 }}>
              <CounselorIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b' }}>Your Counselor</Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>Stedinow Team</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Messages */}
        <Box ref={scrollRef} sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f8fafc' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <CircularProgress size={28} />
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 2 }}>
              <Typography sx={{ fontSize: '2.5rem' }}>💬</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>
                No messages yet. Send a message to your counselor!
              </Typography>
            </Box>
          ) : (
            messages.map((msg) => {
              const isStudent = msg.sender === 'student';
              return (
                <Box key={msg._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: isStudent ? 'flex-end' : 'flex-start' }}>
                  {!isStudent && (
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, mb: 0.5, ml: 0.5, fontSize: '0.68rem' }}>
                      {msg.senderName}
                    </Typography>
                  )}
                  <Box sx={{
                    maxWidth: '72%', px: 2.5, py: 1.8,
                    borderRadius: isStudent ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    bgcolor: isStudent ? '#3B82F6' : 'white',
                    color: isStudent ? 'white' : '#1e293b',
                    boxShadow: isStudent ? '0 4px 14px rgba(59,130,246,0.22)' : '0 2px 8px rgba(0,0,0,0.05)',
                    border: isStudent ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.07)}`,
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6, fontSize: '0.875rem' }}>
                      {msg.message}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, mt: 0.4, mx: 0.5, fontSize: '0.66rem' }}>
                    {formatTime(msg.createdAt)}
                  </Typography>
                </Box>
              );
            })
          )}
        </Box>

        {/* Input */}
        <Box sx={{ p: 2.5, bgcolor: 'white', borderTop: `1px solid ${alpha(theme.palette.divider, 0.06)}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message to your counselor..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={sending}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: '#f1f5f9', '& fieldset': { border: 'none' } } }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!input.trim() || sending}
              sx={{ bgcolor: '#3B82F6', color: 'white', width: 38, height: 38, flexShrink: 0, '&:hover': { bgcolor: '#2563EB' }, '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' } }}
            >
              {sending ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <SendIcon sx={{ fontSize: 17 }} />}
            </IconButton>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentMessages;
