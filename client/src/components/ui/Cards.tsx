import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color?: "cyan" | "blue" | "green" | "amber" | "red";
}

const colorClasses = {
  cyan: "border-cyan-500/30 text-cyan-300",
  blue: "border-blue-500/30 text-blue-300",
  green: "border-green-500/30 text-green-300",
  amber: "border-amber-500/30 text-amber-300",
  red: "border-red-500/30 text-red-300",
};

const iconBgClasses = {
  cyan: "bg-cyan-500/20",
  blue: "bg-blue-500/20",
  green: "bg-green-500/20",
  amber: "bg-amber-500/20",
  red: "bg-red-500/20",
};

export function StatCard({ label, value, icon: Icon, trend, color = "cyan" }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`stat-card border ${colorClasses[color]} hover:shadow-lg transition-all`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label">{label}</p>
          <p className="stat-value text-white">{value}</p>
          {trend && (
            <p className={`stat-change ${trend.isPositive ? "text-green-400" : "text-red-400"}`}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${iconBgClasses[color]} p-3 rounded-lg`}>
            <Icon size={24} className={colorClasses[color].split(" ")[2]} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface InfoCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  icon?: LucideIcon;
  highlighted?: boolean;
}

export function InfoCard({ title, description, children, icon: Icon, highlighted = false }: InfoCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`card ${highlighted ? "border-cyan-500/50 shadow-glow-cyan" : ""}`}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-1 p-2 bg-blue-500/20 rounded-lg">
            <Icon size={18} className="text-blue-300" />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-white">{title}</h4>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </motion.div>
  );
}
