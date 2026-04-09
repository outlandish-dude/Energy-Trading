import { indiaPoints } from "../seed/indiaPoints.js";

const stationInventory = [240, 320, 280, 260];
const stationBasePrice = [18, 19, 20, 18];

export function getStations() {
  return indiaPoints.stations.map((station, index) => ({
    id: `station-${index + 1}`,
    name: station.name,
    role: "station",
    location: { lat: station.lat, lng: station.lng },
    availableEnergyKwh: stationInventory[index] ?? 250,
    basePrice: stationBasePrice[index] ?? 18,
  }));
}

export function findStationById(stationId) {
  return getStations().find((station) => station.id === stationId) ?? null;
}

export function updateStationInventory(stationId, deltaKwh) {
  const index = getStations().findIndex((station) => station.id === stationId);
  if (index === -1) return null;
  stationInventory[index] = Math.max(0, Number((stationInventory[index] + deltaKwh).toFixed(2)));
  return findStationById(stationId);
}

export function updateStationBasePrice(stationId, basePrice) {
  const index = getStations().findIndex((station) => station.id === stationId);
  if (index === -1) return null;
  stationBasePrice[index] = Number(basePrice);
  return findStationById(stationId);
}
