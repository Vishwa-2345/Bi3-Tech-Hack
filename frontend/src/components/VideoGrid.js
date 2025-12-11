import React from 'react';
import { motion } from 'framer-motion';

const VideoGrid = ({ frames, signalState }) => {
  const directions = ['north', 'south', 'east', 'west'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h2 className="text-2xl font-bold mb-6 text-white">Live Traffic Feed</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {directions.map((direction, index) => (
          <VideoCard
            key={direction}
            direction={direction}
            frame={frames[direction]}
            signal={signalState[direction]}
            isActive={signalState.activeDirection === direction}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
};

const VideoCard = ({ direction, frame, signal, isActive, index }) => {
  const borderColor = signal === 'green' ? 'border-neon-green shadow-neon-green' : 'border-gray-700';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-xl overflow-hidden border-2 ${borderColor} transition-all duration-300`}
    >
      {/* Direction Label */}
      <div className="absolute top-3 left-3 z-10">
        <motion.div
          className={`px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-md ${
            signal === 'green' 
              ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' 
              : 'bg-gray-900/80 text-gray-400 border border-gray-700'
          }`}
          animate={isActive ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {direction.toUpperCase()}
        </motion.div>
      </div>

      {/* Signal Indicator */}
      <div className="absolute top-3 right-3 z-10">
        <motion.div
          className={`w-4 h-4 rounded-full ${
            signal === 'green' ? 'bg-neon-green' : 'bg-neon-red'
          }`}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>

      {/* Video Frame */}
      <div className="aspect-video bg-gray-900 flex items-center justify-center">
        {frame ? (
          <img
            src={`data:image/jpeg;base64,${frame}`}
            alt={`${direction} traffic`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-600 text-center">
            <div className="w-16 h-16 border-4 border-gray-700 border-t-neon-blue rounded-full animate-spin mx-auto mb-3"></div>
            <p>Processing {direction} video...</p>
          </div>
        )}
      </div>

      {/* ROI Overlay Indicator */}
      <div className="absolute bottom-3 left-3 z-10">
        <div className="px-2 py-1 bg-purple-500/20 backdrop-blur-md border border-purple-500/50 rounded text-xs text-purple-300">
          ROI Active
        </div>
      </div>
    </motion.div>
  );
};

export default VideoGrid;
