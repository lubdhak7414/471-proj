// src/context/socket.provider.jsx
import { useState, useEffect } from 'react';
import { SocketContext } from './socket.context';
import { io } from 'socket.io-client';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });

     socketInstance.on('connect', () => {
        console.log('Socket connected');
        setSocket(socketInstance);
      });
      socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};