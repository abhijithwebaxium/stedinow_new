import { useState, useEffect, useRef } from 'react';
import { enqueueSnackbar } from 'notistack';
import {
  Box,
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
  Stack,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  ArrowBack as BackIcon,
  NotificationsActive as AlertIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { initiateSocketConnection, disconnectSocket, joinAdminRoom, getSocket } from '../utils/socket';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/userSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const MessageBubble = styled(Paper)(({ theme, isadmin }) => ({
  padding: theme.spacing(1.5, 2),
  maxWidth: '80%',
  borderRadius: isadmin === 'true' ? '16px 16px 0 16px' : '16px 16px 16px 0',
  backgroundColor: isadmin === 'true' ? theme.palette.primary.main : theme.palette.background.paper,
  color: isadmin === 'true' ? 'white' : theme.palette.text.primary,
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  border: isadmin === 'false' ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
  marginBottom: theme.spacing(1),
}));

const AdminMessageCenter = ({ open, onClose }) => {
  const theme = useTheme();
  const [chats, setChats] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/students/messages/all`, { withCredentials: true });
      if (res.data.status === 'success') {
        setChats(res.data.chats);
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  };

  const fetchMessages = async (studentId) => {
    try {
      setMsgLoading(true);
      const res = await axios.get(`${API_URL}/api/students/${studentId}/messages`, { withCredentials: true });
      if (res.data.status === 'success') {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setMsgLoading(false);
    }
  };

  const markAsRead = async (studentId) => {
    try {
      await axios.patch(`${API_URL}/api/students/${studentId}/messages/read`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchChats();
      
      const socket = initiateSocketConnection();
      joinAdminRoom();

      socket.on('new_message', (msg) => {
        // If message is from a student, we might need to update the chat list
        if (msg.sender === 'student') {
          fetchChats(); // Refresh the whole list for unread counts and sorting
          
          // If we are currently chatting with THIS student, add to messages
          if (selectedStudent && selectedStudent._id === msg.student._id) {
            setMessages(current => {
              const exists = current.some(m => m._id === msg._id);
              if (exists) return current;
              return [...current, msg];
            });
            // Mark as read immediately since we are looking at it
            markAsRead(msg.student._id);
          }
        }
      });

      socket.on('messages_read', () => {
        fetchChats(); // Update unread counts in the list
      });

      return () => {
        disconnectSocket();
      };
    }
  }, [open, selectedStudent]);

  useEffect(() => {
    if (selectedStudent) {
      fetchMessages(selectedStudent._id);
      markAsRead(selectedStudent._id);
    }
  }, [selectedStudent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedStudent) return;
    try {
      const text = replyText;
      setReplyText("");
      const res = await axios.post(
        `${API_URL}/api/students/${selectedStudent._id}/messages`,
        { message: text },
        { withCredentials: true }
      );
      if (res.data.status === 'success') {
        setMessages(prev => [...prev, res.data.message]);
      }
    } catch (err) {
      enqueueSnackbar("Failed to send message", { variant: 'error' });
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {selectedStudent && (
            <IconButton size="small" onClick={() => setSelectedStudent(null)} sx={{ color: 'white' }}>
              <BackIcon />
            </IconButton>
          )}
          <ChatIcon />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {selectedStudent ? selectedStudent.name : "Message Center"}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {!selectedStudent ? (
          <List disablePadding>
            {chats.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No conversations yet.</Typography>
              </Box>
            ) : (
              chats.map((chat) => (
                <Box key={chat.student._id}>
                  <ListItemButton onClick={() => setSelectedStudent(chat.student)}>
                    <ListItemAvatar>
                      <Badge 
                        color="error" 
                        badgeContent={chat.unreadCount} 
                        invisible={chat.unreadCount === 0}
                        sx={{ '& .MuiBadge-badge': { fontWeight: 900 } }}
                      >
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                          {chat.student.name.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={chat.student.name}
                      secondary={chat.lastMessage?.message}
                      primaryTypographyProps={{ fontWeight: chat.unreadCount > 0 ? 800 : 600 }}
                      secondaryTypographyProps={{ 
                        noWrap: true, 
                        fontWeight: chat.unreadCount > 0 ? 700 : 400,
                        color: chat.unreadCount > 0 ? 'text.primary' : 'text.secondary'
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(chat.lastMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </ListItemButton>
                  <Divider sx={{ opacity: 0.5 }} />
                </Box>
              ))
            )}
          </List>
        ) : (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {msgLoading && messages.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>
            ) : (
              messages.map((msg, i) => (
                <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'counselor' ? 'flex-end' : 'flex-start' }}>
                  <MessageBubble isadmin={(msg.sender === 'counselor').toString()}>
                    <Typography variant="body2">{msg.message}</Typography>
                  </MessageBubble>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mx: 1 }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input - only when student selected */}
      {selectedStudent && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <form onSubmit={handleSend}>
            <Stack direction="row" spacing={1}>
              <TextField 
                fullWidth 
                size="small" 
                placeholder="Type your message..." 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoComplete="off"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <IconButton color="primary" type="submit" disabled={!replyText.trim()}>
                <SendIcon />
              </IconButton>
            </Stack>
          </form>
        </Box>
      )}
    </Drawer>
  );
};

export default AdminMessageCenter;
