import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  RadioTower,
  Settings2,
  ShieldCheck,
  Wallet,
  Waves,
} from "lucide-react";
import { BrandName } from "./Logo";

const INR = "\u20B9";

function StatusPill({
  icon: Icon,
  label,
  value,
  tone,
  pulse = false,
  className = "",
}: {
  icon: typeof RadioTower;
  label: string;
  value: string;
  tone: "emerald" | "amber" | "cyan" | "blue";
  pulse?: boolean;
  className?: string;
}) {
  const tones = {
    emerald: "status-pill-success",
    amber: "status-pill-warning",
    cyan: "status-pill-info",
    blue: "status-pill-blue",
  };

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className={`status-pill ${tones[tone]} ${className}`}
    >
      <Icon size={14} className="shrink-0" />
      <span className="text-[color:var(--text-secondary)] dark:text-current/80">{label}</span>
      {pulse && <span className="h-2 w-2 rounded-full bg-current opacity-90 animate-pulse" />}
      <span className="font-semibold text-current">{value}</span>
    </motion.div>
  );
}

function CommandChip({
  icon: Icon,
  children,
  accent = "default",
}: {
  icon: typeof Wallet;
  children: ReactNode;
  accent?: "default" | "wallet";
}) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      className={`command-chip ${accent === "wallet" ? "shadow-[0_0_20px_rgba(250,204,21,0.14)]" : ""}`}
    >
      <Icon size={14} className={accent === "wallet" ? "text-amber-600 dark:text-amber-300" : "text-cyan-700 dark:text-cyan-300"} />
      {children}
    </motion.div>
  );
}

export function OperationsNavbar({
  walletBalance,
  activeTrades,
  stationCount,
  vehicleCount,
  roleLabel,
}: {
  walletBalance: number;
  activeTrades: number;
  stationCount: number;
  vehicleCount: number;
  roleLabel: string;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/72 shadow-[0_18px_50px_rgba(2,6,23,0.34)] backdrop-blur-2xl"
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/45 to-transparent" />

      <div className="mx-auto flex h-[78px] max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <BrandName />
        </div>

        <div className="hidden min-w-0 items-center justify-center gap-2 lg:flex xl:flex-1">
          <StatusPill
            icon={ShieldCheck}
            label="Mode"
            value="Simulation"
            tone="amber"
          />
          <StatusPill
            icon={RadioTower}
            label="Grid"
            value="Online"
            tone="emerald"
            pulse
          />
          <StatusPill
            icon={Waves}
            label="Sync"
            value="Live"
            tone="cyan"
          />
          <StatusPill
            icon={RadioTower}
            label="Vehicles"
            value={`${vehicleCount}`}
            tone="blue"
            className="hidden xl:inline-flex"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <CommandChip icon={Wallet} accent="wallet">
              <span className="text-[color:var(--text-secondary)]">Wallet</span>
              <span className="font-semibold text-[color:var(--text-primary)]">{INR}{walletBalance.toFixed(0)}</span>
            </CommandChip>
          </div>

          <div className="md:hidden">
            <CommandChip icon={Wallet} accent="wallet">
              <span className="font-semibold text-[color:var(--text-primary)]">{INR}{walletBalance.toFixed(0)}</span>
            </CommandChip>
          </div>

          <CommandChip icon={ShieldCheck}>
            <span className="hidden text-[color:var(--text-secondary)] lg:inline">Role</span>
            <span className="font-medium text-[color:var(--text-primary)]">{roleLabel}</span>
            <ChevronDown size={12} className="hidden text-[color:var(--text-muted)] lg:inline" />
          </CommandChip>

          <div className="hidden sm:flex">
            <CommandChip icon={RadioTower}>
              <span className="text-[color:var(--text-secondary)]">Stations</span>
              <span className="font-medium text-[color:var(--text-primary)]">{stationCount}</span>
            </CommandChip>
          </div>

          <button
            type="button"
            aria-label={`Alerts and active missions: ${activeTrades}`}
            className="icon-command-button"
          >
            <Bell size={16} className="text-rose-300" />
            <span className="sr-only">Alerts</span>
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {activeTrades}
            </span>
          </button>

          <button
            type="button"
            aria-label="Open command settings"
            className="icon-command-button hidden md:inline-flex"
          >
            <Settings2 size={16} className="text-cyan-300" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
