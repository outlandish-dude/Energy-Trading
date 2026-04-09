import express from "express";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { calculateDynamicPrice } from "../services/pricing.js";
import { distanceKm, createRoute } from "../services/geo.js";
import { startTradeSimulation, broadcastState } from "../services/simulationEngine.js";
import {
  findStationById,
  getStations,
  updateStationBasePrice,
} from "../services/stations.js";

export const marketplaceRouter = express.Router();

async function pickVehicleForSeller(sellerId, targetLocation) {
  const vehicles = await Vehicle.find({ ownerId: sellerId });
  if (!vehicles.length) return null;
  return vehicles.sort(
    (a, b) => distanceKm(a.location, targetLocation) - distanceKm(b.location, targetLocation)
  )[0];
}

async function pickVehicleForBuyer(buyerId) {
  return Vehicle.findOne({ ownerId: buyerId });
}

async function createUserToUserTrade({
  buyer,
  seller,
  kwh,
  demandFactor = 3,
  emergency = false,
  steps = 30,
}) {
  const distance = distanceKm(buyer.location, seller.location);
  const pricePerKwh = calculateDynamicPrice({ distance, demandFactor, emergency });

  if (seller.availableEnergyKwh < kwh) {
    throw new Error("Seller does not have enough energy");
  }

  const vehicle = await pickVehicleForSeller(seller._id.toString(), buyer.location);
  if (!vehicle) {
    throw new Error("No vehicle available for this seller");
  }

  vehicle.route = createRoute(seller.location, buyer.location, steps);
  vehicle.routeIndex = 0;

  return startTradeSimulation({
    buyer,
    seller,
    vehicle,
    kwh,
    pricePerKwh,
    distanceKm: distance,
    emergency,
  });
}

async function createStationToUserTrade({
  buyer,
  station,
  kwh,
  demandFactor = 3,
  emergency = false,
  steps = 18,
}) {
  const distance = distanceKm(buyer.location, station.location);
  const pricePerKwh = calculateDynamicPrice({
    basePrice: station.basePrice,
    distance,
    demandFactor,
    emergency,
  });

  const vehicle = await pickVehicleForBuyer(buyer._id.toString());
  if (!vehicle) {
    throw new Error("No EV vehicle available for this buyer");
  }

  vehicle.route = createRoute(buyer.location, station.location, steps);
  vehicle.routeIndex = 0;

  return startTradeSimulation({
    buyer,
    seller: {
      _id: station.id,
      name: station.name,
      role: station.role,
    },
    vehicle,
    kwh,
    pricePerKwh,
    distanceKm: distance,
    emergency,
  });
}

async function createUserToStationTrade({
  seller,
  station,
  kwh,
  demandFactor = 3,
  emergency = false,
  steps = 24,
}) {
  const distance = distanceKm(seller.location, station.location);
  const pricePerKwh = calculateDynamicPrice({
    basePrice: seller.askingPricePerKwh || 18,
    distance,
    demandFactor,
    emergency,
  });

  if (seller.availableEnergyKwh < kwh) {
    throw new Error("Seller does not have enough energy");
  }

  const vehicle = await pickVehicleForSeller(seller._id.toString(), station.location);
  if (!vehicle) {
    throw new Error("No vehicle available for this seller");
  }

  vehicle.route = createRoute(seller.location, station.location, steps);
  vehicle.routeIndex = 0;

  return startTradeSimulation({
    buyer: {
      _id: station.id,
      name: station.name,
      role: station.role,
    },
    seller,
    vehicle,
    kwh,
    pricePerKwh,
    distanceKm: distance,
    emergency,
  });
}

