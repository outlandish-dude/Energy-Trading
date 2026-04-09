import express from "express";
import { BlockchainTx } from "../models/BlockchainTx.js";
import { createBlockchainTransaction } from "../services/blockchain.js";

export const blockchainRouter = express.Router();

blockchainRouter.post("/createTransaction", async (req, res) => {
  const { buyer, seller, kwh, price } = req.body;
  const tx = await createBlockchainTransaction({ buyer, seller, kwh, price });
  res.status(201).json(tx);
});

blockchainRouter.get("/transactions", async (_req, res) => {
  const txs = await BlockchainTx.find().sort({ createdAt: -1 }).limit(50);
  res.json(txs);
});
