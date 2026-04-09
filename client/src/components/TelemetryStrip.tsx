import { motion } from "framer-motion";
import {
  Activity,
  ArrowRightLeft,
  BatteryCharging,
  IndianRupee,
  Radio,
  Wallet,
} from "lucide-react";
import { ProgressBar } from "./ui/Badge";

const INR = "\u20B9";

function TelemetryItem({
  icon: Icon,
  label,
  value,
  caption,
  tone,
  progress,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  caption: string;
  tone: "cyan" | "emerald" | "amber" | "violet" | "blue";
  progress?: { value: number; color: "cyan" | "green" | "amber" | "blue" | "red" };
}) {
  const tones = {
    cyan: "border-cyan-400/15 bg-cyan-400/8 text-cyan-50",
    emerald: "border-emerald-400/15 bg-emerald-400/8 text-emerald-50",
    amber: "border-amber-400/15 bg-amber-400/8 text-amber-50",
    violet: "border-violet-400/15 bg-violet-400/8 text-violet-50",
    blue: "border-sky-400/15 bg-sky-400/8 text-sky-50",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-[24px] border px-4 py-4 shadow-[0_12px_34px_rgba(2,6,23,0.2)] backdrop-blur-xl ${tones[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
          <div className="mt-1 text-xs leading-5 text-white/65">{caption}</div>
        </div>
        <div className="rounded-2xl bg-black/20 p-2.5">
          <Icon size={16} />
        </div>
      </div>
      {progress && (
        <div className="mt-3">
          <ProgressBar value={progress.value} color={progress.color} animated />
        </div>
      )}
    </motion.div>
  );
}

export function TelemetryStrip({
  walletBalance,
  batteryLevel,
  activeTrades,
  energyTradedToday,
  onlineNodes,
  avgPricePerKwh,
}: {
  walletBalance: number;
  batteryLevel: number;
  activeTrades: number;
  energyTradedToday: number;
  onlineNodes: number;
  avgPricePerKwh: number | null;
}) {
  const batteryColor =
    batteryLevel >= 70 ? "green" : batteryLevel >= 35 ? "amber" : "red";

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.42 }}
      className="panel-shell"
    >
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="kicker mb-1">Network Telemetry</div>
          <h3 className="section-title">Mission Metrics</h3>
        </div>
        <div className="text-sm text-slate-400">
          Compact live telemetry bridging dispatch actions and active missions.
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <TelemetryItem
          icon={Wallet}
          label="Wallet Balance"
          value={`${INR}${walletBalance.toFixed(2)}`}
          caption="Virtual credits ready for charging flows."
          tone="blue"
        />
        <TelemetryItem
          icon={BatteryCharging}
          label="Vehicle Battery"
          value={`${batteryLevel}%`}
          caption="Current EV owner charge state."
          tone="emerald"
          progress={{ value: batteryLevel, color: batteryColor }}
        />
        <TelemetryItem
          icon={ArrowRightLeft}
          label="Active Trades"
          value={`${activeTrades}`}
          caption="Live missions currently moving or charging."
          tone="cyan"
        />
        <TelemetryItem
          icon={Activity}
          label="Energy Traded"
          value={`${energyTradedToday} kWh`}
          caption="Aggregate volume across the simulation timeline."
          tone="violet"
        />
        <TelemetryItem
          icon={avgPricePerKwh === null ? Radio : IndianRupee}
          label={avgPricePerKwh === null ? "Online Nodes" : "Avg Price / kWh"}
          value={avgPricePerKwh === null ? `${onlineNodes}` : `${INR}${avgPricePerKwh.toFixed(1)}`}
          caption={avgPricePerKwh === null ? "Stations and sellers currently online." : "Current dynamic marketplace pricing."}
          tone="amber"
        />
      </div>
    </motion.section>
  );
}
