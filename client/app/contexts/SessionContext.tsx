'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';

// 设置会话活动检查间隔（每分钟检查一次）
const ACTIVITY_CHECK_INTERVAL = 60 * 1000;
// 设置会话刷新间隔（每10分钟刷新一次，确保30分钟内不会过期）
const SESSION_REFRESH_INTERVAL = 10 * 60 * 1000;
// 设置自动登出时间（30分钟无活动）
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
// 设置警告提示时间（25分钟无活动时显示警告）
const WARNING_TIMEOUT = 25 * 60 * 1000;

// 上下文接口
interface SessionContextType {
  // 记录用户最后活动时间
  recordActivity: () => void;
  // 会话即将过期警告
  showSessionWarning: boolean;
  // 倒计时（秒）
  expiryCountdown: number;
}

// 创建上下文
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// 提供者组件Props
interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { user, refreshSession, logout } = useUser();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false);
  const [expiryCountdown, setExpiryCountdown] = useState<number>(0);

  // 记录用户活动
  const recordActivity = () => {
    setLastActivity(Date.now());
    // 如果警告正在显示，重置警告
    if (showSessionWarning) {
      setShowSessionWarning(false);
    }
  };

  // 当用户有交互时记录活动
  useEffect(() => {
    // 用户操作事件监听器
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown',
      'scroll', 'touchstart', 'click', 'focus'
    ];

    // 事件处理函数
    const handleUserActivity = () => {
      recordActivity();
    };

    // 添加事件监听器
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // 清理函数
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [showSessionWarning]);

  // 定期检查用户活动并适时刷新会话
  useEffect(() => {
    if (!user) return; // 未登录时不执行

    let activityCheckTimer: NodeJS.Timeout | null = null;
    let sessionRefreshTimer: NodeJS.Timeout | null = null;
    let countdownTimer: NodeJS.Timeout | null = null;

    // 活动检查 - 检查用户是否长时间无活动
    activityCheckTimer = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      // 如果无活动时间超过30分钟，自动登出
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        console.log('用户30分钟无活动，自动登出');
        logout();
        setShowSessionWarning(false);
      }
      // 如果无活动时间超过25分钟但小于30分钟，显示警告
      else if (timeSinceLastActivity >= WARNING_TIMEOUT && !showSessionWarning) {
        console.log('会话即将过期，显示警告');
        setShowSessionWarning(true);
        // 计算剩余时间（秒）
        const remainingTime = Math.floor((INACTIVITY_TIMEOUT - timeSinceLastActivity) / 1000);
        setExpiryCountdown(remainingTime);
      }
    }, ACTIVITY_CHECK_INTERVAL);

    // 会话刷新 - 定期刷新会话以防过期
    sessionRefreshTimer = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      // 只有在用户最近有活动时才刷新会话（过去20分钟内有活动）
      if (timeSinceLastActivity < SESSION_REFRESH_INTERVAL * 2) {
        console.log('定期刷新会话以保持登录状态');
        refreshSession();
      }
    }, SESSION_REFRESH_INTERVAL);

    // 当警告显示时，更新倒计时
    if (showSessionWarning) {
      countdownTimer = setInterval(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivity;
        const remainingTime = Math.max(0, Math.floor((INACTIVITY_TIMEOUT - timeSinceLastActivity) / 1000));
        
        setExpiryCountdown(remainingTime);
        
        // 如果时间到，登出
        if (remainingTime <= 0) {
          logout();
          setShowSessionWarning(false);
          if (countdownTimer) clearInterval(countdownTimer);
        }
      }, 1000); // 每秒更新一次
    }

    // 清理函数
    return () => {
      if (activityCheckTimer) clearInterval(activityCheckTimer);
      if (sessionRefreshTimer) clearInterval(sessionRefreshTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [user, lastActivity, refreshSession, logout, showSessionWarning]);

  return (
    <SessionContext.Provider value={{ recordActivity, showSessionWarning, expiryCountdown }}>
      {children}
      {showSessionWarning && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-md rounded-md max-w-md z-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                您的会话即将过期，由于长时间未活动。
                <br />
                <span className="font-medium">
                  {Math.floor(expiryCountdown / 60)}分{expiryCountdown % 60}秒
                </span>
                后系统将自动退出登录。
              </p>
              <div className="mt-3">
                <button
                  onClick={recordActivity}
                  className="text-sm font-medium text-yellow-700 hover:text-yellow-600 focus:outline-none"
                >
                  点击此处继续保持登录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SessionContext.Provider>
  );
}

// 自定义钩子，用于访问会话上下文
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 