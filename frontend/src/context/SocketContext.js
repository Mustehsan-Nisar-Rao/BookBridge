import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    let newSocket;

    if (isAuthenticated) {
      // Connect to socket server
      const socketUrl = process.env.NODE_ENV === 'production' 
        ? '/' 
        : 'http://localhost:5000';

      newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        // Join user-specific room
        newSocket.emit('join', user.userId);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  const value = {
    socket,
    emit: (event, data) => socket?.emit(event, data),
    on: (event, callback) => {
      socket?.on(event, callback);
      return () => socket?.off(event, callback);
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
