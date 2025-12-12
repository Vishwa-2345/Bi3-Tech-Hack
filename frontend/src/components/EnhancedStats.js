import React from 'react';
import { motion } from 'framer-motion';
import { Car, Bus, Truck, Bike, TrendingUp } from 'lucide-react';

const EnhancedStats = ({ vehicleBreakdown }) => {
  if (!vehicleBreakdown) return null;

  // Calculate totals across all directions
  const getTotals = () => {
    const totals = { Car: 0, Bus: 0, Truck: 0, Bike: 0 };
    Object.values(vehicleBreakdown).forEach(direction => {
      totals.Car += direction.Car || 0;
      totals.Bus += direction.Bus || 0;
      totals.Truck += direction.Truck || 0;
      totals.Bike += direction.Bike || 0;
    });
    return totals;
  };

  const totals = getTotals();
  const totalVehicles = Object.values(totals).reduce((sum, count) => sum + count, 0);

  const vehicleTypes = [
    { key: 'Car', label: 'Cars', icon: Car, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
    { key: 'Bus', label: 'Buses', icon: Bus, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' },
    { key: 'Truck', label: 'Trucks', icon: Truck, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
    { key: 'Bike', label: 'Bikes', icon: Bike, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-neon-blue" />
        <h2 className="text-xl font-bold text-white">Vehicle Statistics</h2>
      </div>

      {/* Total Vehicles */}
      <div className="mb-4 p-4 bg-gradient-to-r from-neon-blue/10 to-neon-green/10 border border-neon-blue/30 rounded-lg">
        <p className="text-sm text-gray-400 mb-1">Total Vehicles</p>
        <p className="text-3xl font-bold text-neon-green">{totalVehicles}</p>
      </div>

      {/* Vehicle Type Breakdown */}
      <div className="space-y-3">
        {vehicleTypes.map((type, index) => {
          const Icon = type.icon;
          const percentage = totalVehicles > 0 ? ((totals[type.key] / totalVehicles) * 100).toFixed(1) : 0;

          return (
            <motion.div
              key={type.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 ${type.bgColor} border ${type.borderColor} rounded-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${type.color}`} />
                  <span className="text-sm font-semibold text-white">{type.label}</span>
                </div>
                <span className={`text-lg font-bold ${type.color}`}>{totals[type.key]}</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-full ${type.bgColor.replace('/10', '/50')}`}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">{percentage}%</p>
            </motion.div>
          );
        })}
      </div>

      {/* Direction Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2">By Direction</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(vehicleBreakdown).map(([direction, counts]) => {
            const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
            return (
              <div key={direction} className="bg-gray-900/50 rounded-lg p-2">
                <p className="text-xs text-gray-400 capitalize">{direction}</p>
                <p className="text-lg font-bold text-white">{total}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedStats;
