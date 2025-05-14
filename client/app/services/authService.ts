import axios from 'axios';

// 根据环境确定 API_URL
// 如果在浏览器中，就尝试从 window.location 获取基础URL
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return '';
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || `${getBaseUrl()}/api`;

// 输出当前使用的 API URL 以便调试
console.log('Using API URL:', API_URL);

// Configure axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Allow cross-origin requests with credentials (Cookies)
});

// Get current user information
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Failed to get user information:', error);
    return null;
  }
};

// User logout
export const logout = async () => {
  try {
    await api.get('/auth/logout');
    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
};

// Refresh user session
export const refreshSession = async () => {
  try {
    await api.post('/auth/refresh-session');
    return true;
  } catch (error) {
    console.error('Session refresh failed:', error);
    return false;
  }
};

// Google login URL
export const getGoogleLoginUrl = () => {
  return `${API_URL}/auth/google`;
};

// Use popup method for Google authorization login
export const loginWithGooglePopup = () => {
  return new Promise((resolve, reject) => {
    console.log('Starting Google login popup flow');
    
    // 清理可能存在的残留状态
    if (window.googleLoginPopup && !window.googleLoginPopup.closed) {
      try {
        window.googleLoginPopup.close();
      } catch (e) {
        console.error('Failed to close existing popup:', e);
      }
    }
    
    // 清理相关的全局定时器
    if (window.googleLoginInterval) {
      clearInterval(window.googleLoginInterval);
      window.googleLoginInterval = undefined;
    }
    if (window.googleLoginTimeout) {
      clearTimeout(window.googleLoginTimeout);
      window.googleLoginTimeout = undefined;
    }
    
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    
    // 定义登录状态变量
    let isAuthenticating = true;
    let userCancelled = false;
    
    // Open popup with popup=true parameter
    const popup = window.open(
      `${API_URL}/auth/google?popup=true`,
      'googleLogin',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    // 存储弹窗引用以便后续清理
    window.googleLoginPopup = popup;
    
    // If popup is blocked
    if (!popup || popup.closed) {
      isAuthenticating = false;
      window.googleLoginInProgress = false;
      reject(new Error('Popup was blocked by the browser, please allow popups and try again'));
      return;
    }
    
    console.log('Google login popup opened successfully');
    
    // 设置消息监听器，用于接收授权弹窗的消息
    const messageHandler = async (event: MessageEvent) => {
      // 确保消息来源是安全的
      if (event.origin !== new URL(API_URL as string).origin) {
        return;
      }
      
      console.log('Received message from auth popup:', event.data);
      
      if (event.data === 'AUTH_SUCCESS') {
        // 用户已确认授权且成功
        isAuthenticating = false;
        window.removeEventListener('message', messageHandler);
        clearInterval(checkPopup);
        clearTimeout(authTimeout);
        if (popup && !popup.closed) {
          popup.close();
        }
        
        // 清理弹窗引用
        window.googleLoginPopup = null;
        
        console.log('Authentication successful, getting user data');
        
        // 强制一次延迟，确保cookie已经设置完成
        await new Promise(r => setTimeout(r, 800));
        
        try {
          const user = await getCurrentUser();
          if (user) {
            console.log('Successfully retrieved user data');
            resolve(user);
          } else {
            // 再次尝试获取用户
            console.log('First attempt to get user data failed, retrying...');
            setTimeout(async () => {
              const retryUser = await getCurrentUser();
              if (retryUser) {
                console.log('Successfully retrieved user data on retry');
                resolve(retryUser);
              } else {
                console.error('Failed to get user information after successful authorization');
                reject(new Error('Failed to get user information after successful authorization'));
              }
            }, 1500);
          }
        } catch (err) {
          console.error('Error while getting user data:', err);
          reject(err);
        }
      } else if (event.data === 'AUTH_CANCELLED') {
        // 用户取消了授权
        isAuthenticating = false;
        userCancelled = true;
        window.removeEventListener('message', messageHandler);
        clearInterval(checkPopup);
        clearTimeout(authTimeout);
        if (popup && !popup.closed) {
          popup.close();
        }
        
        // 清理弹窗引用
        window.googleLoginPopup = null;
        window.googleLoginInProgress = false;
        
        console.log('Authentication was cancelled by the user');
        reject(new Error('Authentication was cancelled by the user'));
      } else if (event.data === 'AUTH_ERROR') {
        // 授权过程中出现错误
        isAuthenticating = false;
        window.removeEventListener('message', messageHandler);
        clearInterval(checkPopup);
        clearTimeout(authTimeout);
        if (popup && !popup.closed) {
          popup.close();
        }
        
        // 清理弹窗引用
        window.googleLoginPopup = null;
        window.googleLoginInProgress = false;
        
        console.log('Authentication error occurred');
        reject(new Error('Authentication error occurred'));
      }
    };
    
    // 添加消息监听器
    window.addEventListener('message', messageHandler);
    
    // 设置超时检查，避免无限等待
    const authTimeout = setTimeout(() => {
      if (isAuthenticating) {
        isAuthenticating = false;
        window.removeEventListener('message', messageHandler);
        if (popup && !popup.closed) {
          popup.close();
        }
        clearInterval(checkPopup);
        
        // 清理弹窗引用
        window.googleLoginPopup = null;
        window.googleLoginInProgress = false;
        
        console.log('Authentication timeout after 2 minutes');
        reject(new Error('Authentication timeout. Please try again.'));
      }
    }, 120000); // 2分钟超时
    
    // 存储超时定时器的引用
    window.googleLoginTimeout = authTimeout;
    
    // Poll to check if popup is closed prematurely (fallback)
    const checkPopup = setInterval(() => {
      // 如果弹窗被关闭，但是还没有收到任何消息
      if ((!popup || popup.closed) && isAuthenticating) {
        console.log('Popup closed without authentication completion');
        isAuthenticating = false;
        window.removeEventListener('message', messageHandler);
        clearInterval(checkPopup);
        clearTimeout(authTimeout);
        
        // 清理弹窗引用
        window.googleLoginPopup = null;
        
        // 如果用户已经取消授权，则不需要再次报错
        if (!userCancelled) {
          // 强制一次延迟，确保cookie可能已经设置完成 
          setTimeout(async () => {
            // 检查用户是否已成功登录（弹窗关闭但可能已登录成功）
            try {
              const user = await getCurrentUser();
              if (user) {
                console.log('User authenticated successfully despite popup closing prematurely');
                window.googleLoginInProgress = false;
                resolve(user);
                return;
              }
            } catch (err) {
              console.error('Error checking user after popup closed:', err);
            }
            
            // 如果仍在授权中但没有获取到用户信息，报错
            if (isAuthenticating) {
              console.log('Login window was closed before authorization completed');
              window.googleLoginInProgress = false;
              reject(new Error('Login window was closed before authorization completed'));
            }
          }, 1000);
        }
      }
    }, 500); // 每0.5秒检查一次弹窗状态
    
    // 存储轮询定时器的引用
    window.googleLoginInterval = checkPopup;
  });
};

export default {
  getCurrentUser,
  logout,
  getGoogleLoginUrl,
  loginWithGooglePopup,
}; 