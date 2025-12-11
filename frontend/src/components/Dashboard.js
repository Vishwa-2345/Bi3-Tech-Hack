import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoGrid from './VideoGrid';
import TrafficSignalPanel from './TrafficSignalPanel';
import VehicleCountPanel from './VehicleCountPanel';
import AlertsPanel from './AlertsPanel';

const Dashboard = ({ simulationData }) => {
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
    }
  }, [simulationData]);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-green via-neon-blue to-neon-yellow bg-clip-text text-transparent">
          ClearPath AI Signals Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Real-time adaptive traffic signal simulation</p>
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

          {/* Alerts Panel */}
          <AlertsPanel alerts={alerts} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
