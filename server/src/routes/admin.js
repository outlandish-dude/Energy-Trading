import express from "express";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { Trade } from "../models/Trade.js";
import { config } from "../config.js";
import { makeVehicleId, broadcastState } from "../services/simulationEngine.js";

export const adminRouter = express.Router();

adminRouter.post("/spawn-users", async (req, res) => {
  const count = Number(req.body.count || 50);
  const roles = ["ev_owner", "solar_home", "institution"];
  const users = [];

  for (let i = 0; i < count; i += 1) {
    const role = roles[i % roles.length];
    users.push({
      name: `Demo ${role}-${uuidv4().slice(0, 4)}`,
      role,
      walletBalance: config.baseWallet,
      batteryLevel: 20 + Math.round(Math.random() * 70),
      availableEnergyKwh: role === "institution" ? 0 : 15 + Math.round(Math.random() * 60),
      location: {
        lat: 8 + Math.random() * 28,
        lng: 68 + Math.random() * 28,
      },
    });
  }

  await User.insertMany(users);
  await broadcastState();
  res.json({ message: `Spawned ${count} users` });
});

adminRouter.post("/spawn-vehicles", async (_req, res) => {
  const owners = await User.find({ role: { $in: ["ev_owner", "solar_home"] } }).limit(50);
  const docs = owners.map((owner, idx) => ({
    vehicleId: makeVehicleId(),
    type: idx % 2 === 0 ? "truck" : "car",
    batteryLevel: owner.batteryLevel,
    speed: 35 + Math.round(Math.random() * 35),
    status: "idle",
    ownerId: owner._id.toString(),
    location: owner.location,
    route: [],
    routeIndex: 0,
  }));

  if (docs.length) {
    await Vehicle.insertMany(docs, { ordered: false }).catch(() => null);
  }

  await broadcastState();
  res.json({ message: "Vehicles spawned across India" });
});

adminRouter.post("/trigger-emergency", async (_req, res) => {
  const hospital = await User.findOne({ role: "institution" });
  const seller = await User.findOne({ role: { $in: ["ev_owner", "solar_home"] } });

  if (!hospital || !seller) {
    return res.status(400).json({ message: "Need institution and seller in system" });
  }

  const trade = await Trade.create({
    buyerId: hospital._id.toString(),
    sellerId: seller._id.toString(),
    sellerType: seller.role,
    kwh: 20,
    pricePerKwh: 30,
    distanceKm: 5,
    totalAmount: 600,
    emergency: true,
    status: "created",
    progressPct: 0,
  });

  await broadcastState();
  return res.json({ message: "Emergency event created", trade });
});
