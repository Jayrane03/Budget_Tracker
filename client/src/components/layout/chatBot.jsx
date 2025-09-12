import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Divider,
  Avatar,
  Stack,
  Alert,
  Fade,
  Slide
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { Delete } from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import config from '../../services/helper';

const BotChat = () => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const chatEndRef = useRef(null);

  // Scroll to bottom whenever chat updates
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${config.BASE_URL}/api/chat/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.chats) setChat(res.data.chats);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };

    fetchChatHistory();
  }, [isAuthenticated]);

  // Scroll when chat changes
  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  // Clear chat messages
  const clearChat = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.BASE_URL}/api/chat/clear-chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChat([]);
      setSuccess("Chat Clear Successfully !");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err.message || 'Something went wrong.');
    }
  };

  // Send user message
  const handleSend = async () => {
    if (!input.trim() || !isAuthenticated) return;

    const userMessage = input;
    setChat((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${config.BASE_URL}/api/chat/bot`,
        { message: userMessage, userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChat((prev) => [
        ...prev,
        { role: 'bot', text: res.data.reply || "🤖 I don't have a response." }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get response. Please try again later.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  if (loading) return <Typography>Loading chat...</Typography>;

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 5,
        px: 3,
        py: 4,
        borderRadius: 5,
        background: 'linear-gradient(to bottom, #f5f7fa, #c3cfe2)'
      }}
    >
      <Typography
        variant="h5"
        textAlign="center"
        sx={{
          mb: 2,
          background: 'linear-gradient(to right, #7b61ff, #4db8ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        🤖 Budget AI Assistant
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {error && (
        <Fade in>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Fade>
      )}
{success && (
        <Fade in>
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        </Fade>
      )}
      <Box
        sx={{
          maxHeight: 360,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          mb: 2
        }}
      >
        {chat.length === 0 && (
          <Typography sx={{ textAlign: 'center', color: '#555' }}>
            No messages yet. Say hi!
          </Typography>
        )}

        {chat.map((msg, idx) => (
          <Slide
            key={idx}
            direction="up"
            in={true}
            mountOnEnter
            unmountOnExit
            timeout={{ enter: 300, exit: 100 }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f8f9fa',
                  borderRadius: 3
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: msg.role === 'user' ? '#1976d2' : '#7b61ff',
                      width: 30,
                      height: 30
                    }}
                  >
                    {msg.role === 'user' ? (
                      <PersonIcon fontSize="small" />
                    ) : (
                      <SmartToyIcon fontSize="small" />
                    )}
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{ wordBreak: 'break-word', color: '#000' }}
                  >
                    {msg.text}
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          </Slide>
        ))}

        <div ref={chatEndRef} />
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          size="small"
          placeholder="Type a message..."
          sx={{
            color: '#00ffd5',
            backgroundColor: 'black',
            input: { color: 'white' }
          }}
        />
        <IconButton
          onClick={handleSend}
          sx={{ bgcolor: '#7b61ff', color: 'white', '&:hover': { bgcolor: '#6848d9' } }}
        >
          <SendIcon />
        </IconButton>
        <IconButton
          onClick={clearChat}
          sx={{ bgcolor: '#7b61ff', color: 'white', '&:hover': { bgcolor: '#6848d9' } }}
        >
          <Delete />
        </IconButton>
      </Box>
    </Box>
  );
};

export default BotChat;
