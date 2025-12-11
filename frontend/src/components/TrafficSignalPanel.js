import React from 'react';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

const TrafficSignalPanel = ({ signalState }) => {
  const directions = ['north', 'south', 'east', 'west'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h2 className="text-xl font-bold mb-6 text-white">Traffic Signals</h2>

      <div className="space-y-4">
        {directions.map((direction, index) => {
          const isGreen = signalState[direction] === 'green';
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
                  : 'bg-gray-900/50 border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Traffic Light */}
                  <div className="flex flex-col gap-1">
                    <motion.div
                      className={`w-3 h-3 rounded-full ${
                        !isGreen ? 'bg-neon-red shadow-neon-red' : 'bg-gray-700'
                      }`}
                      animate={!isGreen ? { opacity: [1, 0.5, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
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
                    isGreen ? 'text-neon-green' : 'text-gray-400'
                  }`}>
                    {direction}
                  </span>
                </div>

                {/* Timer */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 text-neon-green"
                  >
                    <Timer className="w-4 h-4" />
                    <span className="font-bold text-lg">{signalState.timer}s</span>
                  </motion.div>
                )}

                {/* Status */}
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isGreen 
                      ? 'bg-neon-green/20 text-neon-green' 
                      : 'bg-neon-red/20 text-neon-red'
                  }`}>
                    {isGreen ? 'GREEN' : 'RED'}
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
          className="mt-4 p-3 bg-neon-green/10 border border-neon-green/30 rounded-lg"
        >
          <p className="text-sm text-center text-neon-green font-semibold">
            {signalState.activeDirection.toUpperCase()} traffic is moving
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TrafficSignalPanel;
