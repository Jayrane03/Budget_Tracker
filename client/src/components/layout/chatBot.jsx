import React, { useState } from 'react';
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
  Slide,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

const BotChat = () => {
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newChat = [...chat, { role: 'user', text: input }];
    setChat(newChat);
    setInput('');
    setError(null);

    try {
      const res = await axios.post('/api/chat/bot', { message: input });
      const botResponse = res.data.reply || "🤖 Sorry, I didn't quite catch that.";
      setChat([...newChat, { role: 'bot', text: botResponse }]);
    } catch (err) {
      setChat([...newChat, { role: 'bot', text: '❌ Error getting response from AI.' }]);
      setError(err.response?.data?.error || '❌ AI service error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 5,
        px: 3,
        py: 4,
        borderRadius: 5,
        background: 'linear-gradient(to bottom, #f5f7fa, #c3cfe2)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        textAlign="center"
        sx={{
          mb: 2,
          background: 'linear-gradient(to right, #7b61ff, #4db8ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
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

      <Box
        sx={{
          maxHeight: 360,
          overflowY: 'auto',
          pr: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          mb: 2,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#ccc',
            borderRadius: 8,
          },
        }}
      >
        {chat.map((msg, idx) => (
          <Slide in key={idx} direction="up" mountOnEnter unmountOnExit>
            <Box
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f8f9fa',
                  borderRadius: 3,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: msg.role === 'user' ? '#1976d2' : '#7b61ff',
                      width: 30,
                      height: 30,
                    }}
                  >
                    {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                  </Avatar>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    {msg.text}
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          </Slide>
        ))}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mt: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask something like 'What did I spend the most on this month?'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          sx={{
            borderRadius: 3,
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          }}
          size="small"
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          sx={{
            bgcolor: '#7b61ff',
            color: 'white',
            '&:hover': { bgcolor: '#6848d9' },
            borderRadius: 3,
            p: 1.5,
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default BotChat;
