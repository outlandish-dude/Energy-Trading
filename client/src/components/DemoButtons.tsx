import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  CarFront,
  Home,
  ShieldAlert,
  Sparkles,
  SunMedium,
} from "lucide-react";
import { Badge } from "./ui/Badge";

type Props = {
  onRun: (scenario: "solar" | "hospital" | "rescue" | "market") => void;
};

const scenarios = [
  {
    key: "solar" as const,
    label: "Solar Home Charge",
    icon: SunMedium,
    accent: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/18 dark:bg-emerald-400/10 dark:text-emerald-50",
    iconShell: "border-emerald-200 bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50 text-emerald-700 dark:border-emerald-300/18 dark:bg-gradient-to-br dark:from-emerald-400/20 dark:via-emerald-300/12 dark:to-amber-300/16 dark:text-emerald-200",
    description: "Route an EV to a direct solar seller",
    chip: "Fast",
    meta: "Distributed solar flow",
  },
  {
    key: "hospital" as const,
    label: "Hospital Emergency",
    icon: ShieldAlert,
    accent: "border-red-200 bg-rose-50 text-rose-950 shadow-[0_0_0_1px_rgba(248,113,113,0.08)] dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-50",
    iconShell: "border-red-200 bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50 text-rose-700 dark:border-red-300/18 dark:bg-gradient-to-br dark:from-red-400/20 dark:via-red-300/12 dark:to-amber-300/14 dark:text-red-200",
    description: "Trigger urgent institutional power dispatch",
    chip: "Recommended",
    meta: "Most visual live response",
  },
  {
    key: "rescue" as const,
    label: "Highway Rescue",
    icon: CarFront,
    accent: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-400/18 dark:bg-amber-400/10 dark:text-amber-50",
    iconShell: "border-amber-200 bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-50 text-amber-700 dark:border-amber-300/18 dark:bg-gradient-to-br dark:from-amber-400/20 dark:via-amber-300/10 dark:to-yellow-200/14 dark:text-amber-200",
    description: "Dispatch nearby EV assistance to a stranded vehicle",
    chip: "Live",
    meta: "Rescue route + charge",
  },
  {
    key: "market" as const,
    label: "Live Marketplace",
    icon: Activity,
    accent: "border-cyan-200 bg-cyan-50 text-cyan-950 dark:border-cyan-400/18 dark:bg-cyan-400/10 dark:text-cyan-50",
    iconShell: "border-cyan-200 bg-gradient-to-br from-cyan-100 via-sky-50 to-violet-50 text-cyan-700 dark:border-cyan-300/18 dark:bg-gradient-to-br dark:from-cyan-400/20 dark:via-blue-400/14 dark:to-violet-400/14 dark:text-cyan-200",
    description: "Auto-run the nearest supply mission",
    chip: "1 Click",
    meta: "Auto-match showcase",
  },
];

export function DemoButtons({ onRun }: Props) {
  return (
    <div className="grid gap-2.5">
      {scenarios.map((scenario, index) => {
        const Icon = scenario.icon as LucideIcon;
        return (
          <motion.button
            key={scenario.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => onRun(scenario.key)}
            className={`group w-full rounded-[22px] border p-3 text-left shadow-[0_16px_40px_rgba(2,6,23,0.1)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(8,15,39,0.2)] dark:hover:border-white/20 dark:hover:shadow-[0_18px_44px_rgba(8,15,39,0.32)] ${scenario.accent}`}
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-2xl border p-2.5 shadow-inner shadow-black/10 ${scenario.iconShell}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--text-primary)]">{scenario.label}</div>
                    <div className="mt-1 text-xs leading-5 text-[color:var(--text-secondary)]">{scenario.description}</div>
                  </div>
                  <Badge
                    label={scenario.chip}
                    variant={scenario.key === "hospital" ? "danger" : scenario.key === "rescue" ? "warning" : "info"}
                    size="sm"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    {scenario.key === "solar" && <Home size={12} />}
                    {scenario.key === "hospital" && <ShieldAlert size={12} />}
                    {scenario.key === "rescue" && <CarFront size={12} />}
                    {scenario.key === "market" && <Sparkles size={12} />}
                    <span>{scenario.meta}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--text-secondary)] transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--text-primary)]">
                    <span>Launch</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
