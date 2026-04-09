import { clampPrice } from "./geo.js";

export function calculateDynamicPrice({
  basePrice = 18,
  distance = 1,
  demandFactor = 3,
  emergency = false,
}) {
  const raw = basePrice + distance * 0.5 + demandFactor;
  let price = clampPrice(raw);
  if (emergency) {
    price = clampPrice(price * 1.5);
  }
  return price;
}
