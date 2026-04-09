import { v4 as uuidv4 } from "uuid";
import { Trade } from "../models/Trade.js";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { createBlockchainTransaction } from "./blockchain.js";
import { updateStationInventory } from "./stations.js";

let ioRef;
const activeTrades = new Map();

export function initSimulationEngine(io) {
  ioRef = io;

  setInterval(async () => {
    const movingVehicles = await Vehicle.find({ status: "moving" });

    for (const vehicle of movingVehicles) {
      const route = vehicle.route || [];
      const nextIndex = vehicle.routeIndex + 1;

      if (nextIndex >= route.length) {
        vehicle.status = "charging";
        vehicle.routeIndex = route.length;
        await vehicle.save();

        const trade = await Trade.findById(vehicle.tradeId);
        if (trade && trade.status !== "completed") {
          trade.status = "charging";
          trade.progressPct = 80;
          await trade.save();

          setTimeout(() => completeTrade(trade._id.toString(), vehicle.vehicleId), 5000);
        }
      } else {
        vehicle.location = route[nextIndex];
        vehicle.routeIndex = nextIndex;
        await vehicle.save();

        const trade = await Trade.findById(vehicle.tradeId);
        if (trade) {
          trade.status = "moving";
          trade.progressPct = Math.min(75, Math.round((nextIndex / route.length) * 75));
          await trade.save();
        }
      }
    }

    await broadcastState();
  }, 1000);
}

export async function startTradeSimulation({
  buyer,
  seller,
  vehicle,
  kwh,
  pricePerKwh,
  distanceKm,
  emergency = false,
}) {
  const totalAmount = Number((kwh * pricePerKwh).toFixed(2));

  const trade = await Trade.create({
    buyerId: buyer._id.toString(),
    buyerName: buyer.name,
    buyerType: buyer.role,
    sellerId: seller._id.toString(),
    sellerName: seller.name,
    sellerType: seller.role,
    kwh,
    pricePerKwh,
    distanceKm,
    totalAmount,
    emergency,
    vehicleId: vehicle.vehicleId,
    status: "moving",
    progressPct: 5,
  });

  vehicle.status = "moving";
  vehicle.tradeId = trade._id.toString();
  vehicle.routeIndex = 0;
  await vehicle.save();

  activeTrades.set(trade._id.toString(), {
    startedAt: Date.now(),
    tradeId: trade._id.toString(),
  });

  await broadcastState();
  return trade;
}

async function completeTrade(tradeId, vehicleId) {
  const trade = await Trade.findById(tradeId);
  if (!trade || trade.status === "completed") return;

  const buyer = trade.buyerType === "station" ? null : await User.findById(trade.buyerId);
  const seller = trade.sellerType === "station" ? null : await User.findById(trade.sellerId);

  if (trade.buyerType !== "station" && !buyer) return;
  if (trade.sellerType !== "station" && !seller) return;

  if (buyer) {
    buyer.walletBalance = Number((buyer.walletBalance - trade.totalAmount).toFixed(2));
    buyer.batteryLevel = Math.min(100, buyer.batteryLevel + Math.round(trade.kwh * 1.8));
  }
  if (trade.buyerType === "station") {
    updateStationInventory(trade.buyerId, trade.kwh);
  }

  if (seller) {
    seller.walletBalance = Number((seller.walletBalance + trade.totalAmount).toFixed(2));
    seller.availableEnergyKwh = Math.max(0, seller.availableEnergyKwh - trade.kwh);
  }
  if (trade.sellerType === "station") {
    updateStationInventory(trade.sellerId, -trade.kwh);
  }

  trade.status = "completed";
  trade.progressPct = 100;

  await Promise.all([buyer?.save(), seller?.save(), trade.save()].filter(Boolean));

  await createBlockchainTransaction({
    buyer: trade.buyerName,
    seller: trade.sellerName,
    kwh: trade.kwh,
    price: trade.totalAmount,
  });

  const vehicle = await Vehicle.findOne({ vehicleId });
  if (vehicle) {
    vehicle.status = "idle";
    vehicle.tradeId = undefined;
    vehicle.route = [];
    vehicle.routeIndex = 0;
    await vehicle.save();
  }

  activeTrades.delete(tradeId);
  await broadcastState();
}

export async function broadcastState() {
  if (!ioRef) return;
  const [users, vehicles, trades] = await Promise.all([
    User.find().lean(),
    Vehicle.find().lean(),
    Trade.find().sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  ioRef.emit("simulation:update", {
    users,
    vehicles,
    trades,
    ts: Date.now(),
  });
}

export function makeVehicleId() {
  return `VH-${uuidv4().slice(0, 8).toUpperCase()}`;
}
