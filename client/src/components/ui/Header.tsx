import { motion } from "framer-motion";
import { Zap, TrendingUp, Users, Wifi } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showStats?: boolean;
  stats?: { label: string; value: string | number }[];
}

export function Header({ 
  title = "VoltShare",
  subtitle = "EV Energy Trading Platform",
  showStats = true,
  stats
}: HeaderProps) {
  const defaultStats = stats || [
    { label: "Network Status", value: "Live" },
    { label: "Active Nodes", value: "24/7" },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div className="glass rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg"
              >
                <Zap size={24} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-sm text-gray-400">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* Right Section - Stats */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
              {defaultStats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center"
                >
                  <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-sm font-bold text-cyan-300 flex items-center justify-center gap-1">
                    {idx === 0 && <Wifi size={14} />}
                    {idx === 1 && <TrendingUp size={14} />}
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Demo Notice */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-amber-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Demo simulation. No real energy or payments involved.
          </p>
        </div>
      </div>
    </motion.header>
  );
}
