import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';

interface NotificationContextType {
  lastNotification: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/notifications/';
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        setLastNotification(data.message);
        showToast(data.message, 'info');
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected. Attempting to reconnect...');
      // Simplistic reconnect logic could go here
    };

    return () => {
      socket.close();
    };
  }, [showToast]);

  return (
    <NotificationContext.Provider value={{ lastNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
