const express = require('express');
const router = express.Router();
const Simulation = require('../models/Simulation');
const Alert = require('../models/Alert');

// Get simulation status
router.get('/status', async (req, res) => {
  try {
    const latestSimulation = await Simulation.findOne()
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latestSimulation) {
      return res.json({
        status: 'idle',
        message: 'No active simulation',
      });
    }

    res.json({
      status: latestSimulation.status,
      sessionId: latestSimulation.sessionId,
      currentState: latestSimulation.currentState,
      startedAt: latestSimulation.startedAt,
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Get simulation by session ID
router.get('/:sessionId', async (req, res) => {
  try {
    const simulation = await Simulation.findOne({ sessionId: req.params.sessionId });

    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    res.json(simulation);
  } catch (error) {
    console.error('Get simulation error:', error);
    res.status(500).json({ error: 'Failed to get simulation' });
  }
});

// Get alerts for a session
router.get('/:sessionId/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find({ sessionId: req.params.sessionId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

// Update simulation state (called by CV service)
router.post('/update', async (req, res) => {
  try {
    const { session_id, counts, signal_state, frames } = req.body;

    const simulation = await Simulation.findOne({ sessionId: session_id });

    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    // Update simulation state
    if (counts) {
      simulation.currentState.counts = counts;
    }

    if (signal_state) {
      simulation.currentState.signalState = signal_state;
    }

    await simulation.save();

    // Broadcast update to all connected clients via WebSocket
    if (global.io) {
      global.io.emit('simulation_update', {
        counts: simulation.currentState.counts,
        signalState: simulation.currentState.signalState,
        frames: frames || {},
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update simulation' });
  }
});

// Create alert (called by CV service)
router.post('/alert', async (req, res) => {
  try {
    const { session_id, alert_type, message, direction, metadata } = req.body;

    const alert = new Alert({
      sessionId: session_id,
      alertType: alert_type,
      message,
      direction,
      metadata,
    });

    await alert.save();

    // Broadcast alert to all connected clients
    if (global.io) {
      global.io.emit('alert', {
        alertType: alert_type,
        message,
        direction,
        timestamp: alert.timestamp,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

module.exports = router;
