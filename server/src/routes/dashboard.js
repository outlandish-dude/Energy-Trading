import express from "express";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { Trade } from "../models/Trade.js";

export const dashboardRouter = express.Router();

dashboardRouter.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  const [user, trades, vehicle] = await Promise.all([
    User.findById(userId),
    Trade.find({ $or: [{ buyerId: userId }, { sellerId: userId }] }).sort({ createdAt: -1 }).limit(10),
    Vehicle.findOne({ ownerId: userId }),
  ]);

  if (!user) return res.status(404).json({ message: "User not found" });

  return res.json({
    user,
    vehicle,
    trades,
  });
});

dashboardRouter.get("/admin/state", async (_req, res) => {
  const [users, vehicles, activeTrades, totalTrades] = await Promise.all([
    User.countDocuments(),
    Vehicle.countDocuments(),
    Trade.countDocuments({ status: { $in: ["moving", "charging"] } }),
    Trade.countDocuments(),
  ]);

  return res.json({ users, vehicles, activeTrades, totalTrades });
});
