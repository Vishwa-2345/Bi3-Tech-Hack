const express = require('express');
const router = express.Router();
const TrafficLog = require('../models/TrafficLog');
const { verifyToken } = require('../middleware/auth');

// Get all logs with filters (protected)
router.get('/', verifyToken, async (req, res) => {
    try {
        const { 
            sessionId, 
            mode, 
            startDate, 
            endDate, 
            limit = 100,
            page = 1 
        } = req.query;
        
        // Build query - filter by userId
        const query = { userId: req.user._id };
        
        if (sessionId) {
            query.sessionId = sessionId;
        }
        
        if (mode) {
            query['signalState.mode'] = mode;
        }
        
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get logs
        const logs = await TrafficLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        
        // Get total count
        const total = await TrafficLog.countDocuments(query);
        
        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get log statistics (protected)
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const { sessionId, startDate, endDate } = req.query;
        
        // Build match query - filter by userId
        const matchQuery = { userId: req.user._id };
        
        if (sessionId) {
            matchQuery.sessionId = sessionId;
        }
        
        if (startDate || endDate) {
            matchQuery.timestamp = {};
            if (startDate) {
                matchQuery.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                matchQuery.timestamp.$lte = new Date(endDate);
            }
        }
        
        // Aggregate statistics
        const stats = await TrafficLog.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalLogs: { $sum: 1 },
                    avgVehiclesNorth: { $avg: '$vehicleCounts.north' },
                    avgVehiclesSouth: { $avg: '$vehicleCounts.south' },
                    avgVehiclesEast: { $avg: '$vehicleCounts.east' },
                    avgVehiclesWest: { $avg: '$vehicleCounts.west' },
                    maxVehicles: { $max: '$totalVehicles' },
                    minVehicles: { $min: '$totalVehicles' },
                    avgTotalVehicles: { $avg: '$totalVehicles' }
                }
            }
        ]);
        
        // Count by mode
        const modeStats = await TrafficLog.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$signalState.mode',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Count events
        const eventStats = await TrafficLog.aggregate([
            { $match: matchQuery },
            { $unwind: '$events' },
            {
                $group: {
                    _id: '$events.type',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        res.json({
            success: true,
            stats: stats[0] || {},
            modeDistribution: modeStats,
            eventDistribution: eventStats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get unique sessions (protected)
router.get('/sessions', verifyToken, async (req, res) => {
    try {
        const sessions = await TrafficLog.distinct('sessionId', { userId: req.user._id });
        
        // Get session details
        const sessionDetails = await Promise.all(
            sessions.map(async (sessionId) => {
                const firstLog = await TrafficLog.findOne({ sessionId, userId: req.user._id })
                    .sort({ timestamp: 1 });
                const lastLog = await TrafficLog.findOne({ sessionId, userId: req.user._id })
                    .sort({ timestamp: -1 });
                const logCount = await TrafficLog.countDocuments({ sessionId, userId: req.user._id });
                
                return {
                    sessionId,
                    startTime: firstLog?.timestamp,
                    endTime: lastLog?.timestamp,
                    logCount
                };
            })
        );
        
        res.json({
            success: true,
            sessions: sessionDetails.sort((a, b) => 
                new Date(b.startTime) - new Date(a.startTime)
            )
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Delete logs older than specified days (protected)
router.delete('/cleanup', verifyToken, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        
        const result = await TrafficLog.deleteMany({
            userId: req.user._id,
            timestamp: { $lt: cutoffDate }
        });
        
        res.json({
            success: true,
            deletedCount: result.deletedCount,
            message: `Deleted logs older than ${days} days`
        });
    } catch (error) {
        console.error('Error cleaning up logs:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
