import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Drawer,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  styled,
  alpha,
  useTheme,
} from '@mui/material';
import {
  SmartToy as RobotIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Person as PersonIcon,
  DeleteOutline as ClearIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/userSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ChatBubble = styled(Paper)(({ theme, isassistant }) => ({
  padding: theme.spacing(1.5, 2),
  maxWidth: '85%',
  borderRadius: isassistant === 'true' ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
  backgroundColor: isassistant === 'true'
    ? theme.palette.background.paper
    : theme.palette.primary.main,
  color: isassistant === 'true' ? theme.palette.text.primary : theme.palette.primary.contrastText,
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  position: 'relative',
  marginBottom: theme.spacing(1),
}));

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: "Hello! I'm your Stedinow Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const user = useSelector(selectUser);
  const theme = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/mcp/query`,
        {
          input: userMessage.content,
          userId: user?.id,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'assistant',
            content: response.data.result.message,
            data: response.data.result.data,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: "I'm sorry, I encountered an error processing your request. Please try again.",
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="ai-assistant"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1200,
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'transform 0.2s',
        }}
      >
        <RobotIcon />
      </Fab>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.1)',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <RobotIcon />
            <Typography variant="h6" fontWeight="bold">
              Stedinow AI
            </Typography>
          </Box>
          <Box>
            <IconButton
              size="small"
              onClick={() => setMessages([{ type: 'assistant', content: "Chat cleared. How can I help?", timestamp: new Date() }])}
              sx={{ color: 'white', mr: 1 }}
            >
              <ClearIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.type === 'assistant' ? 'flex-start' : 'flex-end',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 0.5, flexDirection: msg.type === 'assistant' ? 'row' : 'row-reverse' }}>
                <Avatar 
                  sx={{ 
                    width: 28, 
                    height: 28, 
                    bgcolor: msg.type === 'assistant' ? 'secondary.main' : 'primary.dark',
                    fontSize: '0.8rem'
                  }}
                >
                  {msg.type === 'assistant' ? <RobotIcon sx={{ fontSize: 18 }} /> : <PersonIcon sx={{ fontSize: 18 }} />}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
              <ChatBubble isassistant={(msg.type === 'assistant').toString()}>
                <Typography variant="body2">{msg.content}</Typography>
              </ChatBubble>
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">Searching database...</Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            sx={{ display: 'flex', gap: 1 }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="e.g., How many active leads?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoComplete="off"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                '&.Mui-disabled': { bgcolor: alpha(theme.palette.action.disabled, 0.1) }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AIAssistant;
