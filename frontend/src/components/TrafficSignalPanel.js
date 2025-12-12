import React from 'react';
import { motion } from 'framer-motion';
import { Timer, AlertTriangle, Users, TrendingUp, Zap } from 'lucide-react';

const TrafficSignalPanel = ({ signalState }) => {
  const directions = ['north', 'south', 'east', 'west'];
  
  const getModeInfo = (mode) => {
    switch(mode) {
      case 'ambulance':
        return { icon: AlertTriangle, label: 'AMBULANCE PRIORITY', color: 'neon-red', bgColor: 'bg-red-500/20' };
      case 'pedestrian':
        return { icon: Users, label: 'PEDESTRIAN CROSSING', color: 'neon-yellow', bgColor: 'bg-yellow-500/20' };
      case 'heavy_traffic':
        return { icon: TrendingUp, label: 'HEAVY TRAFFIC MODE', color: 'neon-orange', bgColor: 'bg-orange-500/20' };
      default:
        return { icon: Zap, label: 'NORMAL MODE', color: 'neon-green', bgColor: 'bg-green-500/20' };
    }
  };
  
  const modeInfo = getModeInfo(signalState?.mode);
  const ModeIcon = modeInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 glass-effect rounded-2xl"
    >
      <h2 className="mb-4 text-xl font-bold text-white">Traffic Signals</h2>
      
      {/* Mode Indicator */}
      {signalState?.mode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 ${modeInfo.bgColor} border border-${modeInfo.color}/30 rounded-lg`}
        >
          <div className="flex items-center justify-center gap-2">
            <ModeIcon className={`w-4 h-4 text-${modeInfo.color}`} />
            <p className={`text-sm font-bold text-${modeInfo.color}`}>
              {modeInfo.label}
            </p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {directions.map((direction, index) => {
          const signalColor = signalState[direction] || 'red';
          const isGreen = signalColor === 'green';
          const isYellow = signalColor === 'yellow';
          const isRed = signalColor === 'red';
          const isActive = signalState.activeDirection === direction;

          return (
            <motion.div
              key={direction}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                isGreen 
                  ? 'bg-neon-green/10 border-neon-green/50' 
                  : isYellow
                  ? 'bg-yellow-500/10 border-yellow-500/50'
                  : 'bg-gray-900/50 border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Traffic Light */}
                  <div className="flex flex-col gap-1">
                    <motion.div
                      className={`w-3 h-3 rounded-full ${
                        isRed ? 'bg-neon-red shadow-neon-red' : 'bg-gray-700'
                      }`}
                      animate={isRed ? { opacity: [1, 0.5, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.div
                      className={`w-3 h-3 rounded-full ${
                        isYellow ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-gray-700'
                      }`}
                      animate={isYellow ? { opacity: [1, 0.5, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                    <motion.div
                      className={`w-3 h-3 rounded-full ${
                        isGreen ? 'bg-neon-green shadow-neon-green' : 'bg-gray-700'
                      }`}
                      animate={isGreen ? { opacity: [1, 0.5, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>

                  {/* Direction */}
                  <span className={`font-bold capitalize ${
                    isGreen ? 'text-neon-green' : isYellow ? 'text-yellow-500' : 'text-gray-400'
                  }`}>
                    {direction}
                  </span>
                </div>

                {/* Timer - Hidden during ambulance mode */}
                

                {/* Status */}
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isGreen 
                      ? 'bg-neon-green/20 text-neon-green' 
                      : isYellow
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-neon-red/20 text-neon-red'
                  }`}>
                    {isGreen ? 'GREEN' : isYellow ? 'YELLOW' : 'RED'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Active Direction Info */}
      {signalState.activeDirection && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 mt-4 border rounded-lg bg-neon-green/10 border-neon-green/30"
        >
          <p className="text-sm font-semibold text-center text-neon-green">
            {signalState.activeDirection.toUpperCase()} traffic is moving
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TrafficSignalPanel;
