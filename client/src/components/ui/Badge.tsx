import { LucideIcon } from "lucide-react";

interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  icon?: LucideIcon;
  size?: "sm" | "md";
}

const variantClasses = {
  primary: "badge-primary",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
};

export function Badge({ label, variant = "primary", icon: Icon, size = "md" }: BadgeProps) {
  return (
    <span className={`badge ${variantClasses[variant]} ${size === "sm" ? "text-10px px-2 py-0.5" : ""}`}>
      {Icon && <Icon size={12} />}
      {label}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: "cyan" | "blue" | "green" | "amber" | "red";
  animated?: boolean;
}

const colorGradients = {
  cyan: "from-cyan-500 to-blue-500",
  blue: "from-blue-500 to-purple-500",
  green: "from-green-500 to-emerald-500",
  amber: "from-amber-500 to-orange-500",
  red: "from-red-500 to-pink-500",
};

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  color = "cyan",
  animated = true 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-medium text-[color:var(--text-secondary)]">{label}</span>
          <span className="text-xs font-bold text-[color:var(--text-primary)]">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="progress-bar overflow-hidden">
        <div
          className={`progress-fill bg-gradient-to-r ${colorGradients[color]} ${
            animated ? "animate-pulse-soft" : ""
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface StatusIndicatorProps {
  status: "active" | "inactive" | "warning" | "error" | "success";
  label?: string;
}

const statusColors = {
  active: "bg-green-500/80 shadow-lg shadow-green-500/50",
  inactive: "bg-gray-500/50",
  warning: "bg-amber-500/80 shadow-lg shadow-amber-500/50",
  error: "bg-red-500/80 shadow-lg shadow-red-500/50",
  success: "bg-emerald-500/80 shadow-lg shadow-emerald-500/50",
};

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status]} animate-pulse-soft`} />
      {label && <span className="text-xs text-[color:var(--text-secondary)]">{label}</span>}
    </div>
  );
}
