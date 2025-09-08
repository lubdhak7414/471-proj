// src/hooks/useSocket.js
import { useContext } from 'react';
import { SocketContext } from '../Context/socket.context';

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (socket === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
};