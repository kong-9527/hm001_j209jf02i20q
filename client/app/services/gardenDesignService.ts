import { getCurrentUser } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  third_task_id: string | null;
  third_generate_id?: number | null;
  seed?: string | null;
  ctrlnet_strength?: number | null;
  ctrlnet_start_percent?: number | null;
}

export interface ComfyStatusResponse {
  status: 'pending' | 'completed';
  message?: string;
  image_url?: string;
  garden_design?: GardenDesignImage;
  third_generate_id?: number;
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

/**
 * 更新图片的收藏状态
 */
export const updateGardenDesignLikeStatus = async (imageId: number, isLike: number): Promise<GardenDesignImage> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    console.log(`Calling API: ${API_URL}/garden-designs/${imageId}/like`);
    
    const response = await fetch(`${API_URL}/garden-designs/${imageId}/like`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_like: isLike }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to update garden design like status');
    }
    
    const data = await response.json();
    console.log('API success response for like status update:', data);
    return data;
  } catch (error) {
    console.error('Error updating garden design like status:', error);
    throw error;
  }
};

/**
 * 软删除图片
 */
export const deleteGardenDesign = async (imageId: number): Promise<GardenDesignImage> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    console.log(`Calling API: ${API_URL}/garden-designs/${imageId}/delete`);
    
    const response = await fetch(`${API_URL}/garden-designs/${imageId}/delete`, {
      method: 'PUT',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to delete garden design');
    }
    
    const data = await response.json();
    console.log('API success response for delete:', data);
    return data;
  } catch (error) {
    console.error('Error deleting garden design:', error);
    throw error;
  }
};

/**
 * 生成花园设计图
 */
export const generateGardenDesign = async (
  imageUrl: string, 
  size: string, 
  styleType: string,
  positiveWords: string,
  negativeWords: string,
  structuralSimilarity: string,
  projectId: number
): Promise<GardenDesignImage> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    console.log(`Calling API: ${API_URL}/garden-designs/generate`);
    
    const response = await fetch(`${API_URL}/garden-designs/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        size,
        styleType,
        positiveWords,
        negativeWords,
        structuralSimilarity,
        projectId
      }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.message || errorData.error || 'Failed to generate garden design');
    }
    
    const data = await response.json();
    console.log('API success response for garden design generation:', data);
    return data;
  } catch (error) {
    console.error('Error generating garden design:', error);
    throw error;
  }
};

/**
 * 检查Comfy图片生成状态
 */
export const checkComfyStatus = async (promptId: string): Promise<ComfyStatusResponse> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    console.log(`Calling API: ${API_URL}/garden-designs/check-comfy-status/${promptId}`);
    
    const response = await fetch(`${API_URL}/garden-designs/check-comfy-status/${promptId}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || 'Failed to check Comfy status');
    }
    
    const data = await response.json();
    console.log('API success response for Comfy status check:', data);
    return data;
  } catch (error) {
    console.error('Error checking Comfy status:', error);
    throw error;
  }
}; 