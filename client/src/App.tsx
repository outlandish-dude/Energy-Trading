import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import { ArrowRightLeft, BatteryCharging, Building2, CarFront, CheckCircle2, ChevronRight, CreditCard, Gauge, History, IndianRupee, LayoutDashboard, MapPinned, Moon, Play, RadioTower, Search, SlidersHorizontal, Sparkles, Sun, SunMedium, Wallet, Zap } from "lucide-react";
import { Api, type Listing, type Station } from "./api/client";
import { socket } from "./api/socket";
import { ActionCommandPanel } from "./components/ActionCommandPanel";
import { IndiaMap } from "./components/IndiaMap";
import { LiveMissionBoard } from "./components/LiveMissionBoard";
import { OperationsRail } from "./components/OperationsRail";
import { TelemetryStrip } from "./components/TelemetryStrip";
import { Badge, ProgressBar } from "./components/ui/Badge";
import { BrandName } from "./components/ui/Logo";
import { SiteFooter } from "./components/ui/SiteFooter";

type RoleChoice = "solar_home" | "station" | "ev_owner";
type Stage = "landing" | "auth" | "role" | "app";
type Tab = "dashboard" | "marketplace" | "wallet" | "simulation";
type SortKey = "distance" | "price" | "energy";
type SellerFilter = "all" | "solar_home" | "station";
type ThemeMode = "light" | "dark";
type User = { _id: string; name: string; role: "ev_owner" | "solar_home" | "institution" | "admin"; walletBalance: number; batteryLevel: number; availableEnergyKwh?: number; askingPricePerKwh?: number; location: { lat: number; lng: number } };
type Vehicle = { vehicleId: string; type: "truck" | "car"; batteryLevel: number; status: "idle" | "moving" | "charging"; location: { lat: number; lng: number }; route: Array<{ lat: number; lng: number }> };
type Trade = { _id: string; buyerName?: string; sellerName?: string; createdAt?: string; vehicleId?: string; kwh: number; totalAmount: number; status: "created" | "moving" | "charging" | "completed"; progressPct: number; emergency?: boolean };
type Tx = { _id: string; buyer: string; seller: string; kwh: number; price: number; txHash: string; timestamp: string };
type SimulationPayload = { users: User[]; vehicles: Vehicle[]; trades: Trade[] };
type AdminState = { users: number; vehicles: number; activeTrades: number; totalTrades: number } | null;
type PendingRequest = { id: string; requesterName: string; requesterType: "ev_owner" | "station"; kwh: number; label: string; description: string };

