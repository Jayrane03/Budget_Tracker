// routes/chatRoutes.js
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
import Chat from '../models/ChatSchema.js';
import { analyzeSpending, predictBudget } from '../config/financeDetails.js';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY||'AIzaSyBBi5_ur6kUA-fmE9OIvnkyHXxDpNlSt6Y');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// GET /api/chat/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id }).sort({ createdAt: 1 });
    res.json({ chats });
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ msg: "Server error fetching chat history" });
  }
});

// DELETE /api/chat/clear-chat
router.delete('/clear-chat', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: 'User not authenticated' });
    }

    const result = await Chat.deleteMany({ userId: req.user.id });
    console.log('Chat delete result:', result);

    res.status(200).json({
      message: 'Chat history cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error clearing chat:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/chat/bot
router.post('/bot', authMiddleware, async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message || !userId) {
    return res.status(400).json({ reply: "Please provide a message and user data." });
  }

  try {
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ reply: "User not found." });

    const transactions = user.transactions || [];
    const income = user.income || 0;

    const analysis = analyzeSpending(transactions);
    const budget = predictBudget(transactions, income);

    const prompt = `
      You are a personal budget assistant.
      User: ${user.name}
      Income: ${income}
      Transactions: ${JSON.stringify(transactions)}
      Spending Analysis: ${JSON.stringify(analysis)}
      Budget Recommendations: ${JSON.stringify(budget)}
      User Message: ${message}
      Please provide a clear, actionable response with advice.
    `;

    const result = await model.generateContent(prompt);
    const botReply = result.response?.text() || "🤖 I don't have a response for that.";

    const newChat = new Chat({
      userId,
      messages: [
        { role: 'user', text: message },
        { role: 'bot', text: botReply }
      ]
    });
    await newChat.save();

    res.json({ reply: botReply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "Server error, please try again later." });
  }
});

export default router;
