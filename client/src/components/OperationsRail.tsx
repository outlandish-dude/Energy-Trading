import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRightLeft,
  BatteryCharging,
  Blocks,
  CheckCircle2,
  ChevronRight,
  Play,
  ShieldAlert,
  Truck,
  Users,
} from "lucide-react";
import { Badge } from "./ui/Badge";
import { DemoButtons } from "./DemoButtons";

type Scenario = "solar" | "hospital" | "rescue" | "market";

type Trade = {
  _id: string;
  buyerName?: string;
  sellerName?: string;
  createdAt?: string;
  kwh: number;
  totalAmount: number;
  status: "created" | "moving" | "charging" | "completed";
  progressPct: number;
  emergency?: boolean;
};

type Tx = {
  _id: string;
  buyer: string;
  seller: string;
  kwh: number;
  price: number;
  txHash: string;
  timestamp: string;
};

type AdminState = {
  users: number;
  vehicles: number;
  activeTrades: number;
  totalTrades: number;
} | null;

type Listing = {
  pricePerKwh: number;
};

type FeedItem = {
  id: string;
  type: "trade" | "movement" | "charging" | "complete" | "emergency" | "blockchain" | "simulation";
  title: string;
  subtitle: string;
  time: string;
  sortTs: number;
  chip: string;
};

const INR = "\u20B9";

function railTime(value?: string) {
  if (!value) {
    return { label: "Live", ts: Date.now() - 1000 };
  }

  const date = new Date(value);
  return {
    label: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    ts: date.getTime(),
  };
}

function feedTone(type: FeedItem["type"]) {
  switch (type) {
    case "trade":
      return {
        icon: ArrowRightLeft,
        tint: "text-cyan-300 bg-cyan-400/10 border-cyan-400/15",
      };
    case "movement":
      return {
        icon: Truck,
        tint: "text-sky-300 bg-sky-400/10 border-sky-400/15",
      };
    case "charging":
      return {
        icon: BatteryCharging,
        tint: "text-violet-300 bg-violet-400/10 border-violet-400/15",
      };
    case "complete":
      return {
        icon: CheckCircle2,
        tint: "text-emerald-300 bg-emerald-400/10 border-emerald-400/15",
      };
    case "emergency":
      return {
        icon: ShieldAlert,
        tint: "text-red-300 bg-red-400/10 border-red-400/15",
      };
    case "blockchain":
      return {
        icon: Blocks,
        tint: "text-amber-300 bg-amber-400/10 border-amber-400/15",
      };
    default:
      return {
        icon: Play,
        tint: "text-violet-300 bg-violet-400/10 border-violet-400/15",
      };
  }
}