const INR = "\u20B9";
const BASE_WALLET = 10000;
const roleMeta = {
  solar_home: { label: "Solar Energy Seller", title: "Monetize rooftop surplus with controlled listings.", subtitle: "Manage generation, self-consumption, surplus inventory, and buyer requests.", icon: SunMedium, accent: "from-emerald-400/20 via-cyan-400/10 to-transparent" },
  station: { label: "Charging Station", title: "Operate as an electricity inventory and resale hub.", subtitle: "Procure power from solar sellers and serve EV demand with clean station workflows.", icon: Building2, accent: "from-cyan-400/20 via-sky-400/10 to-transparent" },
  ev_owner: { label: "EV Owner", title: "Compare nearby sellers and complete simulated charging purchases.", subtitle: "Search solar homes and stations by price, distance, and available energy.", icon: CarFront, accent: "from-violet-400/18 via-cyan-400/10 to-transparent" },
} as const;
function roleLocation(role: RoleChoice, solar?: User, ev?: User, station?: Station | null) { if (role === "solar_home") return solar?.location; if (role === "station") return station?.location; return ev?.location; }
function metricTone(percent: number) { if (percent >= 70) return "green" as const; if (percent >= 35) return "amber" as const; return "red" as const; }
function formatTime(value?: string) { if (!value) return "Live"; return new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }
function Stat({ label, value, helper, icon: Icon }: { label: string; value: string; helper: string; icon: typeof Wallet }) { return <motion.div whileHover={{ y: -2 }} className="telemetry-card"><div className="mb-3 flex items-center justify-between"><div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-2.5 text-cyan-700 dark:border-white/10 dark:bg-white/5 dark:text-cyan-200"><Icon size={16} /></div><div className="kicker">{label}</div></div><div className="text-2xl font-semibold text-[color:var(--text-primary)]">{value}</div><div className="mt-1 text-sm text-[color:var(--text-secondary)]">{helper}</div></motion.div>; }
function ListingCard({ listing, cta, helper, onAction, disabled = false }: { listing: Listing; cta: string; helper: string; onAction?: () => void; disabled?: boolean }) { return <motion.div whileHover={{ y: -2 }} className="rounded-[24px] border border-[color:var(--border-strong)] bg-[color:var(--surface-primary)] p-4 shadow-[0_16px_44px_rgba(2,6,23,0.1)]"><div className="mb-4 flex items-start justify-between gap-3"><div><div className="text-sm font-semibold text-[color:var(--text-primary)]">{listing.sellerName}</div><div className="mt-1 text-xs text-[color:var(--text-muted)]">{listing.distanceKm} km away</div></div><Badge label={listing.sellerType === "station" ? "Station" : "Solar"} variant={listing.sellerType === "station" ? "info" : "success"} size="sm" /></div><div className="grid grid-cols-3 gap-3 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] p-3 text-sm"><div><div className="kicker mb-1">Price</div><div className="font-medium text-[color:var(--text-primary)]">{INR}{listing.pricePerKwh}</div></div><div><div className="kicker mb-1">Energy</div><div className="font-medium text-[color:var(--text-primary)]">{listing.availableEnergyKwh} kWh</div></div><div><div className="kicker mb-1">Scope</div><div className="font-medium text-[color:var(--text-primary)]">India Grid</div></div></div><div className="mt-4 flex items-center justify-between gap-3"><div className="text-xs leading-5 text-[color:var(--text-secondary)]">{helper}</div>{onAction && <button type="button" disabled={disabled} onClick={onAction} className="btn btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed">{cta}</button>}</div></motion.div>; }
function RequestCard({ request, onApprove, onReject }: { request: PendingRequest; onApprove: () => void; onReject: () => void }) { return <div className="rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-primary)] p-4"><div className="mb-2 flex items-center justify-between gap-3"><div><div className="text-sm font-semibold text-[color:var(--text-primary)]">{request.requesterName}</div><div className="mt-1 text-xs text-[color:var(--text-muted)]">{request.label}</div></div><Badge label={request.requesterType === "station" ? "Station" : "EV Owner"} variant={request.requesterType === "station" ? "warning" : "info"} size="sm" /></div><div className="text-sm text-[color:var(--text-secondary)]">{request.description}</div><div className="mt-3 flex items-center gap-2"><button type="button" onClick={onApprove} className="btn btn-success px-3 py-2 text-sm">Accept</button><button type="button" onClick={onReject} className="btn btn-secondary px-3 py-2 text-sm">Reject</button></div></div>; }
function EmptyPanel({ title, description }: { title: string; description: string }) { return <div className="rounded-[24px] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-secondary)] px-5 py-10 text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-transparent dark:bg-cyan-400/12 dark:text-cyan-200"><Sparkles size={20} /></div><div className="text-base font-semibold text-[color:var(--text-primary)]">{title}</div><div className="mt-2 text-sm text-[color:var(--text-secondary)]">{description}</div></div>; }

export default function App() {
  const [stage, setStage] = useState<Stage>("landing");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState<RoleChoice>("ev_owner");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [sortBy, setSortBy] = useState<SortKey>("distance");
  const [sellerFilter, setSellerFilter] = useState<SellerFilter>("all");
  const [sessionName, setSessionName] = useState("Demo User");
  const [sessionEmail, setSessionEmail] = useState("demo@voltshare.in");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [adminState, setAdminState] = useState<AdminState>(null);
  const [solarDraft, setSolarDraft] = useState({ availableEnergyKwh: 40, askingPricePerKwh: 18 });
  const [stationDraft, setStationDraft] = useState({ basePrice: 18 });
  const [dismissedSolarRequests, setDismissedSolarRequests] = useState<string[]>([]);
  const [dismissedStationRequests, setDismissedStationRequests] = useState<string[]>([]);

  const solarSellers = users.filter((u) => u.role === "solar_home");
  const solar = solarSellers[0];
  const evOwner = users.find((u) => u.role === "ev_owner");
  const institution = users.find((u) => u.role === "institution");
  const station = stations[0] ?? null;
  const selectedLocation = roleLocation(selectedRole, solar, evOwner, station);
  const activeTrades = trades.filter((t) => t.status !== "completed");
  const energyTradedToday = trades.reduce((sum, t) => sum + t.kwh, 0);
  const avgPrice = listings.length ? listings.reduce((sum, item) => sum + item.pricePerKwh, 0) / listings.length : 0;
  const onlineNodes = stations.length + solarSellers.length;
  const stationRevenue = station ? txs.filter((tx) => tx.seller === station.name).reduce((sum, tx) => sum + tx.price, 0) : 0;
  const stationSpend = station ? trades.filter((t) => t.buyerName === station.name && t.status === "completed").reduce((sum, t) => sum + t.totalAmount, 0) : 0;
  const stationWallet = BASE_WALLET + stationRevenue - stationSpend;
  const currentWallet = selectedRole === "station" ? stationWallet : selectedRole === "solar_home" ? solar?.walletBalance ?? 0 : evOwner?.walletBalance ?? 0;
  const currentBattery = selectedRole === "station" ? Math.min(100, Math.round(((station?.availableEnergyKwh ?? 0) / 360) * 100)) : selectedRole === "solar_home" ? solar?.batteryLevel ?? 0 : evOwner?.batteryLevel ?? 0;

  const visibleListings = useMemo(() => {
    const next = [...listings].filter((item) => sellerFilter === "all" || item.sellerType === sellerFilter).filter((item) => selectedRole === "station" ? item.sellerType === "solar_home" : true);
    next.sort((a, b) => sortBy === "price" ? a.pricePerKwh - b.pricePerKwh : sortBy === "energy" ? b.availableEnergyKwh - a.availableEnergyKwh : a.distanceKm - b.distanceKm);
    return next;
  }, [listings, selectedRole, sellerFilter, sortBy]);
  const solarRequests = useMemo<PendingRequest[]>(() => {
    if (!solar) return [];
    const items: PendingRequest[] = [];
    const evLocked = trades.some((t) => t.sellerName === solar.name && t.buyerName === evOwner?.name && t.status !== "completed");
    const stationLocked = trades.some((t) => t.sellerName === solar.name && t.buyerName === station?.name && t.status !== "completed");
    if (evOwner && !evLocked) items.push({ id: `solar-ev-${evOwner._id}`, requesterName: evOwner.name, requesterType: "ev_owner", kwh: Math.min(12, Math.max(6, Math.round((solar.availableEnergyKwh ?? 12) / 3))), label: "Direct EV charge request", description: "Needs a residential solar top-up based on current battery level." });
    if (station && !stationLocked) items.push({ id: `solar-station-${station.id}`, requesterName: station.name, requesterType: "station", kwh: Math.min(30, Math.max(10, Math.round((solar.availableEnergyKwh ?? 30) / 2))), label: "Station inventory procurement", description: "Procure surplus solar energy to replenish charging hub inventory." });
    return items.filter((item) => !dismissedSolarRequests.includes(item.id));
  }, [dismissedSolarRequests, evOwner, solar, station, trades]);

  const stationRequests = useMemo<PendingRequest[]>(() => {
    if (!station || !evOwner) return [];
    const locked = trades.some((t) => t.sellerName === station.name && t.buyerName === evOwner.name && t.status !== "completed");
    const item = { id: `station-ev-${evOwner._id}`, requesterName: evOwner.name, requesterType: "ev_owner" as const, kwh: 14, label: "Incoming charging request", description: "EV owner is ready to purchase from your station inventory." };
    return locked || dismissedStationRequests.includes(item.id) ? [] : [item];
  }, [dismissedStationRequests, evOwner, station, trades]);

  const roleStats = useMemo(() => {
    if (selectedRole === "solar_home") {
      const generated = (solar?.availableEnergyKwh ?? 0) + 26;
      const self = Math.max(0, generated - (solar?.availableEnergyKwh ?? 0));
      return [
        { label: "Generated", value: `${generated} kWh`, helper: "Simulated rooftop output", icon: SunMedium },
        { label: "Self Use", value: `${self} kWh`, helper: "Household consumption", icon: Gauge },
        { label: "Surplus", value: `${solar?.availableEnergyKwh ?? 0} kWh`, helper: "Available for sale", icon: Zap },
        { label: "Sales", value: `${trades.filter((t) => t.sellerName === solar?.name).length}`, helper: "Accepted orders", icon: History },
      ];
    }
    if (selectedRole === "station") {
      return [
        { label: "Inventory", value: `${station?.availableEnergyKwh ?? 0} kWh`, helper: "Stored electricity", icon: Building2 },
        { label: "Selling Price", value: `${INR}${station?.basePrice ?? 0}/kWh`, helper: "Retail station price", icon: IndianRupee },
        { label: "Procurement", value: `${INR}${stationSpend.toFixed(0)}`, helper: "Solar procurement spend", icon: CreditCard },
        { label: "Sales", value: `${trades.filter((t) => t.sellerName === station?.name).length}`, helper: "Completed EV charges", icon: CheckCircle2 },
      ];
    }
    const best = visibleListings[0];
    return [
      { label: "Battery", value: `${evOwner?.batteryLevel ?? 0}%`, helper: "Current charge state", icon: BatteryCharging },
      { label: "Wallet", value: `${INR}${(evOwner?.walletBalance ?? 0).toFixed(0)}`, helper: "Virtual credits", icon: Wallet },
      { label: "Best Seller", value: best ? best.sellerName : "No supply", helper: best ? `${INR}${best.pricePerKwh}/kWh at ${best.distanceKm} km` : "Marketplace unavailable", icon: Search },
      { label: "Sessions", value: `${trades.filter((t) => t.buyerName === evOwner?.name).length}`, helper: "Charging history", icon: ArrowRightLeft },
    ];
  }, [evOwner, selectedRole, solar, station, stationSpend, trades, visibleListings]);

  useEffect(() => { socket.on("simulation:update", (payload: SimulationPayload) => { setUsers(payload.users || []); setVehicles(payload.vehicles || []); setTrades(payload.trades || []); }); return () => { socket.off("simulation:update"); }; }, []);
  async function refreshStaticData() { const [blockchainRes, adminRes, stationsRes] = await Promise.all([Api.getBlockchain(), Api.getAdminState(), Api.getStations()]); setTxs(blockchainRes.data as Tx[]); setAdminState(adminRes.data as AdminState); setStations(stationsRes.data); }
  async function refreshMarketplace() { if (!selectedLocation) return; const response = await Api.getListings(selectedLocation.lat, selectedLocation.lng); setListings(response.data); }
  useEffect(() => { refreshStaticData(); }, []);
  useEffect(() => { if (!selectedLocation) return; refreshMarketplace(); }, [selectedRole, selectedLocation?.lat, selectedLocation?.lng, stations.length, users.length]);
  useEffect(() => { const timer = setInterval(() => { refreshStaticData(); if (selectedLocation) refreshMarketplace(); }, 6000); return () => clearInterval(timer); }, [selectedLocation?.lat, selectedLocation?.lng]);
  useEffect(() => { if (solar) setSolarDraft({ availableEnergyKwh: Math.round(solar.availableEnergyKwh ?? 0), askingPricePerKwh: Math.round(solar.askingPricePerKwh ?? 18) }); }, [solar?.availableEnergyKwh, solar?.askingPricePerKwh, solar?._id]);
  useEffect(() => { if (station) setStationDraft({ basePrice: Math.round(station.basePrice ?? 18) }); }, [station?.basePrice, station?.id]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTheme = window.localStorage.getItem("voltshare-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(systemPrefersDark ? "dark" : "light");
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("voltshare-theme", theme);
  }, [theme]);

  async function withBusy(key: string, action: () => Promise<void>) { try { setBusyKey(key); await action(); await refreshStaticData(); await refreshMarketplace(); } finally { setBusyKey(null); } }
  async function buyEnergy(listing: Listing, kwh = 10) { if (!evOwner) return; await withBusy(`buy-${listing.sellerId}`, async () => { await Api.startTrade({ buyerId: evOwner._id, sellerId: String(listing.sellerId), kwh: Math.min(kwh, listing.availableEnergyKwh) }); }); }
  async function procureForStation(listing: Listing, kwh = 20) { if (!station || listing.sellerType !== "solar_home") return; await withBusy(`procure-${listing.sellerId}`, async () => { await Api.stationProcurement({ stationId: station.id, sellerId: String(listing.sellerId), kwh: Math.min(kwh, listing.availableEnergyKwh) }); }); }
  async function saveSolarListing() { if (!solar) return; await withBusy("save-solar-listing", async () => { await Api.updateSolarListing(solar._id, solarDraft); }); }
  async function saveStationPricing() { if (!station) return; await withBusy("save-station-price", async () => { await Api.updateStationSettings(station.id, stationDraft); }); }
  async function approveSolarRequest(request: PendingRequest) { if (!solar) return; await withBusy(`approve-${request.id}`, async () => { if (request.requesterType === "station" && station) await Api.stationProcurement({ stationId: station.id, sellerId: solar._id, kwh: request.kwh }); else if (evOwner) await Api.startTrade({ buyerId: evOwner._id, sellerId: solar._id, kwh: request.kwh }); }); setDismissedSolarRequests((current) => [...current, request.id]); }
  async function approveStationRequest(request: PendingRequest) { if (!station || !evOwner) return; await withBusy(`approve-${request.id}`, async () => { await Api.startTrade({ buyerId: evOwner._id, sellerId: station.id, kwh: request.kwh }); }); setDismissedStationRequests((current) => [...current, request.id]); }
  async function handleFindCharging() { const best = visibleListings[0]; if (!best) return; await buyEnergy(best, 10); }
  async function handleEmergency() { if (!institution) return; await withBusy("emergency", async () => { await Api.emergency({ institutionId: institution._id, requiredKwh: 20, urgency: 8 }); }); }
  async function handleRescue() { if (!evOwner) return; await withBusy("rescue", async () => { await Api.rescue({ strandedUserId: evOwner._id, neededKwh: 8 }); }); }
  async function runScenario(scenario: "solar" | "hospital" | "rescue" | "market") { await withBusy(`scenario-${scenario}`, async () => { await Api.runDemo(scenario); }); }

  const roleInfo = roleMeta[selectedRole];
  const RoleIcon = roleInfo.icon;

  if (stage === "landing") return <div className="min-h-screen overflow-x-hidden"><div className="pointer-events-none fixed inset-0"><div className="absolute left-[-12rem] top-[-8rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" /><div className="absolute right-[-8rem] top-20 h-72 w-72 rounded-full bg-emerald-400/8 blur-3xl" /></div><main className="mx-auto flex min-h-screen max-w-[1360px] items-center px-4 py-10 md:px-6 xl:px-8"><div className="grid w-full gap-8 lg:grid-cols-[1.15fr,0.85fr]"><motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="panel-shell relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-emerald-400/10" /><div className="relative"><div className="micro-banner mb-5">Demo simulation. No real energy or payments involved.</div><BrandName /><div className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--text-primary)] md:text-6xl">A cleaner energy marketplace for solar sellers, charging stations, and EV owners.</div><p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--text-secondary)]">VoltShare now follows a clean three-stakeholder marketplace model built for software engineering demos.</p><div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={() => setStage("auth")} className="btn btn-primary px-5 py-3 text-sm">Enter Demo Platform</button></div></div></motion.section><motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-4">{([{ title: "Solar Panel Owner", description: "Sell surplus rooftop energy to EV owners and charging stations.", icon: SunMedium }, { title: "Charging Station", description: "Buy electricity from solar sellers and resell stored inventory.", icon: Building2 }, { title: "EV Owner", description: "Compare sellers by price, distance, and available energy.", icon: CarFront }] as const).map((item) => { const Icon = item.icon; return <div key={item.title} className="panel-shell flex items-start gap-4"><div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-700 dark:border-white/10 dark:bg-white/5 dark:text-cyan-200"><Icon size={18} /></div><div><div className="text-sm font-semibold text-[color:var(--text-primary)]">{item.title}</div><div className="mt-1 text-sm leading-6 text-[color:var(--text-secondary)]">{item.description}</div></div></div>; })}</motion.section></div></main><SiteFooter /></div>;
  if (stage === "auth") return <div className="min-h-screen overflow-x-hidden px-4 py-10 md:px-6 xl:px-8"><div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1180px] items-center gap-8 lg:grid-cols-[0.95fr,1.05fr]"><motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="panel-shell"><BrandName /><div className="mt-8 text-3xl font-semibold text-[color:var(--text-primary)]">Demo access for the VoltShare marketplace</div><p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">Use a lightweight demo login, then choose the role you want to experience.</p><div className="mt-8 flex gap-2">{(["login", "register"] as const).map((mode) => <button key={mode} type="button" onClick={() => setAuthMode(mode)} className={`${authMode === mode ? "btn-chip btn-chip-active" : "btn-chip"}`}>{mode === "login" ? "Login" : "Register"}</button>)}</div></motion.section><motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="panel-shell"><div className="kicker mb-2">Demo Authentication</div><h2 className="section-title text-2xl">{authMode === "login" ? "Access your demo workspace" : "Create a demo workspace"}</h2><div className="mt-6 grid gap-4"><label className="grid gap-2"><span className="text-sm text-[color:var(--text-secondary)]">Full name</span><input value={sessionName} onChange={(e) => setSessionName(e.target.value)} className="input" placeholder="Your name" /></label><label className="grid gap-2"><span className="text-sm text-[color:var(--text-secondary)]">Email</span><input value={sessionEmail} onChange={(e) => setSessionEmail(e.target.value)} className="input" placeholder="demo@voltshare.in" /></label><label className="grid gap-2"><span className="text-sm text-[color:var(--text-secondary)]">Password</span><input type="password" className="input" defaultValue="voltshare-demo" /></label></div><div className="mt-6 flex flex-wrap items-center justify-between gap-3"><div className="text-xs text-[color:var(--text-muted)]">Simulation only. No real user accounts are created.</div><button type="button" onClick={() => setStage("role")} className="btn btn-primary px-5 py-3 text-sm">Continue to role selection</button></div></motion.section></div><SiteFooter /></div>;
  if (stage === "role") return <div className="min-h-screen overflow-x-hidden px-4 py-10 md:px-6 xl:px-8"><div className="mx-auto max-w-[1280px]"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center"><div className="kicker mb-2">Role Selection</div><h1 className="text-4xl font-semibold text-white">Choose your stakeholder role</h1><p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">Pick one of the three marketplace stakeholders to open a role-specific dashboard.</p></motion.div><div className="grid gap-5 lg:grid-cols-3">{(Object.entries(roleMeta) as Array<[RoleChoice, (typeof roleMeta)[RoleChoice]]>).map(([role, meta], index) => { const Icon = meta.icon; return <motion.button key={role} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -3 }} type="button" onClick={() => { setSelectedRole(role); setActiveTab("dashboard"); setStage("app"); }} className="panel-shell overflow-hidden text-left"><div className={`mb-5 rounded-[24px] border border-white/10 bg-gradient-to-br p-5 ${meta.accent}`}><div className="flex items-center justify-between"><div className="rounded-2xl border border-white/10 bg-black/10 p-3 text-cyan-200"><Icon size={20} /></div><ChevronRight size={16} className="text-slate-500" /></div><div className="mt-6 text-xl font-semibold text-white">{meta.label}</div><div className="mt-2 text-sm leading-6 text-slate-300">{meta.subtitle}</div></div><div className="text-sm text-slate-400">Enter dashboard</div></motion.button>; })}</div></div></div>;
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-12rem] top-[-8rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-72 w-72 rounded-full bg-emerald-400/8 blur-3xl" />
      </div>
      <header className="sticky top-0 z-[1200] border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1560px] flex-col gap-4 px-4 py-4 md:px-6 xl:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <BrandName />
              <div className="micro-banner hidden md:inline-flex">Simulation marketplace. No real energy transfer.</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="status-pill status-pill-success"><span className="h-2 w-2 rounded-full bg-current animate-pulse" /><span className="font-semibold">Marketplace Live</span></div>
              <div className="status-pill status-pill-info"><RadioTower size={14} /><span className="font-semibold">{onlineNodes} online nodes</span></div>
              <div className="command-chip"><Wallet size={14} className="text-cyan-700 dark:text-cyan-200" /><span className="font-semibold text-[color:var(--text-primary)]">{INR}{currentWallet.toFixed(0)}</span></div>
              <button type="button" onClick={() => setStage("role")} className="command-chip"><RoleIcon size={14} className="text-cyan-700 dark:text-cyan-200" /><span className="font-semibold text-[color:var(--text-primary)]">{roleInfo.label}</span></button>
              <button
                type="button"
                aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                className="theme-toggle-button"
              >
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -18, scale: 0.92 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex items-center gap-2"
                >
                  {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                  <span>{theme === "dark" ? "Light" : "Dark"}</span>
                </motion.span>
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {([
                ["dashboard", "Dashboard", LayoutDashboard],
                ["marketplace", "Marketplace", Search],
                ["wallet", "Wallet & History", Wallet],
                ["simulation", "Simulation Lab", Play],
              ] as const).map(([tab, label, Icon]) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`inline-flex items-center gap-2 ${activeTab === tab ? "btn-chip btn-chip-active" : "btn-chip"}`}>
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]"><span>{sessionName}</span><span className="text-[color:var(--text-muted)]">/</span><button type="button" onClick={() => setStage("auth")} className="btn btn-ghost px-3 py-1.5 text-xs">Switch demo account</button></div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1560px] px-4 pb-10 pt-8 md:px-6 xl:px-8">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel-shell mb-6 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${roleInfo.accent} opacity-80`} />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl"><div className="kicker mb-2">Role-based Marketplace Platform</div><h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{roleInfo.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{roleInfo.subtitle}</p></div>
            <div className="flex flex-wrap items-center gap-2"><Badge label={roleInfo.label} variant="info" /><Badge label={`${activeTrades.length} active trades`} variant="success" /><Badge label={`${INR}${avgPrice.toFixed(1)}/kWh avg`} variant="warning" /></div>
          </div>
        </motion.section>
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{roleStats.map((item, index) => <motion.div key={item.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}><Stat label={item.label} value={item.value} helper={item.helper} icon={item.icon} /></motion.div>)}</div>
            {selectedRole === "solar_home" && solar && <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]"><section className="panel-shell"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="kicker mb-1">Solar Seller Dashboard</div><h3 className="section-title">Surplus listing controls</h3></div><Badge label="Seller Console" variant="success" /></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-[24px] border border-white/10 bg-white/5 p-4"><div className="text-sm font-semibold text-white">Energy generation summary</div><div className="mt-4 space-y-3 text-sm text-slate-300"><div className="flex items-center justify-between"><span>Total generated</span><span>{(solar.availableEnergyKwh ?? 0) + 26} kWh</span></div><div className="flex items-center justify-between"><span>Self consumption</span><span>26 kWh</span></div><div className="flex items-center justify-between"><span>Surplus for sale</span><span>{solar.availableEnergyKwh ?? 0} kWh</span></div></div></div><div className="rounded-[24px] border border-white/10 bg-white/5 p-4"><div className="text-sm font-semibold text-white">Set listing strategy</div><div className="mt-4 grid gap-4"><label className="grid gap-2"><span className="text-sm text-slate-300">Surplus energy</span><input type="range" min={5} max={80} value={solarDraft.availableEnergyKwh} onChange={(e) => setSolarDraft((current) => ({ ...current, availableEnergyKwh: Number(e.target.value) }))} /><div className="text-xs text-slate-500">{solarDraft.availableEnergyKwh} kWh listed</div></label><label className="grid gap-2"><span className="text-sm text-slate-300">Asking price</span><input type="range" min={12} max={30} value={solarDraft.askingPricePerKwh} onChange={(e) => setSolarDraft((current) => ({ ...current, askingPricePerKwh: Number(e.target.value) }))} /><div className="text-xs text-slate-500">{INR}{solarDraft.askingPricePerKwh}/kWh</div></label><button type="button" disabled={busyKey === "save-solar-listing"} onClick={saveSolarListing} className="btn btn-primary px-4 py-3 text-sm disabled:opacity-50">Save listing settings</button></div></div></div></section><section className="panel-shell"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="kicker mb-1">Buyer Requests</div><h3 className="section-title">Incoming purchase requests</h3></div><Badge label="Auto-match ready" variant="warning" /></div><div className="space-y-3">{solarRequests.length === 0 ? <EmptyPanel title="No pending purchase requests" description="When EV owners or stations are ready to buy from this seller, the request queue will appear here." /> : solarRequests.map((request) => <RequestCard key={request.id} request={request} onApprove={() => approveSolarRequest(request)} onReject={() => setDismissedSolarRequests((current) => [...current, request.id])} />)}</div></section></div>}
            {selectedRole === "station" && station && <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]"><section className="panel-shell"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="kicker mb-1">Charging Station Dashboard</div><h3 className="section-title">Inventory and procurement</h3></div><Badge label={station.availableEnergyKwh < 120 ? "Low stock" : "Inventory healthy"} variant={station.availableEnergyKwh < 120 ? "warning" : "success"} /></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-[24px] border border-white/10 bg-white/5 p-4"><div className="text-sm font-semibold text-white">Stored electricity</div><div className="mt-4 text-4xl font-semibold text-white">{station.availableEnergyKwh} kWh</div><div className="mt-3"><ProgressBar value={station.availableEnergyKwh} max={360} color={metricTone(Math.round((station.availableEnergyKwh / 360) * 100))} /></div></div><div className="rounded-[24px] border border-white/10 bg-white/5 p-4"><div className="text-sm font-semibold text-white">Station selling price</div><div className="mt-4 grid gap-4"><input type="range" min={15} max={30} value={stationDraft.basePrice} onChange={(e) => setStationDraft({ basePrice: Number(e.target.value) })} /><div className="text-sm text-slate-400">Current retail price: <span className="font-medium text-white">{INR}{stationDraft.basePrice}/kWh</span></div><button type="button" disabled={busyKey === "save-station-price"} onClick={saveStationPricing} className="btn btn-primary px-4 py-3 text-sm disabled:opacity-50">Update station price</button></div></div></div></section><section className="panel-shell"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="kicker mb-1">Request Queue</div><h3 className="section-title">Incoming EV charging requests</h3></div><Badge label="Serve EV demand" variant="success" /></div><div className="space-y-3">{stationRequests.length === 0 ? <EmptyPanel title="No EV requests waiting" description="Once an EV owner is ready to charge from this station, a request card will appear here." /> : stationRequests.map((request) => <RequestCard key={request.id} request={request} onApprove={() => approveStationRequest(request)} onReject={() => setDismissedStationRequests((current) => [...current, request.id])} />)}</div></section></div>}
            {selectedRole === "ev_owner" && evOwner && <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]"><section className="panel-shell"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="kicker mb-1">EV Owner Dashboard</div><h3 className="section-title">Compare and buy available energy</h3></div><Badge label={`${visibleListings.length} sellers nearby`} variant="info" /></div><div className="grid gap-3 xl:grid-cols-2">{visibleListings.slice(0, 4).map((item) => <ListingCard key={String(item.sellerId)} listing={item} cta={busyKey === `buy-${item.sellerId}` ? "Launching..." : "Buy energy"} helper="Compare price, distance, and energy before starting a charge." disabled={busyKey === `buy-${item.sellerId}`} onAction={() => buyEnergy(item, 10)} />)}</div></section><section className="panel-shell"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="kicker mb-1">Vehicle Readiness</div><h3 className="section-title">Battery and cost outlook</h3></div><Badge label={evOwner.batteryLevel < 40 ? "Needs charging" : "Ready"} variant={evOwner.batteryLevel < 40 ? "warning" : "success"} /></div><div className="rounded-[24px] border border-white/10 bg-white/5 p-4"><div className="mb-3 flex items-center justify-between"><div className="text-sm font-semibold text-white">Current battery</div><div className="text-sm text-slate-400">{evOwner.batteryLevel}%</div></div><ProgressBar value={evOwner.batteryLevel} color={metricTone(evOwner.batteryLevel)} /><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-black/10 p-3"><div className="kicker mb-1">Estimated spend</div><div className="text-lg font-semibold text-white">{visibleListings[0] ? `${INR}${(visibleListings[0].pricePerKwh * 10).toFixed(0)}` : "--"}</div></div><div className="rounded-2xl border border-white/10 bg-black/10 p-3"><div className="kicker mb-1">Recommended seller</div><div className="text-lg font-semibold text-white">{visibleListings[0]?.sellerName ?? "No supply"}</div></div></div></div></section></div>}
          </div>
        )}
        {activeTab === "marketplace" && (
          <div className="grid gap-6 xl:grid-cols-[1.3fr,0.7fr]">
            <section className="panel-shell">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div><div className="kicker mb-1">Shared Marketplace</div><h2 className="section-title text-2xl">Browse live energy listings</h2><p className="mt-2 text-sm text-slate-400">Compare solar sellers and charging stations by price, distance, energy, and seller type.</p></div>
                <div className="flex flex-wrap gap-2">
                  <div className="command-chip"><SlidersHorizontal size={14} className="text-cyan-700 dark:text-cyan-200" /><select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="bg-transparent text-sm text-[color:var(--text-primary)] outline-none"><option className="bg-slate-950" value="distance">Sort: Distance</option><option className="bg-slate-950" value="price">Sort: Price</option><option className="bg-slate-950" value="energy">Sort: Energy</option></select></div>
                  <div className="command-chip"><Search size={14} className="text-cyan-700 dark:text-cyan-200" /><select value={sellerFilter} onChange={(e) => setSellerFilter(e.target.value as SellerFilter)} className="bg-transparent text-sm text-[color:var(--text-primary)] outline-none"><option className="bg-slate-950" value="all">All sellers</option><option className="bg-slate-950" value="solar_home">Solar sellers</option><option className="bg-slate-950" value="station">Charging stations</option></select></div>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">{visibleListings.map((item) => <ListingCard key={String(item.sellerId)} listing={item} cta={selectedRole === "station" ? (busyKey === `procure-${item.sellerId}` ? "Processing..." : "Procure power") : (busyKey === `buy-${item.sellerId}` ? "Launching..." : "Buy energy")} helper={selectedRole === "solar_home" ? "Use the marketplace to benchmark your listing." : selectedRole === "station" ? "Procure solar power to replenish station inventory." : "Start a simulated purchase from this seller."} disabled={selectedRole === "solar_home" || (selectedRole === "station" ? busyKey === `procure-${item.sellerId}` : busyKey === `buy-${item.sellerId}`)} onAction={selectedRole === "solar_home" ? undefined : selectedRole === "station" ? () => procureForStation(item, 20) : () => buyEnergy(item, 10)} />)}</div>
            </section>
            <section className="space-y-6">
              <div className="panel-shell"><div className="mb-4 flex items-center gap-2"><MapPinned size={18} className="text-cyan-300" /><div><div className="kicker mb-1">Location Context</div><h3 className="section-title">Marketplace coverage</h3></div></div><div className="grid gap-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-sm font-semibold text-white">Reference location</div><div className="mt-2 text-sm text-slate-400">{selectedRole === "station" ? station?.name ?? "Station" : selectedRole === "solar_home" ? solar?.name ?? "Solar seller" : evOwner?.name ?? "EV owner"}</div></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-sm font-semibold text-white">Seller mix</div><div className="mt-3 flex flex-wrap gap-2"><Badge label={`${stations.length} Stations`} variant="info" /><Badge label={`${solarSellers.length} Solar homes`} variant="success" /></div></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-sm font-semibold text-white">Average market price</div><div className="mt-2 text-2xl font-semibold text-white">{INR}{avgPrice.toFixed(1)}</div><div className="mt-1 text-sm text-slate-400">Dynamic pricing stays simulated and virtual.</div></div></div></div>
            </section>
          </div>
        )}
        {activeTab === "wallet" && (
          <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
            <section className="panel-shell"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="kicker mb-1">Wallet and Ledger</div><h2 className="section-title text-2xl">Financial snapshot</h2></div><Badge label="Virtual credits" variant="warning" /></div><div className="grid gap-4 md:grid-cols-2"><Stat label="Wallet Balance" value={`${INR}${currentWallet.toFixed(0)}`} helper="Simulation wallet credits only" icon={Wallet} /><Stat label="Completed Transactions" value={`${txs.length}`} helper="Mock settlement receipts logged" icon={History} /></div></section>
            <section className="panel-shell"><div className="mb-5 flex items-start justify-between gap-3"><div><div className="kicker mb-1">Settlement History</div><h2 className="section-title text-2xl">Recent transactions</h2></div><Badge label="Mock blockchain secondary" variant="info" /></div><div className="space-y-3">{txs.slice(0, 8).map((tx) => <div key={tx._id} className="rounded-[22px] border border-white/10 bg-white/5 p-4"><div className="mb-2 flex items-center justify-between gap-3"><div className="text-sm font-semibold text-white">{tx.seller} to {tx.buyer}</div><div className="text-xs font-mono text-amber-300">{tx.txHash.slice(0, 12)}...</div></div><div className="grid gap-3 text-sm text-slate-400 md:grid-cols-3"><div><span className="kicker mb-1 block">Energy</span><span className="text-white">{tx.kwh} kWh</span></div><div><span className="kicker mb-1 block">Amount</span><span className="text-white">{INR}{tx.price.toFixed(2)}</span></div><div><span className="kicker mb-1 block">Timestamp</span><span className="text-white">{formatTime(tx.timestamp)}</span></div></div></div>)}</div></section>
          </div>
        )}
        {activeTab === "simulation" && (
          <div className="space-y-6">
            <section className="panel-shell"><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><div className="kicker mb-1">Secondary Showcase Layer</div><h2 className="section-title text-2xl">Simulation Lab</h2><p className="mt-2 text-sm text-slate-400">Advanced live missions remain available as a secondary showcase, while the core product stays role-based and marketplace-first.</p></div><Badge label="Optional demo layer" variant="warning" /></div><div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">These mission-control flows are now positioned as demos, not the primary business model.</div></section>
            <div className="grid gap-6 xl:grid-cols-[1.9fr,1fr]"><div className="space-y-6"><section className="panel-shell"><IndiaMap users={users} vehicles={vehicles} stations={stations} trades={trades} listings={listings} loading={!evOwner && users.length === 0 && stations.length === 0} /><ActionCommandPanel onFindCharging={handleFindCharging} onEmergency={handleEmergency} onRescue={handleRescue} onRunScenario={runScenario} /><TelemetryStrip walletBalance={currentWallet} batteryLevel={currentBattery} activeTrades={activeTrades.length} energyTradedToday={energyTradedToday} onlineNodes={onlineNodes} avgPricePerKwh={avgPrice} /></section><LiveMissionBoard trades={trades} onFindCharging={handleFindCharging} onRunScenario={runScenario} /></div><OperationsRail trades={trades} txs={txs} activeTrades={activeTrades} adminState={adminState} listings={listings} solarSellerCount={solarSellers.length} stationCount={stations.length} vehicleCount={vehicles.length} walletBalance={currentWallet} onRunScenario={runScenario} onSpawnUsers={async () => { await withBusy("spawn-users", async () => { await Api.spawnUsers(); }); }} onSpawnVehicles={async () => { await withBusy("spawn-vehicles", async () => { await Api.spawnVehicles(); }); }} onTriggerEmergency={async () => { await withBusy("trigger-emergency", async () => { await Api.triggerEmergency(); }); }} /></div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
