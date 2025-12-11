import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Siren, Users, AlertTriangle, Info } from 'lucide-react';

const AlertsPanel = ({ alerts }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'ambulance':
        return <Siren className="w-5 h-5" />;
      case 'pedestrian':
        return <Users className="w-5 h-5" />;
      case 'heavy_traffic':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'ambulance':
        return 'border-red-500/50 bg-red-500/10 text-red-400';
      case 'pedestrian':
        return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
      case 'heavy_traffic':
        return 'border-orange-500/50 bg-orange-500/10 text-orange-400';
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
      default:
        return 'border-gray-500/50 bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h2 className="text-xl font-bold mb-6 text-white">System Alerts</h2>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No alerts at the moment</p>
              <p className="text-sm mt-1">System is monitoring traffic</p>
            </motion.div>
          ) : (
            alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 20,
                  delay: index * 0.05 
                }}
                className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight">
                      {alert.message}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTime(alert.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return date.toLocaleTimeString();
};

export default AlertsPanel;
