// models/Transaction.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TransactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true, // removes extra spaces
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Avoid model overwrite issues in dev with hot reload
const Transaction =
  mongoose.models.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
