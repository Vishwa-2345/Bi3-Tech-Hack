const express = require('express');
const router = express.Router();
const Simulation = require('../models/Simulation');
const Alert = require('../models/Alert');
const TrafficLog = require('../models/TrafficLog');
const { verifyToken } = require('../middleware/auth');

// Track last log time per session to throttle log saves
const lastLogTime = new Map();
const LOG_INTERVAL = 3000; // Save logs every 3 seconds

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
    const { session_id, counts, signal_state, frames, vehicle_breakdown } = req.body;

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

    // Store this update as a TrafficLog entry (throttled to avoid DB overload)
    const now = Date.now();
    const lastLog = lastLogTime.get(session_id) || 0;
    
    if (now - lastLog >= LOG_INTERVAL && simulation.userId) {
      try {
        // Prepare vehicle breakdown data
        const vehicleBreakdownData = {};
        if (vehicle_breakdown) {
          ['north', 'south', 'east', 'west'].forEach(direction => {
            if (vehicle_breakdown[direction]) {
              vehicleBreakdownData[direction] = {
                Car: vehicle_breakdown[direction].Car || 0,
                Bus: vehicle_breakdown[direction].Bus || 0,
                Truck: vehicle_breakdown[direction].Truck || 0,
                Bike: vehicle_breakdown[direction].Bike || 0,
              };
            }
          });
        }

        const trafficLog = new TrafficLog({
          userId: simulation.userId,
          sessionId: session_id,
          vehicleCounts: {
            north: counts?.north || 0,
            south: counts?.south || 0,
            east: counts?.east || 0,
            west: counts?.west || 0,
          },
          vehicleBreakdown: vehicleBreakdownData,
          signalState: {
            north: signal_state?.north || 'red',
            south: signal_state?.south || 'red',
            east: signal_state?.east || 'red',
            west: signal_state?.west || 'red',
            activeDirection: signal_state?.activeDirection,
          },
          mode: signal_state?.mode || 'normal',
          events: [],
        });

        await trafficLog.save();
        lastLogTime.set(session_id, now);
        console.log(`📝 Traffic log saved for session ${session_id} with vehicle breakdown:`, vehicleBreakdownData);
      } catch (logError) {
        console.error('Failed to save traffic log:', logError);
        // Don't fail the update if logging fails
      }
    }

    // Broadcast update to all connected clients via WebSocket
    if (global.io) {
      global.io.emit('simulation_update', {
        counts: simulation.currentState.counts,
        signalState: simulation.currentState.signalState,
        frames: frames || {},
        vehicle_breakdown: vehicle_breakdown || null,
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

// Complete simulation (called when simulation ends)
router.post('/complete', async (req, res) => {
  try {
    const { session_id } = req.body;

    const simulation = await Simulation.findOne({ sessionId: session_id });

    if (!simulation) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    simulation.status = 'completed';
    simulation.completedAt = new Date();
    await simulation.save();

    // Clean up throttle map
    lastLogTime.delete(session_id);

    res.json({ success: true, message: 'Simulation completed' });
  } catch (error) {
    console.error('Complete error:', error);
    res.status(500).json({ error: 'Failed to complete simulation' });
  }
});

module.exports = router;
