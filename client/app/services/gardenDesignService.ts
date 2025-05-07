import { getCurrentUser } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface GardenDesignImage {
  id: number;
  user_id: number | null;
  project_id: number | null;
  pic_orginial: string | null;
  pic_result: string | null;
  status: number | null;
  style_id: number | null;
  style_name: string | null;
  ctime: number | null;
  is_like: number | null;
  is_del: number | null;
}

/**
 * 获取当前用户和项目的花园设计图片 - 用于Recent Images显示
 */
export const getGardenDesignImages = async (projectId: number): Promise<GardenDesignImage[]> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    console.log(`Calling API: ${API_URL}/garden-designs?project_id=${projectId}&is_del=0`);
    
    const response = await fetch(`${API_URL}/garden-designs?project_id=${projectId}&is_del=0`, {
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

/**
 * 获取当前用户和项目的花园设计图片 - 用于图片列表显示（未删除的图片）
 */
export const getGardenDesignList = async (projectId: number): Promise<GardenDesignImage[]> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    console.log(`Calling API: ${API_URL}/garden-designs?project_id=${projectId}&is_del=0`);
    
    const response = await fetch(`${API_URL}/garden-designs?project_id=${projectId}&is_del=0`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch garden design images');
    }
    
    const data = await response.json();
    console.log('API success response for image list:', data);
    return data;
  } catch (error) {
    console.error('Error fetching garden design list:', error);
    throw error;
  }
};

/**
 * 获取当前用户和项目的已收藏花园设计图片 - 用于收藏图片列表显示
 */
export const getLikedGardenDesigns = async (projectId: number): Promise<GardenDesignImage[]> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    console.log(`Calling API: ${API_URL}/garden-designs?project_id=${projectId}&is_del=0&is_like=1`);
    
    const response = await fetch(`${API_URL}/garden-designs?project_id=${projectId}&is_del=0&is_like=1`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch liked garden design images');
    }
    
    const data = await response.json();
    console.log('API success response for liked image list:', data);
    return data;
  } catch (error) {
    console.error('Error fetching liked garden design list:', error);
    throw error;
  }
};

/**
 * 获取当前用户和项目的已删除花园设计图片 - 用于已删除图片列表显示
 */
export const getDeletedGardenDesigns = async (projectId: number): Promise<GardenDesignImage[]> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    console.log(`Calling API: ${API_URL}/garden-designs?project_id=${projectId}&is_del=1`);
    
    const response = await fetch(`${API_URL}/garden-designs?project_id=${projectId}&is_del=1`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch deleted garden design images');
    }
    
    const data = await response.json();
    console.log('API success response for deleted image list:', data);
    return data;
  } catch (error) {
    console.error('Error fetching deleted garden design list:', error);
    throw error;
  }
}; 