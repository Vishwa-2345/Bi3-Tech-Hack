const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Simulation = require('../models/Simulation');

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});

// Upload videos endpoint
router.post('/upload-videos', upload.fields([
  { name: 'north', maxCount: 1 },
  { name: 'south', maxCount: 1 },
  { name: 'east', maxCount: 1 },
  { name: 'west', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📹 Received video upload request');

    // Validate all files are present
    const directions = ['north', 'south', 'east', 'west'];
    const missingDirections = directions.filter(dir => !req.files[dir]);

    if (missingDirections.length > 0) {
      return res.status(400).json({
        error: `Missing videos for directions: ${missingDirections.join(', ')}`
      });
    }

    // Create session ID
    const sessionId = `session-${Date.now()}`;

    // Store video paths
    const videoPaths = {
      north: req.files.north[0].path,
      south: req.files.south[0].path,
      east: req.files.east[0].path,
      west: req.files.west[0].path,
    };

    // Create simulation record
    const simulation = new Simulation({
      sessionId,
      videos: videoPaths,
      status: 'processing',
    });
    await simulation.save();

    console.log('✅ Videos saved, session:', sessionId);

    // Send videos to CV service
    const cvServiceUrl = process.env.CV_SERVICE_URL || 'http://localhost:8000';
    
    try {
      const formData = new FormData();
      
      for (const direction of directions) {
        const filePath = videoPaths[direction];
        formData.append(direction, fs.createReadStream(filePath), {
          filename: path.basename(filePath),
          contentType: 'video/mp4',
        });
      }
      
      formData.append('session_id', sessionId);

      console.log('🔄 Sending videos to CV service...');

      // Send to CV service (non-blocking)
      axios.post(`${cvServiceUrl}/api/process-videos`, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }).then(response => {
        console.log('✅ CV service started processing');
      }).catch(error => {
        console.error('❌ CV service error:', error.message);
        simulation.status = 'failed';
        simulation.save();
      });

    } catch (error) {
      console.error('❌ Error sending to CV service:', error.message);
    }

    // Return success immediately
    res.json({
      success: true,
      message: 'Videos uploaded successfully. Simulation starting...',
      sessionId,
      videoPaths,
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Handle multer errors
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field. Please use "intersection" as the field name.',
        details: error.message,
      });
    }
    
    res.status(500).json({
      error: 'Failed to upload video',
      details: error.message,
    });
  }
});

module.exports = router;