function RailModule({
  title,
  subtitle,
  live = false,
  children,
}: {
  title: string;
  subtitle?: string;
  live?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rail-panel">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="kicker mb-1">{subtitle ?? "Operations Module"}</div>
          <h3 className="section-title text-base">{title}</h3>
        </div>
        {live && (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

export function OperationsRail({
  trades,
  txs,
  activeTrades,
  adminState,
  listings,
  solarSellerCount,
  stationCount,
  vehicleCount,
  walletBalance,
  onRunScenario,
  onSpawnUsers,
  onSpawnVehicles,
  onTriggerEmergency,
}: {
  trades: Trade[];
  txs: Tx[];
  activeTrades: Trade[];
  adminState: AdminState;
  listings: Listing[];
  solarSellerCount: number;
  stationCount: number;
  vehicleCount: number;
  walletBalance: number;
  onRunScenario: (scenario: Scenario) => void;
  onSpawnUsers: () => void;
  onSpawnVehicles: () => void;
  onTriggerEmergency: () => void;
}) {
  const [showAdmin, setShowAdmin] = useState(false);

  const activityFeed = useMemo(() => {
    const tradeItems: FeedItem[] = trades.slice(0, 8).map((trade) => {
      const { label, ts } = railTime(trade.createdAt);

      if (trade.emergency) {
        return {
          id: `trade-${trade._id}`,
          type: "emergency",
          title: "Emergency power request active",
          subtitle: `${trade.buyerName ?? "Institution"} routed for ${trade.kwh} kWh`,
          time: label,
          sortTs: ts,
          chip: trade.status.toUpperCase(),
        };
      }

      if (trade.status === "moving") {
        return {
          id: `trade-${trade._id}`,
          type: "movement",
          title: "Vehicle dispatched",
          subtitle: `${trade.sellerName ?? "Seller"} to ${trade.buyerName ?? "Buyer"}`,
          time: label,
          sortTs: ts,
          chip: "EN ROUTE",
        };
      }

      if (trade.status === "charging") {
        return {
          id: `trade-${trade._id}`,
          type: "charging",
          title: "Charging in progress",
          subtitle: `${trade.kwh} kWh transfer now active`,
          time: label,
          sortTs: ts,
          chip: "CHARGING",
        };
      }

      if (trade.status === "completed") {
        return {
          id: `trade-${trade._id}`,
          type: "complete",
          title: "Trade settled successfully",
          subtitle: `${trade.sellerName ?? "Seller"} completed delivery`,
          time: label,
          sortTs: ts,
          chip: "COMPLETE",
        };
      }

      return {
        id: `trade-${trade._id}`,
        type: "trade",
        title: "Trade created",
        subtitle: `${trade.buyerName ?? "Buyer"} requested ${trade.kwh} kWh`,
        time: label,
        sortTs: ts,
        chip: "NEW",
      };
    });

    const chainItems: FeedItem[] = txs.slice(0, 4).map((tx) => {
      const { label, ts } = railTime(tx.timestamp);
      return {
        id: `tx-${tx._id}`,
        type: "blockchain",
        title: "Settlement logged",
        subtitle: `${tx.buyer} to ${tx.seller} | ${INR}${tx.price.toFixed(0)}`,
        time: label,
        sortTs: ts,
        chip: "LEDGER",
      };
    });

    return [...tradeItems, ...chainItems]
      .sort((a, b) => b.sortTs - a.sortTs)
      .slice(0, 10);
  }, [trades, txs]);

  const avgPrice = listings.length
    ? `${INR}${(listings.reduce((sum, item) => sum + item.pricePerKwh, 0) / listings.length).toFixed(1)}`
    : "--";
  const emergencyCount = trades.filter((trade) => trade.emergency && trade.status !== "completed").length;
  const onlineNodes = stationCount + solarSellerCount;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.45 }}
      className="space-y-4 xl:max-h-[calc(100vh-8.5rem)] xl:overflow-y-auto xl:pr-1"
    >
      <RailModule title="Live Energy Activity" subtitle="Operations Feed" live>
        <div className="max-h-[24rem] space-y-2 overflow-y-auto pr-1">
          {activityFeed.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--border-strong)] bg-[color:var(--surface-secondary)] px-4 py-6 text-sm text-[color:var(--text-secondary)]">
              No live events yet. Run a scenario to start the operations feed.
            </div>
          ) : (
            activityFeed.map((item, index) => {
              const tone = feedTone(item.type);
              const Icon = tone.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.24 }}
                  whileHover={{ x: 2 }}
                  className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-2xl border p-2 ${tone.tint}`}>
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate text-sm font-medium text-[color:var(--text-primary)]">{item.title}</div>
                        <div className="text-[11px] text-[color:var(--text-muted)]">{item.time}</div>
                      </div>
                      <div className="mt-1 text-xs leading-5 text-[color:var(--text-secondary)]">{item.subtitle}</div>
                      <div className="mt-2">
                        <Badge
                          label={item.chip}
                          variant={
                            item.type === "emergency"
                              ? "danger"
                              : item.type === "complete"
                                ? "success"
                                : item.type === "blockchain"
                                  ? "warning"
                                  : "info"
                          }
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </RailModule>

      <RailModule title="Simulation Launcher" subtitle="One-Click Simulations">
        <div className="mb-3 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-white px-3 py-2.5 dark:border-cyan-400/12 dark:from-cyan-400/10 dark:via-sky-400/6 dark:to-transparent">
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-200/85">Showcase Flows</div>
          <div className="mt-1 text-xs leading-5 text-[color:var(--text-secondary)]">
            Launch ready-made product stories instantly without touching the live network controls.
          </div>
        </div>
        <DemoButtons onRun={onRunScenario} />
      </RailModule>

      <RailModule title="Quick Network Summary" subtitle="Network Telemetry">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Active Vehicles</div>
            <div className="mt-1 text-2xl font-semibold text-[color:var(--text-primary)]">{vehicleCount}</div>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Live Trades</div>
            <div className="mt-1 text-2xl font-semibold text-[color:var(--text-primary)]">{activeTrades.length}</div>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Online Nodes</div>
            <div className="mt-1 text-2xl font-semibold text-[color:var(--text-primary)]">{onlineNodes}</div>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Avg Price</div>
            <div className="mt-1 text-2xl font-semibold text-[color:var(--text-primary)]">{avgPrice}</div>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Emergencies</div>
            <div className="mt-1 text-2xl font-semibold text-[color:var(--text-primary)]">{emergencyCount}</div>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Wallet</div>
            <div className="mt-1 text-2xl font-semibold text-[color:var(--text-primary)]">{INR}{walletBalance.toFixed(0)}</div>
          </div>
        </div>
      </RailModule>

      <RailModule title="Settlement Ledger" subtitle="Blockchain Preview">
        <div className="space-y-2">
          {txs.slice(0, 4).map((tx) => (
            <div key={tx._id} className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="truncate text-xs font-mono text-amber-300">{tx.txHash.slice(0, 12)}...</div>
                <div className="text-[11px] text-[color:var(--text-muted)]">{railTime(tx.timestamp).label}</div>
              </div>
              <div className="text-sm text-[color:var(--text-primary)]">{tx.buyer} {"->"} {tx.seller}</div>
              <div className="mt-1 flex items-center justify-between text-xs text-[color:var(--text-secondary)]">
                <span>{tx.kwh} kWh</span>
                <span className="font-medium text-emerald-300">{INR}{tx.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary w-full"
          >
            Open Explorer
          </button>
        </div>
      </RailModule>

      <RailModule title="Simulation Controls" subtitle="Admin Tools">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Users</div>
            <div className="mt-1 text-xl font-semibold text-[color:var(--text-primary)]">{adminState?.users ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] p-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Trades</div>
            <div className="mt-1 text-xl font-semibold text-[color:var(--text-primary)]">{adminState?.totalTrades ?? 0}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdmin((value) => !value)}
          className="btn btn-secondary mb-3 flex w-full items-center justify-between px-3 py-2 text-left text-sm"
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={14} className="text-cyan-300" />
            Control Center
          </span>
          <ChevronRight size={14} className={`transition-transform ${showAdmin ? "rotate-90" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {showAdmin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={onSpawnUsers}
                  className="btn btn-secondary flex items-center justify-between px-3 py-3 text-left text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Users size={14} className="text-sky-300" />
                    Spawn 50 Demo Users
                  </span>
                  <ChevronRight size={14} className="text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={onSpawnVehicles}
                  className="btn btn-secondary flex items-center justify-between px-3 py-3 text-left text-sm"
                >
                  <span className="flex items-center gap-2">
                    <Truck size={14} className="text-emerald-300" />
                    Spawn Vehicles Across India
                  </span>
                  <ChevronRight size={14} className="text-slate-500" />
                </button>
                <button
                  type="button"
                  onClick={onTriggerEmergency}
                  className="btn btn-danger flex items-center justify-between px-3 py-3 text-left text-sm"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-red-200" />
                    Trigger Emergency Event
                  </span>
                  <ChevronRight size={14} className="text-red-200/70" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </RailModule>
    </motion.aside>
  );
}
