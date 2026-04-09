import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

export type Listing = {
  sellerId: string;
  sellerName: string;
  sellerType: "station" | "solar_home";
  distanceKm: number;
  pricePerKwh: number;
  availableEnergyKwh: number;
  location: { lat: number; lng: number };
};

export type Station = {
  id: string;
  name: string;
  role: "station";
  location: { lat: number; lng: number };
  availableEnergyKwh: number;
  basePrice: number;
};

export type SolarListingSettings = {
  availableEnergyKwh: number;
  askingPricePerKwh: number;
};

export const Api = {
  getListings: (lat: number, lng: number) => api.get<Listing[]>("/api/marketplace/listings", { params: { lat, lng } }),
  getStations: () => api.get<Station[]>("/api/marketplace/stations"),
  startTrade: (payload: { buyerId: string; sellerId: string; kwh: number }) => api.post("/api/marketplace/start-trade", payload),
  stationProcurement: (payload: { stationId: string; sellerId: string; kwh: number }) =>
    api.post("/api/marketplace/station-procurement", payload),
  updateSolarListing: (sellerId: string, payload: SolarListingSettings) =>
    api.post(`/api/marketplace/solar-sellers/${sellerId}/listing`, payload),
  updateStationSettings: (stationId: string, payload: { basePrice: number }) =>
    api.post(`/api/marketplace/stations/${stationId}/settings`, payload),
  emergency: (payload: { institutionId: string; requiredKwh: number; urgency: number }) => api.post("/api/marketplace/emergency/request", payload),
  rescue: (payload: { strandedUserId: string; neededKwh: number }) => api.post("/api/marketplace/rescue/request", payload),
  runDemo: (scenario: "solar" | "hospital" | "rescue" | "market") => api.post(`/api/marketplace/demo/${scenario}`),
  getBlockchain: () => api.get("/api/blockchain/transactions"),
  getAdminState: () => api.get("/api/dashboard/admin/state"),
  spawnUsers: () => api.post("/api/admin/spawn-users", { count: 50 }),
  spawnVehicles: () => api.post("/api/admin/spawn-vehicles"),
  triggerEmergency: () => api.post("/api/admin/trigger-emergency"),
};

export default api;
