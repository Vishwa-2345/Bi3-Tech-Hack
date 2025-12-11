import { io } from 'socket.io-client';

let socket = null;

export const initializeWebSocket = (onDataReceived) => {
  const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

  socket = io(WS_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
  });

  socket.on('connect', () => {
    console.log('WebSocket connected:', socket.id);
  });

  socket.on('simulation_update', (data) => {
    console.log('Received simulation update:', data);
    onDataReceived(data);
  });

  socket.on('alert', (alertData) => {
    console.log('Alert received:', alertData);
    onDataReceived({ type: 'alert', ...alertData });
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
