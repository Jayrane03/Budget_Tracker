// routes/chatRoutes.js
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

router.post('/bot', async (req, res) => {
  try {
    const { message } = req.body;
    const result = await model.generateContent(message);
    const response = result.response.text();
    res.json({ reply: response });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: "AI error", details: err.message });
  }
});

export default router;
