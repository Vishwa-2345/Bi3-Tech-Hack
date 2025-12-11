const mongoose = require('mongoose');

const SimulationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  videos: {
    north: { type: String, required: true },
    south: { type: String, required: true },
    east: { type: String, required: true },
    west: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  currentState: {
    counts: {
      north: { type: Number, default: 0 },
      south: { type: Number, default: 0 },
      east: { type: Number, default: 0 },
      west: { type: Number, default: 0 },
    },
    signalState: {
      north: { type: String, default: 'red' },
      south: { type: String, default: 'red' },
      east: { type: String, default: 'red' },
      west: { type: String, default: 'red' },
      activeDirection: String,
      timer: { type: Number, default: 0 },
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Simulation', SimulationSchema);
