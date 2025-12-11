import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import { initializeWebSocket, disconnectWebSocket } from './services/websocket';

function App() {
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [simulationData, setSimulationData] = useState(null);

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  const handleUploadComplete = async (uploadResponse) => {
    console.log('Upload complete, starting simulation...', uploadResponse);
    
    // Initialize WebSocket connection
    initializeWebSocket((data) => {
      setSimulationData(data);
    });

    // Auto-start simulation
    setIsSimulationActive(true);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-dark-bg to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!isSimulationActive ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <UploadSection onUploadComplete={handleUploadComplete} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <Dashboard simulationData={simulationData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
