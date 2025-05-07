'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// 定义事件类型
export type EventType = 'projects_updated' | 'project_selected';

// 事件监听器类型
type EventListener = (data?: any) => void;

// 事件总线接口
interface EventBusContextType {
  emit: (eventType: EventType, data?: any) => void;
  on: (eventType: EventType, listener: EventListener) => () => void;
}

// 创建Context
const EventBusContext = createContext<EventBusContextType | undefined>(undefined);

// 事件总线Provider
export function EventBusProvider({ children }: { children: ReactNode }) {
  // 事件监听器Map
  const [listeners, setListeners] = useState<Map<EventType, Set<EventListener>>>(new Map());

  // 发布事件
  const emit = useCallback((eventType: EventType, data?: any) => {
    const eventListeners = listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }, [listeners]);

  // 订阅事件
  const on = useCallback((eventType: EventType, listener: EventListener) => {
    setListeners(prevListeners => {
      const newListeners = new Map(prevListeners);
      if (!newListeners.has(eventType)) {
        newListeners.set(eventType, new Set());
      }
      newListeners.get(eventType)!.add(listener);
      return newListeners;
    });

    // 返回取消订阅的函数
    return () => {
      setListeners(prevListeners => {
        const newListeners = new Map(prevListeners);
        const eventListeners = newListeners.get(eventType);
        if (eventListeners) {
          eventListeners.delete(listener);
          if (eventListeners.size === 0) {
            newListeners.delete(eventType);
          }
        }
        return newListeners;
      });
    };
  }, []);

  return (
    <EventBusContext.Provider value={{ emit, on }}>
      {children}
    </EventBusContext.Provider>
  );
}

// 自定义Hook用于访问事件总线
export function useEventBus() {
  const context = useContext(EventBusContext);
  if (!context) {
    throw new Error('useEventBus must be used within an EventBusProvider');
  }
  return context;
} 