import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryCharging,
  ChevronRight,
  Play,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  Zap,
} from "lucide-react";

type Scenario = "solar" | "hospital" | "rescue" | "market";

type Props = {
  onFindCharging: () => void;
  onEmergency: () => void;
  onRescue: () => void;
  onRunScenario: (scenario: Scenario) => void;
};

const scenarioOptions: Array<{ key: Scenario; title: string; caption: string }> = [
  { key: "solar", title: "Solar Home", caption: "Run direct seller charging" },
  { key: "hospital", title: "Emergency", caption: "Dispatch institutional backup" },
  { key: "rescue", title: "Rescue", caption: "Simulate stranded EV support" },
  { key: "market", title: "Marketplace", caption: "Auto-run nearest supply trade" },
];

function ActionCard({
  icon: Icon,
  title,
  description,
  accent,
  onClick,
  featured = false,
}: {
  icon: typeof BatteryCharging;
  title: string;
  description: string;
  accent: "cyan" | "red" | "amber" | "violet";
  onClick: () => void;
  featured?: boolean;
}) {
  const accents = {
    cyan: "border-cyan-200 bg-cyan-50 text-sky-900 hover:border-cyan-300 hover:bg-cyan-100 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-50 dark:hover:border-cyan-300/35 dark:hover:bg-cyan-400/14",
    red: "border-red-200 bg-rose-50 text-rose-900 hover:border-red-300 hover:bg-rose-100 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-50 dark:hover:border-red-300/35 dark:hover:bg-red-400/14",
    amber: "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-50 dark:hover:border-amber-300/35 dark:hover:bg-amber-400/14",
    violet: "border-violet-200 bg-violet-50 text-violet-900 hover:border-violet-300 hover:bg-violet-100 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-50 dark:hover:border-violet-300/35 dark:hover:bg-violet-400/14",
  };

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`group w-full rounded-[24px] border px-4 py-4 text-left shadow-[0_14px_40px_rgba(2,6,23,0.12)] transition-all ${accents[accent]} ${featured ? "ring-1 ring-cyan-300/30 dark:ring-cyan-300/20" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl border border-black/5 bg-white/80 p-3 shadow-sm dark:border-white/10 dark:bg-black/20">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-[color:var(--text-primary)]">{title}</div>
            <ChevronRight size={14} className="text-[color:var(--text-muted)] transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="mt-1.5 text-xs leading-5 text-[color:var(--text-secondary)]">{description}</div>
        </div>
      </div>
    </motion.button>
  );
}

export function ActionCommandPanel({
  onFindCharging,
  onEmergency,
  onRescue,
  onRunScenario,
}: Props) {
  const [showScenarios, setShowScenarios] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.42 }}
      className="panel-shell"
    >
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="kicker mb-2">Command Surface</div>
          <h3 className="section-title">Dispatch Actions</h3>
          <p className="mt-1 text-sm text-slate-400">
            Launch charging, rescue, and emergency flows without obstructing the live India network map.
          </p>
        </div>
        <div className="command-chip">
          <Zap size={14} className="text-cyan-300" />
          Main controls are now anchored below the map for a cleaner hero view.
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard
          icon={BatteryCharging}
          title="Find Nearby Energy"
          description="Locate best sellers by distance, price, and availability."
          accent="cyan"
          featured
          onClick={onFindCharging}
        />
        <ActionCard
          icon={ShieldAlert}
          title="Emergency Dispatch"
          description="Request urgent institutional power from nearby sellers."
          accent="red"
          onClick={onEmergency}
        />
        <ActionCard
          icon={TriangleAlert}
          title="Highway Rescue"
          description="Find nearby EV assistance for stranded vehicles."
          accent="amber"
          onClick={onRescue}
        />
        <motion.button
          type="button"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.985 }}
          onClick={() => setShowScenarios((value) => !value)}
          className="group w-full rounded-[24px] border border-violet-200 bg-violet-50 px-4 py-4 text-left text-violet-950 shadow-[0_14px_40px_rgba(76,29,149,0.1)] transition-all hover:border-violet-300 hover:bg-violet-100 dark:border-violet-400/18 dark:bg-violet-400/10 dark:text-violet-50 dark:hover:border-violet-300/28 dark:hover:bg-violet-400/14"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-2xl border border-black/5 bg-white/85 p-3 shadow-sm dark:border-white/10 dark:bg-black/20">
              <Play size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[color:var(--text-primary)]">Demo Scenarios</div>
                <Sparkles size={14} className="text-violet-500 dark:text-violet-200 transition-transform group-hover:rotate-6" />
              </div>
              <div className="mt-1.5 text-xs leading-5 text-[color:var(--text-secondary)]">
                Run one-click showcase flows for the live investor demo.
              </div>
            </div>
          </div>
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {showScenarios && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.24 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {scenarioOptions.map((scenario, index) => (
                <motion.button
                  key={scenario.key}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.24 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => onRunScenario(scenario.key)}
                  className="btn btn-secondary block w-full px-4 py-3 text-left text-sm"
                >
                  <div className="font-medium text-[color:var(--text-primary)]">{scenario.title}</div>
                  <div className="mt-1 text-xs leading-5 text-[color:var(--text-secondary)]">{scenario.caption}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
