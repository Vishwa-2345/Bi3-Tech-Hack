import React from 'react';
import { motion } from 'framer-motion';
import { Car, Bike, Bus, Truck, Users } from 'lucide-react';

const VehicleCountPanel = ({ counts }) => {
  const directions = ['north', 'south', 'east', 'west'];
  
  // Calculate total
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  // Find direction with max traffic
  const maxDirection = directions.reduce((max, dir) => 
    counts[dir] > counts[max] ? dir : max, 'north'
  );

  // Find direction with min traffic
  const minDirection = directions.reduce((min, dir) => 
    counts[dir] < counts[min] ? dir : min, 'north'
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h2 className="text-xl font-bold mb-6 text-white">Vehicle Count</h2>

      {/* Total Count */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-purple-300" />
            </div>
            <span className="text-gray-400">Total Vehicles</span>
          </div>
          <span className="text-3xl font-bold text-purple-300">{total}</span>
        </div>
      </div>

      {/* Direction Counts */}
      <div className="space-y-3">
        {directions.map((direction, index) => {
          const count = counts[direction] || 0;
          const isMax = direction === maxDirection && count > 0;
          const isMin = direction === minDirection && count < counts[maxDirection];

          return (
            <motion.div
              key={direction}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border ${
                isMax 
                  ? 'bg-red-500/10 border-red-500/50' 
                  : isMin 
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-gray-900/50 border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold capitalize ${
                  isMax ? 'text-red-400' : isMin ? 'text-green-400' : 'text-gray-300'
                }`}>
                  {direction}
                </span>
                <span className={`text-xl font-bold ${
                  isMax ? 'text-red-400' : isMin ? 'text-green-400' : 'text-white'
                }`}>
                  {count}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((count / 50) * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    isMax 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                      : isMin 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                />
              </div>

              {/* Label */}
              {isMax && (
                <div className="mt-2 text-xs text-red-400 font-semibold">
                  ⚠️ Highest Traffic
                </div>
              )}
              {isMin && count < counts[maxDirection] && (
                <div className="mt-2 text-xs text-green-400 font-semibold">
                  ✓ Lowest Traffic
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Heavy Traffic Warning */}
      {total > 80 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-orange-500/10 border border-orange-500/50 rounded-lg"
        >
          <p className="text-sm text-center text-orange-400 font-semibold">
            ⚠️ Heavy Traffic Detected
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VehicleCountPanel;
