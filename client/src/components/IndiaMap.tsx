import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import L from "leaflet";
import {
  AlertTriangle,
  Crosshair,
  Eye,
  LocateFixed,
  Minus,
  Plus,
  RadioTower,
  Route,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import { Badge } from "./ui/Badge";

type User = {
  _id: string;
  name: string;
  role: "ev_owner" | "solar_home" | "institution" | "admin";
  batteryLevel: number;
  availableEnergyKwh?: number;
  location: { lat: number; lng: number };
};

type Vehicle = {
  vehicleId: string;
  type: "truck" | "car";
  batteryLevel: number;
  status: "idle" | "moving" | "charging";
  location: { lat: number; lng: number };
  route: Array<{ lat: number; lng: number }>;
};

type Station = {
  id: string;
  name: string;
  role: "station";
  location: { lat: number; lng: number };
  availableEnergyKwh: number;
  basePrice: number;
};

type Trade = {
  _id: string;
  totalAmount: number;
  status: "created" | "moving" | "charging" | "completed";
  emergency?: boolean;
};

type Listing = {
  pricePerKwh: number;
};

const createIcon = (symbol: string, color: string) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:34px;
        height:34px;
        border-radius:9999px;
        border:2px solid ${color};
        background:rgba(10,15,28,0.92);
        box-shadow:0 0 0 4px ${color}22;
        color:${color};
        font-size:17px;
        font-weight:700;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const icons = {
  station: createIcon("\u26A1", "#22c55e"),
  solar_home: createIcon("S", "#f59e0b"),
  ev_owner: createIcon("E", "#38bdf8"),
  institution: createIcon("H", "#ef4444"),
  vehicle: createIcon("V", "#a78bfa"),
};

const legendItems = [
  { label: "EV Owner", symbol: "E", tint: "text-sky-700 border-sky-200 bg-sky-50 dark:text-sky-300 dark:border-sky-400/20 dark:bg-sky-400/10" },
  { label: "Solar Home", symbol: "S", tint: "text-amber-700 border-amber-200 bg-amber-50 dark:text-amber-300 dark:border-amber-400/20 dark:bg-amber-400/10" },
  { label: "Institution", symbol: "H", tint: "text-red-700 border-red-200 bg-rose-50 dark:text-red-300 dark:border-red-400/20 dark:bg-red-400/10" },
  { label: "Stranded EV", symbol: "!", tint: "text-rose-700 border-rose-200 bg-rose-50 dark:text-rose-300 dark:border-rose-400/20 dark:bg-rose-400/10" },
  { label: "Charging Station", symbol: "\u26A1", tint: "text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-400/20 dark:bg-emerald-400/10" },
];

function UtilityButton({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      type="button"
      title={label}
      aria-label={label}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`map-utility-button inline-flex h-10 w-10 items-center justify-center rounded-2xl border shadow-[0_12px_28px_rgba(2,6,23,0.18)] transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/35 ${
        active
          ? "border-cyan-300/40 bg-cyan-100 text-cyan-900 dark:bg-cyan-400/18 dark:text-cyan-50"
          : "border-slate-200 bg-white text-slate-900 hover:border-cyan-300 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950/84 dark:text-slate-100 dark:hover:border-cyan-300/20 dark:hover:bg-slate-900/90"
      }`}
    >
      <Icon size={16} />
    </motion.button>
  );
}

