"use client";

import React, { useEffect, useState } from 'react';
import { useNotification, Notification } from '../contexts/NotificationContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  Clock
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-gray-600 flex-shrink-0" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "border-l-4 shadow-lg backdrop-blur-sm";
    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-50/95 border-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50/95 border-red-500 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-amber-50/95 border-amber-500 text-amber-800`;
      case 'info':
        return `${baseStyles} bg-blue-50/95 border-blue-500 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50/95 border-gray-500 text-gray-800`;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`
        ${getStyles()}
        rounded-lg p-4 mb-3 max-w-sm w-full
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-1 truncate">
              {notification.title}
            </h4>
            <p className="text-xs leading-relaxed break-words">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs opacity-60">
                <Clock className="w-3 h-3" />
                <span>{formatTime(notification.createdAt)}</span>
              </div>
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="text-xs font-medium hover:underline focus:outline-none focus:underline"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white/50 rounded"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="flex flex-col items-end pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
