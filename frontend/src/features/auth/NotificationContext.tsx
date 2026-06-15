import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '../../components/Toast';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { showToast } = useToast();
  const { user } = useAuth();

  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/notifications/';
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.message) {
        const newNotification: Notification = {
          id: Math.random().toString(36).substring(7),
          message: data.message,
          timestamp: new Date(),
        };
        setNotifications(prev => [newNotification, ...prev]);
        showToast('info', data.message);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected.');
    };

    return () => {
      socket.close();
    };
  }, [showToast, user]);

  return (
    <NotificationContext.Provider value={{ notifications, clearNotifications }}>
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
