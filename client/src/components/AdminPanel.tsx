import { motion } from "framer-motion";
import { Users, Truck, AlertCircle, BarChart3 } from "lucide-react";
import { StatCard } from "./ui/Cards";

type Props = {
  state: { users: number; vehicles: number; activeTrades: number; totalTrades: number } | null;
  onSpawnUsers: () => void;
  onSpawnVehicles: () => void;
  onTriggerEmergency: () => void;
};

export function AdminPanel({ state, onSpawnUsers, onSpawnVehicles, onTriggerEmergency }: Props) {
  return (
    <div className="card">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-purple-400" />
        <h3 className="section-title">Admin Dashboard</h3>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard label="Active Users" value={state?.users ?? "0"} color="blue" />
        <StatCard label="Vehicles" value={state?.vehicles ?? "0"} color="green" />
        <StatCard label="Active Trades" value={state?.activeTrades ?? "0"} color="cyan" />
        <StatCard label="Total Trades" value={state?.totalTrades ?? "0"} color="amber" />
      </div>

      <div className="grid gap-2">
        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSpawnUsers}
          className="btn btn-primary"
        >
          <Users size={16} />
          <span className="flex-1 text-left">Spawn 50 Demo Users</span>
          <span>{"->"}</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSpawnVehicles}
          className="btn btn-success"
        >
          <Truck size={16} />
          <span className="flex-1 text-left">Spawn Vehicles Across India</span>
          <span>{"->"}</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onTriggerEmergency}
          className="btn btn-danger"
        >
          <AlertCircle size={16} />
          <span className="flex-1 text-left">Trigger Emergency Event</span>
          <span>{"->"}</span>
        </motion.button>
      </div>
    </div>
  );
}
