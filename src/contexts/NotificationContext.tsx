"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // milliseconds, 0 means no auto-dismiss
  persistent?: boolean; // if true, won't auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  // Convenience methods for different types
  showSuccess: (title: string, message: string, options?: Partial<Notification>) => string;
  showError: (title: string, message: string, options?: Partial<Notification>) => string;
  showWarning: (title: string, message: string, options?: Partial<Notification>) => string;
  showInfo: (title: string, message: string, options?: Partial<Notification>) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 5,
  defaultDuration = 5000, // 5 seconds
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    notificationData: Omit<Notification, 'id' | 'createdAt'>
  ): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      ...notificationData,
      id,
      createdAt: new Date(),
      duration: notificationData.duration ?? defaultDuration,
    };

    setNotifications(prev => {
      // Add new notification at the beginning
      let updatedNotifications = [notification, ...prev];
      
      // Limit the number of notifications
      if (updatedNotifications.length > maxNotifications) {
        updatedNotifications = updatedNotifications.slice(0, maxNotifications);
      }
      
      return updatedNotifications;
    });

    // Auto-remove notification after duration (if not persistent and duration > 0)
    if (!notification.persistent && notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  }, [defaultDuration, maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((
    title: string, 
    message: string, 
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      title,
      message,
      type: 'success',
      ...options,
    });
  }, [addNotification]);

  const showError = useCallback((
    title: string, 
    message: string, 
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      title,
      message,
      type: 'error',
      persistent: true, // Errors should be persistent by default
      duration: 0,
      ...options,
    });
  }, [addNotification]);

  const showWarning = useCallback((
    title: string, 
    message: string, 
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      title,
      message,
      type: 'warning',
      duration: 7000, // Warnings last longer
      ...options,
    });
  }, [addNotification]);

  const showInfo = useCallback((
    title: string, 
    message: string, 
    options?: Partial<Notification>
  ): string => {
    return addNotification({
      title,
      message,
      type: 'info',
      ...options,
    });
  }, [addNotification]);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Export the context for advanced use cases
export { NotificationContext };
