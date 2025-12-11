import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Video, AlertCircle, PlayCircle } from 'lucide-react';
import { uploadVideos } from '../services/api';

const UploadSection = ({ onUploadComplete }) => {
  const [files, setFiles] = useState({
    north: null,
    south: null,
    east: null,
    west: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(null);

  const directions = [
    { key: 'north', label: 'North', icon: '⬆️', color: 'from-blue-500 to-cyan-500' },
    { key: 'south', label: 'South', icon: '⬇️', color: 'from-green-500 to-emerald-500' },
    { key: 'east', label: 'East', icon: '➡️', color: 'from-purple-500 to-pink-500' },
    { key: 'west', label: 'West', icon: '⬅️', color: 'from-orange-500 to-red-500' },
  ];

  const handleFileChange = (direction, selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFiles(prev => ({ ...prev, [direction]: selectedFile }));
      setError(null);
    } else {
      setError('Invalid file type. Please upload a video file.');
    }
  };

  const handleDrag = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(direction);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  };

  const handleDrop = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(direction, e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    const allFilesPresent = Object.values(files).every(file => file !== null);
    
    if (!allFilesPresent) {
      setError('Please upload videos for all 4 directions (North, South, East, West)');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await uploadVideos(files);
      console.log('Upload successful:', response);
      
      // Auto-start simulation after upload
      setTimeout(() => {
        onUploadComplete(response);
      }, 500);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || 'Failed to upload videos. Please try again.');
      setUploading(false);
    }
  };

  const allFilesUploaded = Object.values(files).every(file => file !== null);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center shadow-neon-green">
              <Video className="w-10 h-10 text-dark-bg" />
            </div>
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-neon-green via-neon-blue to-neon-yellow bg-clip-text text-transparent">
            ClearPath AI Signals
          </h1>
          <p className="text-gray-400 text-lg">
            Upload videos from all 4 directions to begin AI traffic analysis
          </p>
        </div>

        {/* Upload Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {directions.map((dir, index) => (
            <motion.div
              key={dir.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                onDragEnter={(e) => handleDrag(e, dir.key)}
                onDragLeave={(e) => handleDrag(e, dir.key)}
                onDragOver={(e) => handleDrag(e, dir.key)}
                onDrop={(e) => handleDrop(e, dir.key)}
                className={`relative backdrop-blur-xl bg-glass border-2 rounded-2xl p-6 transition-all ${
                  dragActive === dir.key
                    ? 'border-neon-green shadow-neon-green'
                    : files[dir.key]
                    ? 'border-neon-blue shadow-neon-blue'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(dir.key, e.target.files[0])}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id={`video-upload-${dir.key}`}
                />
                
                <div className="text-center">
                  {/* Direction Icon */}
                  <div className={`text-4xl mb-3 bg-gradient-to-r ${dir.color} bg-clip-text text-transparent`}>
                    {dir.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {dir.label}
                  </h3>
                  
                  {files[dir.key] ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-12 h-12 bg-neon-green/20 rounded-full mb-3"
                      >
                        <PlayCircle className="w-6 h-6 text-neon-green" />
                      </motion.div>
                      <p className="text-sm text-gray-300 mb-1 truncate">
                        {files[dir.key].name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(files[dir.key].size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setFiles(prev => ({ ...prev, [dir.key]: null }));
                        }}
                        className="text-neon-red hover:text-red-400 transition-colors text-sm mt-2"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="inline-flex items-center justify-center w-12 h-12 bg-gray-700/50 rounded-full mb-3"
                      >
                        <Upload className="w-6 h-6 text-gray-400" />
                      </motion.div>
                      <p className="text-sm text-gray-400 mb-1">
                        Drop video here
                      </p>
                      <p className="text-xs text-gray-500">
                        or click to browse
                      </p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-400">{error}</span>
          </motion.div>
        )}

        {/* Upload Button */}
        <motion.button
          onClick={handleUpload}
          disabled={!allFilesUploaded || uploading}
          whileHover={allFilesUploaded && !uploading ? { scale: 1.02 } : {}}
          whileTap={allFilesUploaded && !uploading ? { scale: 0.98 } : {}}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            allFilesUploaded && !uploading
              ? 'bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg shadow-neon-green cursor-pointer'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-dark-bg border-t-transparent rounded-full"
              />
              Processing Videos...
            </span>
          ) : (
            'Start AI Traffic Analysis'
          )}
        </motion.button>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: '🚗', label: 'Vehicle Detection', desc: 'YOLOv8 AI' },
            { icon: '🚦', label: 'Smart Signals', desc: '4-Priority Logic' },
            { icon: '⚡', label: 'Real-time', desc: 'Live Analysis' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="backdrop-blur-xl bg-glass border border-gray-700 rounded-xl p-4 text-center"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold text-white">{item.label}</div>
              <div className="text-xs text-gray-400">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default UploadSection;
