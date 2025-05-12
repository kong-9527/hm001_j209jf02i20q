import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

// Garden Advisor创建数据类型
export interface CreateGardenAdvisorData {
  projectId: number;
  gardenLocation?: string;
  hardinessZone?: string;
  experienceId?: number | null;
  budgetId?: number | null;
  timeId?: number | null;
  maintenanceId?: number | null;
  goals?: string[];
  plantTypes?: string[];
  fertilizerId?: number | null;
  allergies?: string[];
  gardenSpaces: Array<{
    id: number;
    inOut: string;
    type: string;
    length: string;
    width: string;
    height: string;
    diameter: string;
    sunlight: string;
    soil: string;
    waterAccess: string;
    measurement: string;
  }>;
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

// 创建Garden Advisor
export const createGardenAdvisor = async (data: CreateGardenAdvisorData): Promise<any> => {
  try {
    console.log('请求数据:', JSON.stringify(data, null, 2));
    
    const response = await axios.post(`${API_URL}/garden-advisors/create`, data, {
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error('创建Garden Advisor失败:', error);
    
    // 详细输出错误信息
    if (axios.isAxiosError(error) && error.response) {
      console.error('服务器响应状态:', error.response.status);
      console.error('服务器响应数据:', error.response.data);
    }
    
    throw error;
  }
}; 