async function buildListings(lat, lng, demand = 3) {
  const buyerLocation = { lat, lng };
  const solarSellers = await User.find({
    role: "solar_home",
    availableEnergyKwh: { $gt: 5 },
  });
  const stations = getStations();

  const solarListings = solarSellers.map((seller) => {
    const distance = distanceKm(buyerLocation, seller.location);
    const pricePerKwh = calculateDynamicPrice({
      basePrice: seller.askingPricePerKwh || 18,
      distance,
      demandFactor: demand,
    });
    return {
      sellerId: seller._id,
      sellerName: seller.name,
      sellerType: seller.role,
      distanceKm: distance,
      pricePerKwh,
      availableEnergyKwh: seller.availableEnergyKwh,
      location: seller.location,
    };
  });

  const stationListings = stations.map((station) => {
    const distance = distanceKm(buyerLocation, station.location);
    const pricePerKwh = calculateDynamicPrice({
      basePrice: station.basePrice,
      distance,
      demandFactor: demand,
    });
    return {
      sellerId: station.id,
      sellerName: station.name,
      sellerType: station.role,
      distanceKm: distance,
      pricePerKwh,
      availableEnergyKwh: station.availableEnergyKwh,
      location: station.location,
    };
  });

  return [...stationListings, ...solarListings]
    .map((seller) => {
      const distance = distanceKm(buyerLocation, seller.location);
      return {
        sellerId: seller.sellerId,
        sellerName: seller.sellerName,
        sellerType: seller.sellerType,
        distanceKm: distance,
        pricePerKwh: seller.pricePerKwh,
        availableEnergyKwh: seller.availableEnergyKwh,
        location: seller.location,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm || a.pricePerKwh - b.pricePerKwh);
}

marketplaceRouter.get("/listings", async (req, res) => {
  const lat = Number(req.query.lat || 20.5937);
  const lng = Number(req.query.lng || 78.9629);
  const demand = Number(req.query.demand || 3);

  const listings = await buildListings(lat, lng, demand);
  res.json(listings);
});

marketplaceRouter.get("/stations", (_req, res) => {
  res.json(getStations());
});

marketplaceRouter.post("/solar-sellers/:sellerId/listing", async (req, res) => {
  const seller = await User.findById(req.params.sellerId);
  if (!seller || seller.role !== "solar_home") {
    return res.status(404).json({ message: "Solar seller not found" });
  }

  const nextEnergy = Number(req.body.availableEnergyKwh ?? seller.availableEnergyKwh);
  const nextPrice = Number(req.body.askingPricePerKwh ?? seller.askingPricePerKwh ?? 18);

  seller.availableEnergyKwh = Math.max(0, nextEnergy);
  seller.askingPricePerKwh = Math.max(1, nextPrice);
  await seller.save();
  await broadcastState();

  return res.json(seller);
});

marketplaceRouter.post("/stations/:stationId/settings", async (req, res) => {
  const basePrice = Number(req.body.basePrice);
  const station = updateStationBasePrice(req.params.stationId, Math.max(1, basePrice));

  if (!station) {
    return res.status(404).json({ message: "Station not found" });
  }

  await broadcastState();
  return res.json(station);
});

marketplaceRouter.post("/start-trade", async (req, res) => {
  try {
    const { buyerId, sellerId, kwh = 10, demandFactor = 3, emergency = false } = req.body;
    const buyer = await User.findById(buyerId);

    if (!buyer) {
      return res.status(404).json({ message: "Buyer missing" });
    }

    let trade;

    if (String(sellerId).startsWith("station-")) {
      const station = findStationById(sellerId);
      if (!station) {
        return res.status(404).json({ message: "Station not found" });
      }
      trade = await createStationToUserTrade({ buyer, station, kwh, demandFactor, emergency });
    } else {
      const seller = await User.findById(sellerId);
      if (!seller || seller.role !== "solar_home") {
        return res.status(404).json({ message: "Solar seller missing" });
      }
      trade = await createUserToUserTrade({ buyer, seller, kwh, demandFactor, emergency });
    }

    return res.status(201).json(trade);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to start trade" });
  }
});

marketplaceRouter.post("/station-procurement", async (req, res) => {
  try {
    const { stationId, sellerId, kwh = 20, demandFactor = 2 } = req.body;
    const station = findStationById(stationId);
    const seller = await User.findById(sellerId);

    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    if (!seller || seller.role !== "solar_home") {
      return res.status(404).json({ message: "Solar seller missing" });
    }

    const trade = await createUserToStationTrade({
      seller,
      station,
      kwh,
      demandFactor,
    });

    return res.status(201).json(trade);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed station procurement" });
  }
});

marketplaceRouter.post("/emergency/request", async (req, res) => {
  try {
    const { institutionId, requiredKwh = 20, urgency = 5 } = req.body;
    const institution = await User.findById(institutionId);
    if (!institution || institution.role !== "institution") {
      return res.status(400).json({ message: "Invalid institution" });
    }

    const sellers = await User.find({
      role: "solar_home",
      availableEnergyKwh: { $gte: requiredKwh },
    });

    if (!sellers.length) return res.status(400).json({ message: "No sellers available" });

    const winner = sellers
      .map((s) => ({ user: s, distance: distanceKm(s.location, institution.location) }))
      .sort((a, b) => a.distance - b.distance)[0];

    const demandFactor = Math.min(10, urgency + 3);
    const trade = await createUserToUserTrade({
      buyer: institution,
      seller: winner.user,
      kwh: requiredKwh,
      demandFactor,
      emergency: true,
      steps: 32,
    });

    await broadcastState();
    return res.status(201).json({
      message: "Emergency request accepted. First responder dispatched.",
      trade,
      responder: winner.user.name,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed emergency request" });
  }
});

marketplaceRouter.post("/rescue/request", async (req, res) => {
  try {
    const { strandedUserId, neededKwh = 10 } = req.body;
    const stranded = await User.findById(strandedUserId);
    if (!stranded) return res.status(404).json({ message: "Stranded user not found" });

    const responders = await User.find({
      _id: { $ne: stranded._id },
      role: "solar_home",
      availableEnergyKwh: { $gte: neededKwh },
    });

    if (!responders.length) return res.status(400).json({ message: "No responder available" });

    const winner = responders
      .map((user) => ({ user, distance: distanceKm(user.location, stranded.location) }))
      .sort((a, b) => a.distance - b.distance)[0];

    const trade = await createUserToUserTrade({
      buyer: stranded,
      seller: winner.user,
      kwh: neededKwh,
      demandFactor: 4,
      emergency: true,
      steps: 20,
    });

    await broadcastState();
    return res.status(201).json({
      message: "Rescue accepted. EV on the way.",
      trade,
      responder: winner.user.name,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed rescue request" });
  }
});

marketplaceRouter.post("/demo/:scenario", async (req, res) => {
  try {
    const { scenario } = req.params;

    const [evOwner, solar, institution] = await Promise.all([
      User.findOne({ role: "ev_owner" }),
      User.findOne({ role: "solar_home" }),
      User.findOne({ role: "institution" }),
    ]);

    if (!evOwner || !solar || !institution) {
      return res.status(400).json({ message: "Insufficient users for demo scenarios" });
    }

    if (scenario === "solar") {
      const trade = await createUserToUserTrade({
        buyer: evOwner,
        seller: solar,
        kwh: 12,
        demandFactor: 2,
      });
      return res.status(201).json({ scenario, trade });
    }

    if (scenario === "hospital") {
      const trade = await createUserToUserTrade({
        buyer: institution,
        seller: solar,
        kwh: 25,
        demandFactor: 8,
        emergency: true,
      });
      return res.status(201).json({ scenario, trade });
    }

    if (scenario === "rescue") {
      const trade = await createUserToUserTrade({
        buyer: evOwner,
        seller: solar,
        kwh: 8,
        demandFactor: 4,
        emergency: true,
        steps: 20,
      });
      return res.status(201).json({ scenario, trade });
    }

    if (scenario === "market") {
      const listings = await buildListings(evOwner.location.lat, evOwner.location.lng, 5);
      const best = listings[0];
      if (!best) return res.status(404).json({ message: "No marketplace sellers available" });

      let trade;
      if (best.sellerType === "station") {
        const station = findStationById(best.sellerId);
        if (!station) return res.status(404).json({ message: "Best station not found" });
        trade = await createStationToUserTrade({ buyer: evOwner, station, kwh: 10, demandFactor: 5 });
      } else {
        const seller = await User.findById(best.sellerId);
        if (!seller) return res.status(404).json({ message: "Best seller not found" });
        trade = await createUserToUserTrade({ buyer: evOwner, seller, kwh: 10, demandFactor: 5 });
      }

      return res.status(201).json({ scenario, trade });
    }

    return res.status(404).json({ message: "Unknown scenario" });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed demo scenario" });
  }
});
