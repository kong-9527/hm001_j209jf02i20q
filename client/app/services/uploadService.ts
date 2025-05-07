import { getCurrentUser } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * 上传图片到服务器
 * @param file 要上传的图片文件
 * @returns 上传成功后的图片URL
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        // 不需要显式添加 Authorization 头，因为 cookie 会自动发送
      },
      body: formData,
      credentials: 'include', // 包含 cookie
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}; 