import { motion } from "framer-motion";
import { Link, ChevronRight } from "lucide-react";
import { Badge } from "./ui/Badge";

type Tx = {
  _id: string;
  buyer: string;
  seller: string;
  kwh: number;
  price: number;
  txHash: string;
  timestamp: string;
};

const INR = "\u20B9";

export function BlockchainExplorer({ txs }: { txs: Tx[] }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Link size={18} className="text-yellow-400" />
        <h3 className="section-title">Blockchain Explorer</h3>
        <Badge label="Mock" variant="info" size="sm" />
      </div>
      <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
        {txs.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            No transactions yet. Start trading to see blockchain activity!
          </div>
        ) : (
          txs.map((tx, idx) => (
            <motion.div
              key={tx._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.1)" }}
              className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-lg p-3 transition-all group cursor-pointer"
            >
              {/* Transaction Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <Badge label="TX" variant="primary" size="sm" />
                  <span className="text-xs font-mono text-gray-400 truncate">
                    {tx.txHash.substring(0, 12)}...
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 rounded p-2">
                  <p className="text-gray-400 mb-0.5">From</p>
                  <p className="font-mono text-cyan-300 truncate">{tx.buyer}</p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-gray-400 mb-0.5">To</p>
                  <p className="font-mono text-green-300 truncate">{tx.seller}</p>
                </div>
              </div>

              {/* Transaction Amount */}
              <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs text-gray-400">
                  {tx.kwh} <span className="font-semibold text-white">kWh</span>
                </span>
                <span className="text-sm font-bold text-green-400">
                  {INR}{tx.price.toFixed(2)}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
