import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { config } from "../config.js";
import { indiaPoints } from "./indiaPoints.js";
import { makeVehicleId } from "../services/simulationEngine.js";

export async function seedInitialData() {
  const totalUsers = await User.countDocuments();
  if (totalUsers > 0) return;

  const admin = await User.create({
    name: "VoltShare Admin",
    role: "admin",
    walletBalance: config.baseWallet,
    location: { lat: 20.5937, lng: 78.9629 },
  });

  const sellers = await User.insertMany([
    {
      name: "Ravi Solar Home",
      role: "solar_home",
      walletBalance: config.baseWallet,
      batteryLevel: 78,
      availableEnergyKwh: 40,
      askingPricePerKwh: 17,
      location: indiaPoints.sellers[3],
    },
    {
      name: "Asha Solar Home",
      role: "solar_home",
      walletBalance: config.baseWallet,
      batteryLevel: 92,
      availableEnergyKwh: 55,
      askingPricePerKwh: 16,
      location: indiaPoints.sellers[0],
    },
    {
      name: "Kiran Solar Home",
      role: "solar_home",
      walletBalance: config.baseWallet,
      batteryLevel: 90,
      availableEnergyKwh: 63,
      askingPricePerKwh: 18,
      location: indiaPoints.sellers[1],
    },
  ]);

  const buyers = await User.insertMany([
    {
      name: "Neha EV Owner",
      role: "ev_owner",
      walletBalance: config.baseWallet,
      batteryLevel: 32,
      location: { lat: 26.95, lng: 75.8 },
      availableEnergyKwh: 8,
    },
    {
      name: "City Hospital",
      role: "institution",
      walletBalance: config.baseWallet,
      batteryLevel: 20,
      location: indiaPoints.institutions[0],
      availableEnergyKwh: 0,
    },
  ]);

  const allVehicleOwners = [...sellers, ...buyers].filter((u) => u.role !== "institution");
  const vehicles = allVehicleOwners.map((owner, idx) => ({
    vehicleId: makeVehicleId(),
    type: idx % 3 === 0 ? "truck" : "car",
    batteryLevel: owner.batteryLevel,
    speed: idx % 2 === 0 ? 55 : 42,
    status: "idle",
    ownerId: owner._id.toString(),
    location: owner.location,
    route: [],
    routeIndex: 0,
  }));

  await Vehicle.insertMany(vehicles);

  console.log(`Seeded default users/vehicles. Admin: ${admin.name}`);
}
