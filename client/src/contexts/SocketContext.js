import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import config from '../config/config';

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
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user.id) {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Only create new socket if we don't have one or if user changed
    if (!socket || socket.disconnected) {
      const newSocket = io(config.SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        newSocket.emit('user_connected', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);
    } else {
      // If socket exists, just update the user connection
      socket.emit('user_connected', user.id);
    }

    return () => {
      // Only close socket when component unmounts or user changes
      if (socket) {
        socket.close();
      }
    };
  }, [user?.id]); // Only depend on user.id

  const sendMessage = (recipientId, content, messageType = 'text') => {
    if (socket && connected) {
      socket.emit('send_message', {
        recipientId,
        content,
        messageType
      });
    }
  };

  const sendGroupMessage = (groupId, content, messageType = 'text', groupMembers) => {
    if (socket && connected) {
      socket.emit('send_group_message', {
        groupId,
        content,
        messageType,
        groupMembers
      });
    }
  };

  const value = {
    socket,
    connected,
    sendMessage,
    sendGroupMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 