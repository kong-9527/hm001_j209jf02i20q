import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Garden Advisor类型定义
export interface GardenAdvisor {
  id: number;
  user_id: number;
  project_id: number;
  plan_name: string;
  location: string;
  hardiness_zone: string;
  experience: number;
  fertilizer: number;
  status: string;
  ctime: number; // unix timestamp
}

// 获取Garden Advisor列表
export const getGardenAdvisorList = async (projectId: number): Promise<GardenAdvisor[]> => {
  try {
    // 发起请求获取garden-advisor列表
    const response = await axios.get(`${API_URL}/garden-advisors/list`, {
      params: { project_id: projectId },
      withCredentials: true
    });
    
    // 返回数据
    return response.data;
  } catch (error) {
    console.error('获取Garden Advisor列表失败:', error);
    throw error;
  }
}; 