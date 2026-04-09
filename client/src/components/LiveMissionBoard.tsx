import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  BatteryCharging,
  CarFront,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge, ProgressBar } from "./ui/Badge";

type Trade = {
  _id: string;
  buyerName?: string;
  sellerName?: string;
  createdAt?: string;
  vehicleId?: string;
  kwh: number;
  totalAmount: number;
  status: "created" | "moving" | "charging" | "completed";
  progressPct: number;
  emergency?: boolean;
};

type MissionFilter = "all" | "moving" | "charging" | "completed";

const INR = "\u20B9";

function formatMissionTime(value?: string) {
  if (!value) return "Live";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function phaseIndex(status: Trade["status"]) {
  switch (status) {
    case "created":
      return 0;
    case "moving":
      return 1;
    case "charging":
      return 2;
    case "completed":
      return 3;
    default:
      return 0;
  }
}

function missionMeta(trade: Trade) {
  if (trade.emergency && (trade.buyerName ?? "").toLowerCase().includes("hospital")) {
    return {
      title: "Emergency Dispatch",
      icon: ShieldAlert,
      accent: "border-red-200 bg-rose-50 dark:border-red-400/18 dark:bg-red-400/10",
      iconTint: "text-rose-700 bg-rose-100 dark:text-red-200 dark:bg-red-400/14",
      progress: "red" as const,
    };
  }

  if (trade.emergency) {
    return {
      title: "Highway Rescue",
      icon: AlertTriangle,
      accent: "border-amber-200 bg-amber-50 dark:border-amber-400/18 dark:bg-amber-400/10",
      iconTint: "text-amber-700 bg-amber-100 dark:text-amber-200 dark:bg-amber-400/14",
      progress: "amber" as const,
    };
  }

  if ((trade.sellerName ?? "").toLowerCase().includes("station")) {
    return {
      title: "Marketplace Match",
      icon: Sparkles,
      accent: "border-violet-200 bg-violet-50 dark:border-violet-400/18 dark:bg-violet-400/10",
      iconTint: "text-violet-700 bg-violet-100 dark:text-violet-200 dark:bg-violet-400/14",
      progress: "blue" as const,
    };
  }

  return {
    title: "Charging Mission",
    icon: Zap,
    accent: "border-cyan-200 bg-cyan-50 dark:border-cyan-400/18 dark:bg-cyan-400/10",
    iconTint: "text-cyan-700 bg-cyan-100 dark:text-cyan-200 dark:bg-cyan-400/14",
    progress: "cyan" as const,
  };
}

function MissionCard({ trade }: { trade: Trade }) {
  const meta = missionMeta(trade);
  const Icon = meta.icon;
  const phases = ["Locked", "En Route", "Charging", "Settled"];
  const current = phaseIndex(trade.status);

  return (
    <motion.article
      layout
      whileHover={{ y: -2 }}
      className={`rounded-[26px] border p-4 shadow-[0_18px_44px_rgba(2,6,23,0.2)] backdrop-blur-xl transition-all ${meta.accent} ${
        trade.status === "completed" ? "opacity-85" : ""
      }`}
    >
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className={`rounded-2xl p-3 ${meta.iconTint}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold text-[color:var(--text-primary)]">{meta.title}</div>
            <div className="mt-1 text-xs text-[color:var(--text-secondary)]">
              {trade.sellerName ?? "Supply Source"} to {trade.buyerName ?? "Destination"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            label={trade.status === "moving" ? "EN ROUTE" : trade.status === "completed" ? "SETTLED" : trade.status.toUpperCase()}
            variant={
              trade.status === "completed"
                ? "success"
                : trade.status === "charging"
                  ? "warning"
                  : trade.emergency
                    ? "danger"
                    : "info"
            }
            size="sm"
          />
          <div className="text-[11px] text-[color:var(--text-muted)]">{formatMissionTime(trade.createdAt)}</div>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Source</div>
          <div className="mt-1 text-sm font-medium text-[color:var(--text-primary)]">{trade.sellerName ?? "Unknown"}</div>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Destination</div>
          <div className="mt-1 text-sm font-medium text-[color:var(--text-primary)]">{trade.buyerName ?? "Unknown"}</div>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Energy</div>
          <div className="mt-1 text-sm font-medium text-[color:var(--text-primary)]">{trade.kwh} kWh</div>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Settlement Value</div>
          <div className="mt-1 text-sm font-medium text-[color:var(--text-primary)]">{INR}{trade.totalAmount.toFixed(2)}</div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-secondary)] px-3 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Mission Progress</div>
          <div className="text-xs font-semibold text-[color:var(--text-primary)]">{trade.progressPct}%</div>
        </div>
        <ProgressBar value={trade.progressPct} color={meta.progress} />
        <div className="mt-3 flex flex-wrap gap-2">
          {phases.map((phase, index) => (
            <div
              key={phase}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                index === current
                  ? "btn-chip btn-chip-active"
                  : index < current
                    ? "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100"
                    : "btn-chip px-2.5 py-1 text-[11px]"
              }`}
            >
              {phase}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2 text-xs text-[color:var(--text-secondary)] md:grid-cols-3">
        <div className="flex items-center gap-2">
          <CarFront size={14} className="text-[color:var(--text-muted)]" />
          <span>{trade.vehicleId ?? "Vehicle assigned at dispatch"}</span>
        </div>
        <div className="flex items-center gap-2">
          <BatteryCharging size={14} className="text-[color:var(--text-muted)]" />
          <span>{trade.status === "completed" ? "Energy delivered" : "Battery transfer live"}</span>
        </div>
        <div className="flex items-center gap-2">
          {trade.status === "completed" ? (
            <CheckCircle2 size={14} className="text-emerald-300" />
          ) : (
            <ArrowRightLeft size={14} className="text-cyan-300" />
          )}
          <span>{trade.status === "completed" ? "Settlement receipt created" : "Route locked and monitored"}</span>
        </div>
      </div>
    </motion.article>
  );
}

export function LiveMissionBoard({
  trades,
  onFindCharging,
  onRunScenario,
}: {
  trades: Trade[];
  onFindCharging: () => void;
  onRunScenario: (scenario: "solar" | "hospital" | "rescue" | "market") => void;
}) {
  const [filter, setFilter] = useState<MissionFilter>("all");

  const filteredTrades = useMemo(() => {
    if (filter === "all") return trades;
    return trades.filter((trade) => trade.status === filter);
  }, [filter, trades]);

  const activeCount = trades.filter((trade) => trade.status !== "completed").length;

  return (
    <section className="panel-shell">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="kicker mb-1">Execution Layer</div>
          <h3 className="section-title">Live Missions</h3>
          <p className="mt-1 text-sm text-slate-400">
            Track charging, rescue, and emergency dispatch in real time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge label={`${activeCount} active`} variant="success" />
          {(["all", "moving", "charging", "completed"] as MissionFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                filter === value
                  ? "btn-chip btn-chip-active"
                  : "btn-chip"
              }`}
            >
              {value === "all" ? "All" : value === "moving" ? "En Route" : value === "charging" ? "Charging" : "Settled"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTrades.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[26px] border border-[color:var(--border-strong)] bg-[color:var(--surface-secondary)] px-5 py-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/18 dark:bg-cyan-400/12 dark:text-cyan-200">
              <Activity size={22} />
            </div>
            <div className="text-lg font-semibold text-[color:var(--text-primary)]">No active missions</div>
            <div className="mt-2 text-sm text-[color:var(--text-secondary)]">
              Start a charge, rescue, or emergency dispatch to see live operations here.
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={onFindCharging}
                className="btn btn-primary"
              >
                Find Nearby Energy
              </button>
              <button
                type="button"
                onClick={() => onRunScenario("market")}
                className="btn btn-secondary"
              >
                Launch Demo Scenario
              </button>
            </div>
          </motion.div>
        ) : (
          filteredTrades.map((trade, index) => (
            <motion.div
              key={trade._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.26 }}
            >
              <MissionCard trade={trade} />
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
