import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/voltshare",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  baseWallet: 10000,
};
