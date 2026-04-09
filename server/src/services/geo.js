export function toRad(value) {
  return (value * Math.PI) / 180;
}

export function distanceKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
  return Number((R * c).toFixed(2));
}

export function createRoute(start, end, steps = 25) {
  const route = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    route.push({
      lat: start.lat + (end.lat - start.lat) * t,
      lng: start.lng + (end.lng - start.lng) * t,
    });
  }
  return route;
}

export function clampPrice(price) {
  return Math.max(15, Math.min(30, Number(price.toFixed(2))));
}
