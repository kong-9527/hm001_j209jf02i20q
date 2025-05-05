import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// Google login URL
export const getGoogleLoginUrl = () => {
  return `${API_URL}/auth/google`;
};

// Use popup method for Google authorization login
export const loginWithGooglePopup = () => {
  return new Promise((resolve, reject) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    
    // Open popup with popup=true parameter
    const popup = window.open(
      `${API_URL}/auth/google?popup=true`,
      'googleLogin',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    // If popup is blocked
    if (!popup || popup.closed) {
      reject(new Error('Popup was blocked by the browser, please allow popups and try again'));
      return;
    }
    
    // 设置超时检查，避免无限等待
    const authTimeout = setTimeout(() => {
      if (popup && !popup.closed) {
        popup.close();
      }
      clearInterval(checkPopup);
      reject(new Error('Authentication timeout. Please try again.'));
    }, 120000); // 2分钟超时
    
    // Poll to check if user is logged in
    // This is a fallback mechanism in case the window.postMessage doesn't work
    const checkPopup = setInterval(async () => {
      // Check if popup is closed
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        clearTimeout(authTimeout);
        
        // 强制一次延迟，确保cookie已经设置完成
        await new Promise(r => setTimeout(r, 500));
        
        // Check if user is logged in after popup is closed
        try {
          const user = await getCurrentUser();
          if (user) {
            resolve(user);
          } else {
            // 再次尝试获取用户，有时会有延迟
            setTimeout(async () => {
              const retryUser = await getCurrentUser();
              if (retryUser) {
                resolve(retryUser);
              } else {
                reject(new Error('Login failed or canceled'));
              }
            }, 1000);
          }
        } catch (err) {
          reject(err);
        }
        return;
      }
      
      // Also check current URL of the popup to see if it's redirected
      try {
        // This will throw an error if the popup is on a different origin
        // due to Same-Origin Policy
        const popupUrl = popup.location.href;
        
        // If the popup URL contains success indicator
        if (popupUrl.includes('/auth-success')) {
          clearInterval(checkPopup);
          clearTimeout(authTimeout);
          popup.close();
          
          // 强制一次延迟，确保cookie已经设置完成
          await new Promise(r => setTimeout(r, 500));
          
          // Get the current user information
          try {
            const user = await getCurrentUser();
            if (user) {
              resolve(user);
            } else {
              // 再次尝试获取用户，有时会有延迟
              setTimeout(async () => {
                const retryUser = await getCurrentUser();
                if (retryUser) {
                  resolve(retryUser);
                } else {
                  reject(new Error('Failed to get user information'));
                }
              }, 1000);
            }
          } catch (error) {
            reject(error);
          }
        }
        
        // If the popup URL contains error indicator
        if (popupUrl.includes('/auth-error')) {
          clearInterval(checkPopup);
          clearTimeout(authTimeout);
          popup.close();
          reject(new Error('Login failed'));
        }
      } catch (error) {
        // Error is expected due to cross-origin restrictions
        // Just continue polling
      }
    }, 500);
  });
};

export default {
  getCurrentUser,
  logout,
  getGoogleLoginUrl,
  loginWithGooglePopup,
}; 