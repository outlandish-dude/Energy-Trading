import { motion } from "framer-motion";

export function VoltShareLogo({
  size = "md",
  animated = true,
}: {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}) {
  const sizeMap = {
    sm: { container: "h-9 w-9", inner: "h-6 w-6", dot: "h-1.5 w-1.5" },
    md: { container: "h-11 w-11", inner: "h-7 w-7", dot: "h-2 w-2" },
    lg: { container: "h-14 w-14", inner: "h-9 w-9", dot: "h-2.5 w-2.5" },
  };

  const shell = (
    <div
      className={`relative flex items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-400/25 via-sky-500/20 to-emerald-400/20 shadow-[0_0_30px_rgba(34,211,238,0.18)] ${sizeMap[size].container}`}
    >
      <div
        className={`relative rounded-xl border border-white/20 bg-slate-950/70 ${sizeMap[size].inner}`}
      >
        <div className="absolute inset-x-1.5 top-1.5 h-1 rounded-full bg-gradient-to-r from-cyan-300 to-sky-500" />
        <div className={`absolute bottom-1.5 left-1.5 rounded-full bg-emerald-400 ${sizeMap[size].dot}`} />
        <div className={`absolute bottom-1.5 right-1.5 rounded-full bg-cyan-300 ${sizeMap[size].dot}`} />
      </div>
    </div>
  );

  if (!animated) return shell;

  return (
    <motion.div
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {shell}
    </motion.div>
  );
}

export function BrandName() {
  return (
    <div className="flex items-center gap-3">
      <VoltShareLogo size="md" />
      <div>
        <div className="bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300 bg-clip-text text-xl font-semibold text-transparent">
          VoltShare
        </div>
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
          Live Energy Exchange
        </div>
      </div>
    </div>
  );
}

export function StatusBar() {
  const statuses = [
    { label: "Network", value: "Stable", tone: "bg-emerald-400" },
    { label: "Simulation", value: "Live", tone: "bg-cyan-400" },
    { label: "Wallet", value: "Virtual", tone: "bg-amber-400" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {statuses.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300"
        >
          <span className={`h-2 w-2 rounded-full ${item.tone}`} />
          <span className="text-slate-500">{item.label}</span>
          <span className="font-medium text-slate-100">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
