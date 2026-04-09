import mongoose from "mongoose";

const blockchainTxSchema = new mongoose.Schema(
  {
    buyer: String,
    seller: String,
    kwh: Number,
    price: Number,
    txHash: String,
    timestamp: Date,
  },
  { timestamps: true }
);

export const BlockchainTx = mongoose.model("BlockchainTx", blockchainTxSchema);
