import { io } from 'socket.io-client';

// Prefer configured socket URL; fall back to current origin so deployed frontend connects to same host
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window?.location?.origin || '';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const connectSocket = () => {
  const socketInstance = getSocket();
  if (!socketInstance.connected) {
    socketInstance.connect();
  }
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const joinProject = (projectId) => {
  if (socket && socket.connected) {
    socket.emit('join-project', projectId);
  }
};

export const leaveProject = (projectId) => {
  if (socket && socket.connected) {
    socket.emit('leave-project', projectId);
  }
};

export const onTaskUpdate = (callback) => {
  if (socket) {
    socket.on('task-updated', callback);
  }
};

export const onProjectUpdate = (callback) => {
  if (socket) {
    socket.on('project-updated', callback);
  }
};

export const offTaskUpdate = () => {
  if (socket) {
    socket.off('task-updated');
  }
};

export const offProjectUpdate = () => {
  if (socket) {
    socket.off('project-updated');
  }
};

export default {
  initSocket,
  getSocket,
  connectSocket,
  disconnectSocket,
  joinProject,
  leaveProject,
  onTaskUpdate,
  onProjectUpdate,
  offTaskUpdate,
  offProjectUpdate
};
