import axios from 'axios';
import { getCurrentUser } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 配置axios实例
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 允许跨域请求携带凭证（Cookies）
});

// 定义自定义风格接口
export interface CustomStyle {
  id: number;
  custom_style_name: string;
  positive_words: string[];
  negative_words: string[];
  create_time?: number;
}

/**
 * 创建自定义风格
 */
export const createCustomStyle = async (
  styleName: string,
  positiveWords: string[],
  negativeWords: string[]
): Promise<CustomStyle> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const response = await api.post('/custom-styles', {
      custom_style_name: styleName,
      positive_words: positiveWords,
      negative_words: negativeWords
    });
    
    return response.data;
  } catch (error) {
    console.error('创建自定义风格失败:', error);
    throw error;
  }
};

/**
 * 获取用户所有自定义风格
 */
export const getUserCustomStyles = async (): Promise<CustomStyle[]> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('Authentication required');
    }
    
    const response = await api.get('/custom-styles');
    return response.data;
  } catch (error) {
    console.error('获取自定义风格列表失败:', error);
    throw error;
  }
};

/**
 * 根据ID获取自定义风格
 */
export const getCustomStyleById = async (styleId: number): Promise<CustomStyle> => {
  try {
    const response = await api.get(`/custom-styles/${styleId}`);
    return response.data;
  } catch (error) {
    console.error(`获取自定义风格失败 (ID: ${styleId}):`, error);
    throw error;
  }
};

/**
 * 更新自定义风格
 */
export const updateCustomStyle = async (
  styleId: number,
  styleName: string,
  positiveWords: string[],
  negativeWords: string[]
): Promise<CustomStyle> => {
  try {
    const response = await api.put(`/custom-styles/${styleId}`, {
      custom_style_name: styleName,
      positive_words: positiveWords,
      negative_words: negativeWords
    });
    
    return response.data;
  } catch (error) {
    console.error(`更新自定义风格失败 (ID: ${styleId}):`, error);
    throw error;
  }
};

/**
 * 删除自定义风格
 */
export const deleteCustomStyle = async (styleId: number): Promise<boolean> => {
  try {
    const response = await api.delete(`/custom-styles/${styleId}`);
    return response.data.success;
  } catch (error) {
    console.error(`删除自定义风格失败 (ID: ${styleId}):`, error);
    throw error;
  }
}; 