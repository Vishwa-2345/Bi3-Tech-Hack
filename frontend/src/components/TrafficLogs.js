import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const TrafficLogs = () => {
    const [logs, setLogs] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const fetchSessions = useCallback(async () => {
        try {
            setError('');
            const response = await api.get('/api/logs/sessions');
            if (response.data.success) {
                setSessions(response.data.sessions);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
            setError('Failed to load sessions');
        }
    }, []);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: currentPage,
                limit: 50
            };
            if (selectedSession) params.sessionId = selectedSession;

            const response = await api.get('/api/logs', { params });
            if (response.data.success) {
                setLogs(response.data.data);
                setPagination(response.data.pagination);
                
                // Debug: Check if vehicle breakdown data is present
                if (response.data.data.length > 0) {
                    console.log('📊 Sample log data:', response.data.data[0]);
                    console.log('📊 Vehicle breakdown:', response.data.data[0]?.vehicleBreakdown);
                }
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            setError('Failed to load logs');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedSession]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Helper function to aggregate vehicle types from all directions
    const getTotalVehiclesByType = (log) => {
        const totals = { Car: 0, Bus: 0, Truck: 0, Bike: 0 };
        
        if (log.vehicleBreakdown) {
            ['north', 'south', 'east', 'west'].forEach(direction => {
                if (log.vehicleBreakdown[direction]) {
                    totals.Car += log.vehicleBreakdown[direction].Car || 0;
                    totals.Bus += log.vehicleBreakdown[direction].Bus || 0;
                    totals.Truck += log.vehicleBreakdown[direction].Truck || 0;
                    totals.Bike += log.vehicleBreakdown[direction].Bike || 0;
                }
            });
        }
        
        return totals;
    };

    // Format date for display
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="min-h-screen p-6 bg-gray-900">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-neon-green via-neon-blue to-neon-yellow bg-clip-text">
                    🚗 Vehicle Count Records
                </h1>
                <p className="mt-2 text-gray-400">Track vehicle counts by type and date</p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between px-6 py-4 mb-6 text-red-400 bg-red-500 border border-red-500 bg-opacity-10 rounded-xl backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <span className="font-medium">{error}</span>
                        </div>
                        <button
                            onClick={() => setError('')}
                            className="text-xl font-bold text-red-400 hover:text-red-300"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 mb-6 bg-gray-800 border border-gray-700 shadow-xl rounded-xl"
                >
                    <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-200">
                        🔍 Filters
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-300">
                                Session
                            </label>
                            <select
                                value={selectedSession}
                                onChange={(e) => {
                                    setSelectedSession(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2 text-gray-200 transition-all bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue"
                            >
                                <option value="">All Sessions</option>
                                {sessions.map((session) => (
                                    <option key={session.sessionId} value={session.sessionId}>
                                        {session.sessionId.substring(8, 20)}... ({session.logCount} records)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSelectedSession('');
                                    setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2 font-medium text-gray-200 transition-all transform bg-gray-700 border border-gray-600 rounded-lg shadow hover:bg-gray-600 hover:scale-105"
                            >
                                🔄 Clear Filters
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Vehicle Records Table */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="overflow-hidden bg-gray-800 border border-gray-700 shadow-xl rounded-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-neon-green to-neon-blue">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-900 uppercase">
                                            📅 Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-900 uppercase">
                                            🚗 Cars
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-900 uppercase">
                                            🚌 Buses
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-900 uppercase">
                                            🚚 Trucks
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-900 uppercase">
                                            🏍️ Bikes
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-900 uppercase">
                                            Σ Total
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold tracking-wider text-left text-gray-900 uppercase">
                                            🧭 Direction Count
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 border-4 rounded-full animate-spin border-neon-blue border-t-transparent"></div>
                                                    <p className="font-medium text-gray-400">Loading records...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="text-6xl">📭</div>
                                                    <p className="font-medium text-gray-400">No records found</p>
                                                    <p className="text-sm text-gray-500">Try adjusting your filters or run a simulation</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log, index) => {
                                            const vehicleTypes = getTotalVehiclesByType(log);
                                            const totalVehicles = vehicleTypes.Car + vehicleTypes.Bus + vehicleTypes.Truck + vehicleTypes.Bike;
                                            
                                            return (
                                                <motion.tr
                                                    key={log._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="transition-colors hover:bg-gray-700"
                                                >
                                                    <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-neon-green">
                                                                {formatDate(log.timestamp)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <span className="px-4 py-2 text-lg font-bold text-blue-300 bg-blue-900 bg-opacity-50 rounded-lg">
                                                            {vehicleTypes.Car}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <span className="px-4 py-2 text-lg font-bold text-green-300 bg-green-900 bg-opacity-50 rounded-lg">
                                                            {vehicleTypes.Bus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <span className="px-4 py-2 text-lg font-bold text-orange-300 bg-orange-900 bg-opacity-50 rounded-lg">
                                                            {vehicleTypes.Truck}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                        <span className="px-4 py-2 text-lg font-bold text-purple-300 bg-purple-900 bg-opacity-50 rounded-lg">
                                                            {vehicleTypes.Bike}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold whitespace-nowrap">
                                                        <span className="px-4 py-2 text-lg border-2 rounded-full bg-neon-blue bg-opacity-20 text-neon-blue border-neon-blue">
                                                            {totalVehicles}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                                                        <div className="grid grid-cols-2 gap-1 text-xs font-medium">
                                                            <span className="px-2 py-1 text-blue-300 bg-blue-900 rounded bg-opacity-30">N:{log.vehicleCounts?.north || 0}</span>
                                                            <span className="px-2 py-1 text-green-300 bg-green-900 rounded bg-opacity-30">S:{log.vehicleCounts?.south || 0}</span>
                                                            <span className="px-2 py-1 text-orange-300 bg-orange-900 rounded bg-opacity-30">E:{log.vehicleCounts?.east || 0}</span>
                                                            <span className="px-2 py-1 text-purple-300 bg-purple-900 rounded bg-opacity-30">W:{log.vehicleCounts?.west || 0}</span>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 border-t border-gray-700 bg-gray-750 md:flex-row">
                                <div className="text-sm font-medium text-gray-400">
                                    Page <span className="font-bold text-neon-green">{pagination.page}</span> of <span className="font-bold">{pagination.pages}</span> 
                                    <span className="ml-2">({pagination.total} total records)</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 font-semibold text-gray-900 transition-all transform rounded-lg bg-gradient-to-r from-neon-green to-neon-blue disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                                        disabled={currentPage === pagination.pages}
                                        className="px-4 py-2 font-semibold text-gray-900 transition-all transform rounded-lg bg-gradient-to-r from-neon-green to-neon-blue disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default TrafficLogs;
