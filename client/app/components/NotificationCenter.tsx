'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// 通知类型定义
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// 通知上下文
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 通知提供者组件
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      ...notification,
      duration: notification.duration || 3000,
    };
    
    setNotifications(prevNotifications => [...prevNotifications, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  useEffect(() => {
    if (notifications.length > 0) {
      const timerId = setTimeout(() => {
        removeNotification(notifications[0].id);
      }, notifications[0].duration);

      return () => clearTimeout(timerId);
    }
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// 自定义hook用于访问通知上下文
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// 通知容器组件
function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 w-80">
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onClose={() => removeNotification(notification.id)} 
        />
      ))}
    </div>
  );
}

// 单个通知项组件
function NotificationItem({ notification, onClose }: { notification: Notification, onClose: () => void }) {
  const { type, message } = notification;

  const bgColorClass = {
    success: 'bg-green-100 border-green-500',
    error: 'bg-red-100 border-red-500',
    info: 'bg-blue-100 border-blue-500',
    warning: 'bg-yellow-100 border-yellow-500',
  }[type];

  const textColorClass = {
    success: 'text-green-700',
    error: 'text-red-700',
    info: 'text-blue-700',
    warning: 'text-yellow-700',
  }[type];

  const iconPath = {
    success: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    error: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    ),
    info: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    warning: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    ),
  }[type];

  // 添加入场动画
  useEffect(() => {
    const element = document.getElementById(`notification-${notification.id}`);
    if (element) {
      element.style.opacity = '0';
      element.style.transform = 'translateX(100%)';
      
      // 触发重绘以确保初始状态被应用
      void element.offsetWidth;
      
      // 应用最终状态
      element.style.opacity = '1';
      element.style.transform = 'translateX(0)';
    }
  }, [notification.id]);

  return (
    <div 
      id={`notification-${notification.id}`}
      className={`${bgColorClass} ${textColorClass} p-4 rounded-lg shadow-md border-l-4 pr-8 relative transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            {iconPath}
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
} 