import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Landing from './components/Landing';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import TrafficLogs from './components/TrafficLogs';
import { initializeWebSocket, disconnectWebSocket } from './services/websocket';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'signin', 'signup', 'upload', 'dashboard', or 'logs'
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setCurrentView('upload');
      } catch (error) {
        console.error('Error parsing saved user:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, []);

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    disconnectWebSocket();
    setIsSimulationActive(false);
    setSimulationData(null);
    setSessionId(null);
    setCurrentView('landing');
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleUploadComplete = async (uploadResponse) => {
    console.log('Upload complete, starting simulation...', uploadResponse);
    
    // Store session ID
    setSessionId(uploadResponse.sessionId || uploadResponse.message);
    
    // Initialize WebSocket connection
    initializeWebSocket((data) => {
      setSimulationData(data);
    });

    // Auto-start simulation
    setIsSimulationActive(true);
    setCurrentView('dashboard');
  };

  const handleStopSimulation = () => {
    console.log('Stopping simulation...');
    
    // Disconnect WebSocket
    disconnectWebSocket();
    
    // Reset state
    setIsSimulationActive(false);
    setSimulationData(null);
    setSessionId(null);
    setCurrentView('upload');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  // Show landing page without navbar
  if (currentView === 'landing' || currentView === 'signin' || currentView === 'signup') {
    return (
      <div className="min-h-screen text-white bg-dark-bg">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Landing onNavigate={handleNavigate} />
            </motion.div>
          )}
          
          {currentView === 'signin' && (
            <motion.div
              key="signin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SignIn onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
            </motion.div>
          )}
          
          {currentView === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SignUp onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden text-white bg-dark-bg">
      {/* Navigation Bar */}
      <nav className="relative z-50 bg-gray-900 border-b border-gray-800 shadow-lg">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-400">
                🚦 ClearPath AI Signals
              </h1>
              {user && (
                <span className="ml-4 text-sm text-gray-400">
                  Welcome, <span className="font-semibold text-indigo-400">{user.name}</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('upload')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                  currentView === 'upload'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                📤 Upload
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                } ${!isSimulationActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isSimulationActive}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setCurrentView('logs')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                  currentView === 'logs'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                📝 Logs
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 font-semibold text-gray-300 transition-colors rounded-lg cursor-pointer hover:bg-red-600 hover:text-white"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-dark-bg to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {currentView === 'upload' && !isSimulationActive && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <UploadSection onUploadComplete={handleUploadComplete} />
            </motion.div>
          )}
          
          {currentView === 'dashboard' && isSimulationActive && simulationData && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <Dashboard 
                sessionId={sessionId}
                simulationData={simulationData}
                onStopSimulation={handleStopSimulation}
              />
            </motion.div>
          )}
          
          {currentView === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TrafficLogs />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
            onClick={cancelLogout}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-md p-8 mx-4 bg-gray-800 border border-gray-700 shadow-2xl rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-900 rounded-full bg-opacity-30">
                  <span className="text-4xl">🚪</span>
                </div>
                <h3 className="mb-3 text-2xl font-bold text-white">
                  Confirm Logout
                </h3>
                <p className="mb-8 text-gray-400">
                  Are you sure you want to logout? Any active simulation will be stopped.
                </p>
                <div className="flex justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelLogout}
                    className="px-6 py-3 font-semibold text-white transition-colors bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600"
                  >
                    ✕ Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={confirmLogout}
                    className="px-6 py-3 font-semibold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  >
                    ✓ Logout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
