import React from 'react';
import { motion } from 'framer-motion';

const Landing = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navbar */}
      <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🚦</span>
                </div>
                <span className="text-white font-bold text-xl">ClearPath AI</span>
              </motion.div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('signin')}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('signup')}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg"
              >
                Sign Up
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Intelligent Traffic Management
            <span className="block mt-2 bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Advanced computer vision technology for real-time traffic signal optimization,
            emergency vehicle detection, and comprehensive traffic analytics.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('signup')}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-2xl"
          >
            Get Started Free
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Feature 1 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-indigo-500 transition-all">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">🚑</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Emergency Priority</h3>
            <p className="text-gray-400">
              Automatic detection and signal priority for ambulances and emergency vehicles
              using advanced computer vision.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Adaptive AI Signals</h3>
            <p className="text-gray-400">
              Dynamic traffic signal timing based on real-time vehicle density and traffic
              flow patterns.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-Time Analytics</h3>
            <p className="text-gray-400">
              Comprehensive traffic monitoring with vehicle counting, classification, and
              historical data analysis.
            </p>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
        >
          <div>
            <div className="text-4xl font-bold text-indigo-500 mb-2">99.9%</div>
            <div className="text-gray-400">Detection Accuracy</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-500 mb-2">24/7</div>
            <div className="text-gray-400">Monitoring</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-500 mb-2">Real-Time</div>
            <div className="text-gray-400">Processing</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-pink-500 mb-2">AI-Powered</div>
            <div className="text-gray-400">Intelligence</div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Videos</h3>
              <p className="text-gray-400">
                Upload traffic camera feeds from 4 directions (North, South, East, West)
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
              <p className="text-gray-400">
                YOLOv8 AI detects vehicles, counts traffic, and identifies emergencies
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Control</h3>
              <p className="text-gray-400">
                Signals adapt automatically based on traffic density and emergency priorities
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-24 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Traffic Management?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Join the future of intelligent traffic control with ClearPath AI
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('signup')}
            className="px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-xl"
          >
            Start Free Trial
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-24 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2024 ClearPath AI Signals. All rights reserved.</p>
          <p className="mt-2 text-sm">Powered by YOLOv8 & Advanced Computer Vision</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
