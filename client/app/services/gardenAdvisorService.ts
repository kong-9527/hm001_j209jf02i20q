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
  status: number; // 修改为数字类型：0=生成中，1=已完成，2=失败
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

// Garden Advisor详情类型定义
export interface Plant {
  name: string;
}

export interface Space {
  id: number;
  in_out: string;
  cultivation: string;
  dimensions: string;
  sunlight: string;
  soil: string;
  water_access: string;
  plants: Plant[];
}

export interface GardenPlan {
  id: string | number;
  name: string;
  location: string;
  experience: string;
  budget: string;
  time: string;
  maintenance: string;
  fertilizer: string;
  goals: string;
  plantTypes: string;
  spaces: number;
  allergies: string;
  createdAt: string;
}

export interface GardenAdvisorDetail {
  gardenPlan: GardenPlan;
  spaces: Space[];
}

// 帮助函数：将经验级别转换为文本
const formatExperience = (experience: number | null): string => {
  switch (experience) {
    case 1: return 'Novice';
    case 2: return 'Proficient';
    case 3: return 'Expert';
    default: return 'Not specified';
  }
};

// 帮助函数：将预算级别转换为文本
const formatBudget = (budget: number | null): string => {
  switch (budget) {
    case 1: return 'Low';
    case 2: return 'Medium';
    case 3: return 'High';
    default: return 'Not specified';
  }
};

// 帮助函数：将时间级别转换为文本
const formatTime = (time: number | null): string => {
  switch (time) {
    case 1: return 'Low';
    case 2: return 'Medium';
    case 3: return 'High';
    default: return 'Not specified';
  }
};

// 帮助函数：将维护级别转换为文本
const formatMaintenance = (maintenance: number | null): string => {
  switch (maintenance) {
    case 1: return 'Low';
    case 2: return 'Medium';
    case 3: return 'High';
    default: return 'Not specified';
  }
};

// 帮助函数：将肥料类型转换为文本
const formatFertilizer = (fertilizer: number | null): string => {
  switch (fertilizer) {
    case 1: return 'Organic';
    case 2: return 'Conventional';
    default: return 'Not specified';
  }
};

// 帮助函数：格式化日期
const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

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

// 获取Garden Advisor详情
export const getGardenAdvisorDetail = async (advisorId: string | number): Promise<GardenAdvisorDetail> => {
  try {
    // 处理advisorId是数组的情况
    const id = Array.isArray(advisorId) ? advisorId[0] : advisorId;
    
    // 发起请求获取garden-advisor详情
    const response = await axios.get(`${API_URL}/garden-advisors/detail/${id}`, {
      withCredentials: true
    });
    
    // 获取原始数据
    const data = response.data;
    
    // 格式化Garden Plan数据
    if (data.gardenPlan) {
      // 1. 如果后端返回的location已经包含了Hardiness Zone信息，则不需要再次处理
      // 但如果location是"no information"，则替换为更友好的表述
      if (data.gardenPlan.location === 'no information') {
        data.gardenPlan.location = 'No information';
      }
      
      // 2. 确保枚举值正确转换为对应文本
      // 如果后端已经返回了格式化的文本，则使用后端返回的
      // 如果后端返回的是空字符串或null，则使用前端格式化函数处理
      if (!data.gardenPlan.experience) {
        data.gardenPlan.experience = formatExperience(data.gardenPlan.experience);
      }
      
      if (!data.gardenPlan.budget) {
        data.gardenPlan.budget = formatBudget(data.gardenPlan.budget);
      }
      
      if (!data.gardenPlan.time) {
        data.gardenPlan.time = formatTime(data.gardenPlan.time);
      }
      
      if (!data.gardenPlan.maintenance) {
        data.gardenPlan.maintenance = formatMaintenance(data.gardenPlan.maintenance);
      }
      
      if (!data.gardenPlan.fertilizer) {
        data.gardenPlan.fertilizer = formatFertilizer(data.gardenPlan.fertilizer);
      }
      
      // 3. 如果后端返回的日期格式不是预期的格式，则使用前端格式化函数处理
      if (!data.gardenPlan.createdAt || data.gardenPlan.createdAt === '') {
        data.gardenPlan.createdAt = formatDate(data.gardenPlan.ctime);
      }
    }
    
    // 返回格式化后的数据
    return data;
  } catch (error) {
    console.error('获取Garden Advisor详情失败:', error);
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