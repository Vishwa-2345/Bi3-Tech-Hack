const mongoose = require('mongoose');

const trafficLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    // Vehicle counts per direction
    vehicleCounts: {
        north: { type: Number, default: 0 },
        south: { type: Number, default: 0 },
        east: { type: Number, default: 0 },
        west: { type: Number, default: 0 }
    },
    
    // Total vehicles
    totalVehicles: {
        type: Number,
        default: 0
    },
    
    // Vehicle breakdown by type
    vehicleBreakdown: {
        north: {
            Car: { type: Number, default: 0 },
            Bus: { type: Number, default: 0 },
            Truck: { type: Number, default: 0 },
            Bike: { type: Number, default: 0 }
        },
        south: {
            Car: { type: Number, default: 0 },
            Bus: { type: Number, default: 0 },
            Truck: { type: Number, default: 0 },
            Bike: { type: Number, default: 0 }
        },
        east: {
            Car: { type: Number, default: 0 },
            Bus: { type: Number, default: 0 },
            Truck: { type: Number, default: 0 },
            Bike: { type: Number, default: 0 }
        },
        west: {
            Car: { type: Number, default: 0 },
            Bus: { type: Number, default: 0 },
            Truck: { type: Number, default: 0 },
            Bike: { type: Number, default: 0 }
        }
    },
    
    // Signal state
    signalState: {
        activeDirection: { type: String },
        mode: { type: String }, // normal, ambulance, pedestrian, heavy_traffic
        timer: { type: Number },
        yellowPhase: { type: Boolean },
        north: { type: String }, // red, yellow, green
        south: { type: String },
        east: { type: String },
        west: { type: String }
    },
    
    // Events
    events: [{
        type: { type: String }, // signal_change, ambulance_detected, mode_change
        direction: { type: String },
        message: { type: String },
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Create indexes for efficient querying
trafficLogSchema.index({ sessionId: 1, timestamp: -1 });
trafficLogSchema.index({ 'signalState.mode': 1 });
trafficLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('TrafficLog', trafficLogSchema);
