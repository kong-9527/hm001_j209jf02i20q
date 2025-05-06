import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/UserContext';
import { refreshSession } from '../services/authService';

interface IdleTimerProps {
  timeout: number; // 超时时间（毫秒）
  refreshInterval?: number; // 刷新会话的间隔时间（毫秒）
}

export default function IdleTimer({ 
  timeout = 30 * 60 * 1000, // 默认30分钟无操作自动登出
  refreshInterval = 10 * 60 * 1000 // 默认10分钟刷新一次会话
}: IdleTimerProps) {
  const { logout } = useUser();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 重置超时计时器
  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      console.log('用户无操作超时，自动登出');
      // 执行登出操作
      const success = await logout();
      if (success) {
        // 重定向到登录页面
        router.push('/signin?reason=inactivity');
      }
    }, timeout);
  };

  // 记录用户活动
  const recordActivity = () => {
    lastActivityRef.current = Date.now();
    resetTimer();
  };

  // 启动会话刷新计时器
  const startRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    refreshTimerRef.current = setInterval(async () => {
      // 如果最近有用户活动，则刷新会话
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // 如果用户在过去30秒内有活动，刷新会话
      if (timeSinceLastActivity < 30 * 1000) {
        console.log('用户活跃中，刷新会话');
        await refreshSession();
      }
    }, refreshInterval);
  };

  useEffect(() => {
    // 监听用户活动事件
    const events = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click', 'keydown'
    ];

    // 初始化计时器
    resetTimer();
    
    // 启动会话刷新计时器
    startRefreshTimer();

    // 添加所有事件监听器
    events.forEach(event => {
      window.addEventListener(event, recordActivity);
    });

    // 清理函数
    return () => {
      // 移除所有事件监听器
      events.forEach(event => {
        window.removeEventListener(event, recordActivity);
      });
      
      // 清除计时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // 清除刷新计时器
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [timeout, refreshInterval, logout, router]);

  return null; // 这个组件不需要渲染任何内容
} 