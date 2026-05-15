import { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, IconButton, TextField, Stack, Avatar,
  alpha, useTheme, Fab, Zoom, CircularProgress, Chip, Badge,
} from '@mui/material';
import {
  ChatBubbleOutline as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SupportAgent as CounselorIcon,
  CheckCircle as SavedIcon,
  AutoAwesome as AIIcon,
  AttachFile as AttachIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const StudentAIChat = ({ student, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [pendingAlert, setPendingAlert] = useState(null); // { message, notifIds }
  const theme = useTheme();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load chat history from server on mount, fallback to localStorage
  useEffect(() => {
    if (!student?._id) return;

    const loadHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/student-portal/chat/history`, { withCredentials: true });
        if (res.data.status === 'success' && res.data.messages?.length > 0) {
          setMessages(res.data.messages.map(m => ({
            text: m.content,
            isBot: m.type === 'assistant',
            time: m.createdAt,
          })));
          // They've chatted before — don't auto-open again
          localStorage.setItem(`sarah_auto_opened_${student._id}`, '1');
        } else {
          const saved = localStorage.getItem(`sarah_chat_${student._id}`);
          if (saved) {
            try { setMessages(JSON.parse(saved)); } catch {}
            localStorage.setItem(`sarah_auto_opened_${student._id}`, '1');
          }
        }
      } catch {
        const saved = localStorage.getItem(`sarah_chat_${student._id}`);
        if (saved) {
          try { setMessages(JSON.parse(saved)); } catch {}
        }
      } finally {
        setHistoryLoaded(true);
      }
    };

    loadHistory();
  }, [student?._id]);

  // Detect unread document rejection notifications — queue a proactive Sarah message
  useEffect(() => {
    if (!student?._id || !historyLoaded) return;

    const rejections = (student.notifications || []).filter(
      n => n.type === 'document_rejected' && !n.read
    );
    if (rejections.length === 0) return;

    const handledKey = `sarah_handled_alerts_${student._id}`;
    const handled = JSON.parse(localStorage.getItem(handledKey) || '[]');
    const unhandled = rejections.filter(n => !handled.includes(String(n._id)));
    if (unhandled.length === 0) return;

    const firstName = student.name?.split(' ')[0] || 'there';
    let alertMsg;
    if (unhandled.length === 1) {
      alertMsg = `Hi ${firstName}! 📋 Your counselor reviewed a document and left feedback: "${unhandled[0].message}" — I can walk you through how to fix and re-upload it. Just ask me!`;
    } else {
      const bullets = unhandled.map(n => `• ${n.message}`).join('\n');
      alertMsg = `Hi ${firstName}! 📋 Your counselor has reviewed ${unhandled.length} documents and left feedback:\n${bullets}\n\nI'm here to help you get each one sorted — just let me know where to start!`;
    }
    setPendingAlert({ message: alertMsg, notifIds: unhandled.map(n => String(n._id)) });
  }, [student, historyLoaded]);

  // Auto-open: on first ever visit OR when there's a pending rejection alert
  useEffect(() => {
    if (!student || !historyLoaded) return;

    const alreadyShown = localStorage.getItem(`sarah_auto_opened_${student._id}`);

    // Pending alert takes priority — open after a short delay regardless
    if (pendingAlert) {
      const timer = setTimeout(() => {
        setOpen(true);
        injectAlert(pendingAlert);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // First-visit greeting
    if (alreadyShown) return;
    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(`sarah_auto_opened_${student._id}`, '1');
      const firstName = student.name?.split(' ')[0] || 'there';
      const missing = [];
      if (!student.personalInfo?.dob) missing.push('Date of Birth');
      if (!student.personalInfo?.nationality) missing.push('Nationality');
      if (!student.personalInfo?.passportNumber) missing.push('Passport Number');
      let msg = `Hi ${firstName}! I'm Sarah, your AI-powered academic counselor. 🎓 I'm here to guide you through your entire study abroad journey!`;
      if (missing.length > 0) {
        msg += ` I noticed your profile is missing ${missing.slice(0, 2).join(' and ')} — just tell me and I'll update it for you instantly!`;
      } else {
        msg += ` Your profile looks great! Ask me anything about universities, visas, applications, or documents.`;
      }
      setMessages([{ text: msg, isBot: true, time: new Date().toISOString() }]);
    }, 3000);
    return () => clearTimeout(timer);
  }, [student, historyLoaded, pendingAlert]);

  // Backup chat to localStorage on every change
  useEffect(() => {
    if (!student?._id || messages.length === 0) return;
    localStorage.setItem(`sarah_chat_${student._id}`, JSON.stringify(messages.slice(-60)));
  }, [messages, student?._id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const injectAlert = (alert) => {
    if (!alert || !student?._id) return;
    setMessages(prev => [...prev, { text: alert.message, isBot: true, time: new Date().toISOString(), isAlert: true }]);
    const handledKey = `sarah_handled_alerts_${student._id}`;
    const handled = JSON.parse(localStorage.getItem(handledKey) || '[]');
    localStorage.setItem(handledKey, JSON.stringify([...new Set([...handled, ...alert.notifIds])]));
    localStorage.setItem(`sarah_auto_opened_${student._id}`, '1');
    setPendingAlert(null);
  };

  const handleOpen = () => {
    setOpen(true);
    if (pendingAlert) injectAlert(pendingAlert);
  };

  const handleClose = () => {
    setOpen(false);
    if (student?._id) localStorage.setItem(`sarah_auto_opened_${student._id}`, '1');
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue.trim();
    setMessages(prev => [...prev, { text, isBot: false, time: new Date().toISOString() }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/student-portal/chat`,
        { message: text, history: messages.slice(-12) },
        { withCredentials: true }
      );
      if (res.data.status === 'success') {
        setMessages(prev => [...prev, {
          text: res.data.message,
          isBot: true,
          time: new Date().toISOString(),
          profileUpdated: res.data.profileUpdated,
        }]);
        if (res.data.profileUpdated) {
          setProfileSaved(true);
          setTimeout(() => setProfileSaved(false), 3500);
          if (onUpdate) onUpdate();
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        text: "I'm having a little trouble right now. Please try again in a moment!",
        isBot: true,
        time: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || isLoading || isUploading) return;
    
    // Reset input
    e.target.value = '';

    setMessages(prev => [...prev, { 
      text: `[Uploading: ${file.name}]`, 
      isBot: false, 
      time: new Date().toISOString() 
    }]);
    
    setIsUploading(true);
    const fd = new FormData();
    fd.append('document', file);

    try {
      const res = await axios.post(
        `${API_URL}/api/student-portal/chat/upload`,
        fd,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      if (res.data.status === 'success') {
        setMessages(prev => [...prev, {
          text: res.data.message,
          isBot: true,
          time: new Date().toISOString(),
          profileUpdated: res.data.profileUpdated,
        }]);
        
        if (res.data.profileUpdated) {
          setProfileSaved(true);
          setTimeout(() => setProfileSaved(false), 3500);
          if (onUpdate) onUpdate();
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        text: "Sorry, I couldn't process that document. Please make sure it's a clear photo or PDF and try again!",
        isBot: true,
        time: new Date().toISOString(),
      }]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Zoom in={!open}>
        <Fab
          onClick={handleOpen}
          sx={{
            position: 'fixed', bottom: 32, right: 32,
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            boxShadow: pendingAlert
              ? '0 10px 30px rgba(239,68,68,0.45)'
              : '0 10px 30px rgba(59,130,246,0.45)',
            color: 'white',
            animation: pendingAlert ? 'sarahPulse 1.8s ease-in-out infinite' : 'none',
            '&:hover': { background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)' },
          }}
        >
          <Badge
            badgeContent={pendingAlert ? '!' : 0}
            color="error"
            sx={{ '& .MuiBadge-badge': { fontWeight: 900, fontSize: '0.7rem', minWidth: 18, height: 18 } }}
          >
            <ChatIcon />
          </Badge>
        </Fab>
      </Zoom>
      <style>{`
        @keyframes sarahPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>

      <Zoom in={open}>
        <Paper
          elevation={0}
          sx={{
            position: 'fixed', bottom: 32, right: 32,
            width: { xs: 'calc(100vw - 32px)', sm: 390 },
            height: 570,
            borderRadius: '28px',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 30px 70px rgba(0,0,0,0.2)',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            zIndex: 1300,
          }}
        >
          {/* Header */}
          <Box sx={{
            p: 2.5,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: alpha('#3B82F6', 0.2), color: '#60A5FA', border: '2px solid rgba(255,255,255,0.08)', width: 40, height: 40 }}>
                <CounselorIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Sarah</Typography>
                  <Chip
                    label="AI"
                    size="small"
                    icon={<AIIcon sx={{ fontSize: '11px !important', color: '#93c5fd !important' }} />}
                    sx={{ height: 17, fontSize: '0.58rem', fontWeight: 800, bgcolor: alpha('#3B82F6', 0.25), color: '#93c5fd', '& .MuiChip-label': { px: 0.5 }, '& .MuiChip-icon': { ml: 0.5 } }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }}>Academic Counselor</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              {profileSaved && (
                <Chip
                  label="Saved!"
                  size="small"
                  icon={<SavedIcon sx={{ fontSize: '13px !important', color: '#34d399 !important' }} />}
                  sx={{ bgcolor: alpha('#10B981', 0.2), color: '#34d399', fontWeight: 700, fontSize: '0.68rem' }}
                />
              )}
              <IconButton size="small" onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: 'white' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Messages */}
          <Box
            ref={scrollRef}
            sx={{
              flex: 1, p: 2.5, overflowY: 'auto', bgcolor: '#f8fafc',
              display: 'flex', flexDirection: 'column', gap: 2,
            }}
          >
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.isBot ? 'flex-start' : 'flex-end' }}>
                <Box sx={{
                  maxWidth: '85%', px: 2.5, py: 1.8,
                  borderRadius: msg.isBot ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                  bgcolor: msg.isBot ? 'white' : '#3B82F6',
                  color: msg.isBot ? '#1e293b' : 'white',
                  boxShadow: msg.isBot ? '0 2px 10px rgba(0,0,0,0.05)' : '0 4px 16px rgba(59,130,246,0.25)',
                  border: msg.isBot ? `1px solid ${alpha(theme.palette.divider, 0.07)}` : 'none',
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.65, fontSize: '0.875rem' }}>
                    {msg.text}
                  </Typography>
                </Box>
                {msg.profileUpdated && (
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5, ml: 0.5 }}>
                    <SavedIcon sx={{ fontSize: 12, color: '#10B981' }} />
                    <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700, fontSize: '0.68rem' }}>
                      Profile updated automatically
                    </Typography>
                  </Stack>
                )}
              </Box>
            ))}
            {isLoading && (
              <Box sx={{
                alignSelf: 'flex-start', px: 2.5, py: 1.8,
                borderRadius: '20px 20px 20px 4px',
                bgcolor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                border: `1px solid ${alpha(theme.palette.divider, 0.07)}`,
              }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={13} sx={{ color: '#3B82F6' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>Sarah is thinking...</Typography>
                </Stack>
              </Box>
            )}
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, bgcolor: 'white', borderTop: `1px solid ${alpha(theme.palette.divider, 0.07)}` }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                sx={{ color: '#64748b', '&:hover': { color: '#3B82F6', bgcolor: alpha('#3B82F6', 0.05) } }}
              >
                <AttachIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <TextField
                inputRef={inputRef}
                fullWidth
                size="small"
                placeholder="Ask Sarah anything..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px', bgcolor: '#f1f5f9',
                    '& fieldset': { border: 'none' },
                    fontSize: '0.875rem',
                  },
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading || isUploading}
                sx={{
                  bgcolor: '#3B82F6', color: 'white', width: 38, height: 38, flexShrink: 0,
                  '&:hover': { bgcolor: '#2563EB' },
                  '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
                }}
              >
                {isUploading || (isLoading && messages.length > 0 && !messages[messages.length-1].isBot) ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SendIcon sx={{ fontSize: 17 }} />
                )}
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      </Zoom>
    </>
  );
};

export default StudentAIChat;
