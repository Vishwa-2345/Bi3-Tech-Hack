const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  alertType: {
    type: String,
    enum: ['ambulance', 'pedestrian', 'heavy_traffic', 'warning', 'info'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  direction: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Alert', AlertSchema);
