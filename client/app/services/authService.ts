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
    
    // Poll to check if user is logged in
    // This is a fallback mechanism in case the window.postMessage doesn't work
    const checkPopup = setInterval(async () => {
      // Check if popup is closed
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        // Check if user is logged in after popup is closed
        getCurrentUser()
          .then(user => {
            if (user) {
              resolve(user);
            } else {
              reject(new Error('Login failed or canceled'));
            }
          })
          .catch(err => reject(err));
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
          popup.close();
          
          // Get the current user information
          const user = await getCurrentUser();
          if (user) {
            resolve(user);
          } else {
            reject(new Error('Failed to get user information'));
          }
        }
        
        // If the popup URL contains error indicator
        if (popupUrl.includes('/auth-error')) {
          clearInterval(checkPopup);
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