import { getCurrentUser } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
      body: formData,
      credentials: 'include', // 包含 cookie
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to upload image';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // 无法解析JSON，使用默认错误消息
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data.url; // Cloudinary返回的URL
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}; 