function MapUtilityCluster({
  showLegend,
  onToggleLegend,
}: {
  showLegend: boolean;
  onToggleLegend: () => void;
}) {
  const map = useMap();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="pointer-events-auto absolute right-4 top-4 z-[520] flex flex-col items-end gap-2"
    >
      <div className="flex gap-2 rounded-[22px] border border-slate-200 bg-white/95 p-2 shadow-[0_20px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-950/76 dark:shadow-[0_20px_40px_rgba(2,6,23,0.38)]">
        <UtilityButton icon={Plus} label="Zoom in" onClick={() => map.zoomIn()} />
        <UtilityButton icon={Minus} label="Zoom out" onClick={() => map.zoomOut()} />
        <UtilityButton
          icon={Crosshair}
          label="Recenter India"
          onClick={() => map.setView([22.9734, 78.6569], 5, { animate: true })}
        />
        <UtilityButton
          icon={Eye}
          label={showLegend ? "Hide legend" : "Show legend"}
          onClick={onToggleLegend}
          active={showLegend}
        />
      </div>

      {showLegend && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          className="max-w-[18rem] rounded-[22px] border border-cyan-200 bg-white/95 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:border-cyan-400/15 dark:bg-slate-950/84 dark:shadow-[0_16px_40px_rgba(2,6,23,0.36)]"
        >
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
            <ShieldCheck size={12} className="text-cyan-300" />
            Legend
          </div>
          <div className="grid grid-cols-2 gap-2">
            {legendItems.map((item) => (
              <div
                key={item.label}
                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] ${item.tint}`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current/20 bg-white/70 text-[10px] font-semibold dark:bg-black/20">
                  {item.symbol}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function MetricPill({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "cyan" | "emerald" | "amber" | "red" | "violet";
}) {
  const tones = {
    cyan: "border-cyan-400/15 bg-cyan-400/8 text-cyan-50",
    emerald: "border-emerald-400/15 bg-emerald-400/8 text-emerald-50",
    amber: "border-amber-400/15 bg-amber-400/8 text-amber-50",
    red: "border-red-400/15 bg-red-400/8 text-red-50",
    violet: "border-violet-400/15 bg-violet-400/8 text-violet-50",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`inline-flex items-center gap-3 rounded-2xl border px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.08)] ${tones[tone]}`}
    >
      <div className="rounded-xl border border-black/5 bg-white/80 p-1.5 dark:border-white/5 dark:bg-black/25">
        <Icon size={14} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">{label}</div>
        <div className="text-sm font-medium text-[color:var(--text-primary)]">{value}</div>
      </div>
    </motion.div>
  );
}

export function IndiaMap({
  users,
  vehicles,
  stations,
  trades = [],
  listings = [],
  loading = false,
}: {
  users: User[];
  vehicles: Vehicle[];
  stations: Station[];
  trades?: Trade[];
  listings?: Listing[];
  loading?: boolean;
}) {
  const [showLegend, setShowLegend] = useState(false);
  const solarHomes = users.filter((user) => user.role === "solar_home");
  const evOwners = users.filter((user) => user.role === "ev_owner");
  const institutions = users.filter((user) => user.role === "institution");
  const movingVehicles = vehicles.filter((vehicle) => vehicle.status === "moving" || vehicle.status === "charging").length;
  const liveTrades = trades.filter((trade) => trade.status !== "completed").length;
  const emergencyRequests = trades.filter((trade) => trade.emergency && trade.status !== "completed").length;
  const avgPrice = listings.length
    ? (listings.reduce((sum, listing) => sum + listing.pricePerKwh, 0) / listings.length).toFixed(1)
    : "--";
  const onlineNodes = stations.length + solarHomes.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[30px] border border-cyan-100 bg-white/88 p-4 shadow-[0_28px_90px_rgba(8,145,178,0.12)] md:p-5 dark:border-cyan-400/15 dark:bg-slate-950/55"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-8 top-0 h-28 bg-gradient-to-b from-cyan-400/8 via-cyan-400/4 to-transparent blur-2xl" />
        <div className="absolute -left-24 top-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-52 w-52 rounded-full bg-emerald-400/8 blur-3xl" />
        <div className="absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/5" />
      </div>

      <div className="relative z-10 mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="max-w-2xl"
        >
          <div className="mb-2 text-[11px] uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Mission Control Map</div>
          <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--text-primary)] md:text-[2rem]">Live Energy Network</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
            Track vehicles, routes, sellers, and emergency requests across India in a single live dispatch surface.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.4 }}
          className="flex flex-wrap items-center gap-2"
        >
          <Badge label="Live Updates" variant="info" />
          <Badge label={`${movingVehicles} Active Vehicles`} variant="success" />
          <Badge label="India Grid View" variant="primary" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className="relative z-10 mb-4 flex flex-wrap gap-2"
      >
        <MetricPill label="Active Vehicles" value={`${movingVehicles}`} icon={LocateFixed} tone="cyan" />
        <MetricPill label="Live Trades" value={`${liveTrades}`} icon={Route} tone="violet" />
        <MetricPill label="Avg Price / kWh" value={avgPrice === "--" ? avgPrice : `Rs ${avgPrice}`} icon={Zap} tone="emerald" />
        <MetricPill label="Emergency Requests" value={`${emergencyRequests}`} icon={AlertTriangle} tone="red" />
        <MetricPill label="Online Nodes" value={`${onlineNodes}`} icon={RadioTower} tone="amber" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.22, duration: 0.45 }}
        className="relative z-10 overflow-hidden rounded-[26px] border border-slate-200 bg-slate-100/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-white/10 dark:bg-slate-950/70 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        <div className="pointer-events-none absolute inset-0 z-[450]">
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950/35 to-transparent" />
          <div className="absolute inset-0 rounded-[22px] ring-1 ring-inset ring-cyan-400/10" />
        </div>

        <div className="relative h-[540px] overflow-hidden rounded-[22px] md:h-[600px] xl:h-[680px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
              <div className="w-full px-6">
                <div className="mb-5 h-5 w-40 animate-pulse rounded-full bg-white/10" />
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="h-24 animate-pulse rounded-2xl bg-white/8" />
                  <div className="h-24 animate-pulse rounded-2xl bg-white/8" />
                  <div className="h-24 animate-pulse rounded-2xl bg-white/8" />
                </div>
                <div className="mt-5 h-[360px] animate-pulse rounded-[22px] bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
              </div>
            </div>
          ) : (
            <MapContainer center={[22.9734, 78.6569]} zoom={5} scrollWheelZoom zoomControl={false} className="h-full w-full">
              <MapUtilityCluster
                showLegend={showLegend}
                onToggleLegend={() => setShowLegend((value) => !value)}
              />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {stations.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.location.lat, station.location.lng]}
                  icon={icons.station}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold text-green-700">{station.name}</div>
                      <div>Energy Station</div>
                      <div>Available: {station.availableEnergyKwh} kWh</div>
                      <div>Base Price: Rs {station.basePrice}/kWh</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {solarHomes.map((home) => (
                <Marker
                  key={home._id}
                  position={[home.location.lat, home.location.lng]}
                  icon={icons.solar_home}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold text-amber-700">{home.name}</div>
                      <div>Solar Seller</div>
                      <div>Battery: {home.batteryLevel}%</div>
                      <div>Available: {home.availableEnergyKwh ?? 0} kWh</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {evOwners.map((owner) => (
                <Marker
                  key={owner._id}
                  position={[owner.location.lat, owner.location.lng]}
                  icon={icons.ev_owner}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold text-sky-700">{owner.name}</div>
                      <div>EV Owner</div>
                      <div>Battery: {owner.batteryLevel}%</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {institutions.map((institution) => (
                <Marker
                  key={institution._id}
                  position={[institution.location.lat, institution.location.lng]}
                  icon={icons.institution}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold text-red-700">{institution.name}</div>
                      <div>Institution</div>
                      <div>Battery: {institution.batteryLevel}%</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {vehicles.map((vehicle) => (
                <Marker
                  key={vehicle.vehicleId}
                  position={[vehicle.location.lat, vehicle.location.lng]}
                  icon={icons.vehicle}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold text-violet-700">{vehicle.vehicleId}</div>
                      <div>Vehicle Type: {vehicle.type}</div>
                      <div>Status: {vehicle.status}</div>
                      <div>Battery: {vehicle.batteryLevel}%</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {vehicles
                .filter((vehicle) => vehicle.status === "moving" && vehicle.route.length > 1)
                .map((vehicle) => (
                  <Polyline
                    key={`${vehicle.vehicleId}-route`}
                    positions={vehicle.route.map((point) => [point.lat, point.lng])}
                    color="#00d1b2"
                    weight={4}
                    opacity={0.75}
                  />
                ))}
            </MapContainer>
          )}
        </div>
      </motion.div>
    </motion.section>
  );
}
