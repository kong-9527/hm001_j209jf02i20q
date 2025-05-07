import { getCurrentUser } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface GardenDesignImage {
  id: number;
  user_id: number | null;
  project_id: number | null;
  pic_orginial: string | null;
  pic_result: string | null;
  status: number | null;
  style_name: string | null;
  ctime: number | null;
  is_like: number | null;
}

/**
 * 获取当前用户和项目的花园设计图片
 */
export const getGardenDesignImages = async (projectId: number): Promise<GardenDesignImage[]> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    console.log(`Calling API: ${API_URL}/garden-designs?project_id=${projectId}`);
    
    const response = await fetch(`${API_URL}/garden-designs?project_id=${projectId}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch garden design images');
    }
    
    const data = await response.json();
    console.log('API success response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching garden design images:', error);
    throw error;
  }
}; 