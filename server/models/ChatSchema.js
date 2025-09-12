import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true }
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Chat', chatSchema);
