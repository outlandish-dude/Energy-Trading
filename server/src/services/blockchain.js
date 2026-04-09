import crypto from "crypto";
import { BlockchainTx } from "../models/BlockchainTx.js";

export async function createBlockchainTransaction(payload) {
  const base = `${payload.buyer}-${payload.seller}-${payload.kwh}-${payload.price}-${Date.now()}`;
  const txHash = `0x${crypto.createHash("sha256").update(base).digest("hex")}`;

  const tx = await BlockchainTx.create({
    ...payload,
    txHash,
    timestamp: new Date(),
  });

  return tx;
}
