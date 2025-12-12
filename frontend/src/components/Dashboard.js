import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren } from 'lucide-react';
import VideoGrid from './VideoGrid';
import TrafficSignalPanel from './TrafficSignalPanel';
import VehicleCountPanel from './VehicleCountPanel';
import AlertsPanel from './AlertsPanel';
import EnhancedStats from './EnhancedStats';

const Dashboard = ({ simulationData, onStopSimulation }) => {
  const [counts, setCounts] = useState({
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  });
  const [signalState, setSignalState] = useState({
    north: 'red',
    south: 'red',
    east: 'red',
    west: 'red',
    activeDirection: null,
    timer: 0,
  });
  const [alerts, setAlerts] = useState([]);
  const [videoFrames, setVideoFrames] = useState({
    north: null,
    south: null,
    east: null,
    west: null,
  });
  const [vehicleBreakdown, setVehicleBreakdown] = useState(null);
  const [ambulanceAlert, setAmbulanceAlert] = useState(null);

  useEffect(() => {
    if (!simulationData) return;

    if (simulationData.type === 'alert') {
      // Add alert
      const newAlert = {
        id: Date.now(),
        message: simulationData.message,
        type: simulationData.alertType || 'info',
        timestamp: new Date(),
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      
      // If ambulance alert, show prominent warning
      if (simulationData.alertType === 'ambulance') {
        setAmbulanceAlert(simulationData);
        // Auto-clear after 15 seconds
        setTimeout(() => setAmbulanceAlert(null), 15000);
      }
    } else {
      // Update counts
      if (simulationData.counts) {
        setCounts(simulationData.counts);
      }

      // Update signal state
      if (simulationData.signalState) {
        setSignalState(simulationData.signalState);
      }

      // Update video frames
      if (simulationData.frames) {
        setVideoFrames(simulationData.frames);
      }
      
      // Update vehicle breakdown
      if (simulationData.vehicle_breakdown) {
        setVehicleBreakdown(simulationData.vehicle_breakdown);
      }
    }
  }, [simulationData]);

  return (
    <div className="min-h-screen p-6">
      {/* Ambulance Emergency Banner */}
      <AnimatePresence>
        {ambulanceAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="bg-red-600 border-4 border-red-400 rounded-xl p-4 shadow-2xl"
            >
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Siren className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white uppercase tracking-wider">
                    🚨 AMBULANCE DETECTED! 🚨
                  </p>
                  <p className="text-sm text-red-100 mt-1">
                    {ambulanceAlert.message}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, -15, 15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Siren className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-green via-neon-blue to-neon-yellow bg-clip-text text-transparent">
              ClearPath AI Signals Dashboard
            </h1>
            <p className="text-gray-400 mt-2">Real-time adaptive traffic signal simulation</p>
          </div>
          {onStopSimulation && (
            <button
              onClick={onStopSimulation}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">⏹</span>
              Stop Simulation
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Video Grid - 8 columns */}
        <div className="col-span-12 xl:col-span-8">
          <VideoGrid frames={videoFrames} signalState={signalState} />
        </div>

        {/* Right Panel - 4 columns */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Traffic Signal Panel */}
          <TrafficSignalPanel signalState={signalState} />

          {/* Vehicle Count Panel */}
          <VehicleCountPanel counts={counts} />
          
          {/* Enhanced Statistics */}
          {vehicleBreakdown && <EnhancedStats vehicleBreakdown={vehicleBreakdown} />}

          {/* Alerts Panel */}
          <AlertsPanel alerts={alerts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
