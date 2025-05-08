import { Request, Response } from 'express';
import GardenDesign from '../models/GardenDesign';
import { getUserIdFromRequest } from '../utils/auth';
import axios from 'axios';

/**
 * 获取当前用户和项目的花园设计图片
 * @route GET /api/garden-designs
 */
export const getGardenDesigns = async (req: Request, res: Response) => {
  try {
    console.log('API call received: GET /api/garden-designs');
    console.log('Request query:', req.query);
    console.log('Request user:', req.user);
    
    // 从请求中获取用户ID
    const user_id = getUserIdFromRequest(req);
    console.log('Extracted user_id:', user_id);
    
    if (!user_id) {
      console.log('Authentication failed: No user ID found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 从请求参数中获取项目ID并转换为数字
    const { project_id, is_del, is_like } = req.query;
    console.log('Raw project_id from query:', project_id);
    console.log('Raw is_del from query:', is_del);
    console.log('Raw is_like from query:', is_like);
    
    if (!project_id) {
      console.log('Validation failed: Missing project_id');
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    // 将project_id转换为数字
    const projectId = Number(project_id);
    console.log('Converted projectId:', projectId);
    
    if (isNaN(projectId)) {
      console.log('Validation failed: Invalid project_id format');
      return res.status(400).json({ error: 'Project ID must be a number' });
    }
    
    // 构建查询条件
    const whereCondition: any = {
      user_id,
      project_id: projectId,
    };
    
    // 如果提供了is_del参数，将其添加到查询条件中
    if (is_del !== undefined) {
      whereCondition.is_del = Number(is_del);
    }
    
    // 如果提供了is_like参数，将其添加到查询条件中
    if (is_like !== undefined) {
      whereCondition.is_like = Number(is_like);
    }
    
    console.log('Executing database query with params:', whereCondition);
    
    // 查询数据库获取花园设计图片
    const gardenDesigns = await GardenDesign.findAll({
      where: whereCondition,
      order: [
        ['ctime', 'DESC'] // 按创建时间倒序排序
      ]
    });
    
    console.log(`Query result: Found ${gardenDesigns.length} garden designs`);
    
    return res.status(200).json(gardenDesigns);
  } catch (error) {
    console.error('Error fetching garden designs:', error);
    return res.status(500).json({ error: 'Failed to fetch garden designs' });
  }
};

/**
 * 更新花园设计图片的收藏状态
 * @route PUT /api/garden-designs/:id/like
 */
export const updateLikeStatus = async (req: Request, res: Response) => {
  try {
    console.log('API call received: PUT /api/garden-designs/:id/like');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    // 从请求中获取用户ID
    const user_id = getUserIdFromRequest(req);
    console.log('Extracted user_id:', user_id);
    
    if (!user_id) {
      console.log('Authentication failed: No user ID found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 获取图片ID
    const { id } = req.params;
    const designId = Number(id);
    
    if (isNaN(designId)) {
      console.log('Validation failed: Invalid design ID format');
      return res.status(400).json({ error: 'Design ID must be a number' });
    }
    
    // 获取要设置的收藏状态
    const { is_like } = req.body;
    
    if (is_like === undefined || ![0, 1].includes(Number(is_like))) {
      console.log('Validation failed: Invalid like status');
      return res.status(400).json({ error: 'is_like must be 0 or 1' });
    }
    
    // 查找该图片并确保它属于当前用户
    const gardenDesign = await GardenDesign.findOne({
      where: {
        id: designId,
        user_id
      }
    });
    
    if (!gardenDesign) {
      console.log('Design not found or does not belong to user');
      return res.status(404).json({ error: 'Garden design not found' });
    }
    
    // 更新收藏状态
    await gardenDesign.update({ is_like: Number(is_like) });
    
    console.log(`Updated design ${designId} like status to ${is_like}`);
    
    return res.status(200).json(gardenDesign);
  } catch (error) {
    console.error('Error updating garden design like status:', error);
    return res.status(500).json({ error: 'Failed to update garden design like status' });
  }
};

/**
 * 软删除花园设计图片（标记为已删除）
 * @route PUT /api/garden-designs/:id/delete
 */
export const softDeleteDesign = async (req: Request, res: Response) => {
  try {
    console.log('API call received: PUT /api/garden-designs/:id/delete');
    console.log('Request params:', req.params);
    
    // 从请求中获取用户ID
    const user_id = getUserIdFromRequest(req);
    console.log('Extracted user_id:', user_id);
    
    if (!user_id) {
      console.log('Authentication failed: No user ID found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 获取图片ID
    const { id } = req.params;
    const designId = Number(id);
    
    if (isNaN(designId)) {
      console.log('Validation failed: Invalid design ID format');
      return res.status(400).json({ error: 'Design ID must be a number' });
    }
    
    // 查找该图片并确保它属于当前用户
    const gardenDesign = await GardenDesign.findOne({
      where: {
        id: designId,
        user_id
      }
    });
    
    if (!gardenDesign) {
      console.log('Design not found or does not belong to user');
      return res.status(404).json({ error: 'Garden design not found' });
    }
    
    // 更新删除状态为已删除(is_del=1)
    await gardenDesign.update({ is_del: 1 });
    
    console.log(`Soft deleted design ${designId}`);
    
    return res.status(200).json(gardenDesign);
  } catch (error) {
    console.error('Error deleting garden design:', error);
    return res.status(500).json({ error: 'Failed to delete garden design' });
  }
};

/**
 * 生成花园设计图
 * @route POST /api/garden-designs/generate
 */
export const generateDesign = async (req: Request, res: Response) => {
  try {
    console.log('API call received: POST /api/garden-designs/generate');
    console.log('Request body:', req.body);
    
    // 从请求中获取用户ID
    const user_id = getUserIdFromRequest(req);
    console.log('Extracted user_id:', user_id);
    
    if (!user_id) {
      console.log('Authentication failed: No user ID found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 获取请求参数
    const { 
      imageUrl, 
      size, 
      styleType, 
      positiveWords, 
      negativeWords, 
      structuralSimilarity,
      projectId 
    } = req.body;
    
    // 参数验证
    if (!imageUrl || !size || !styleType || !projectId) {
      console.log('Validation failed: Missing required parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // 解析参数
    let prompt = '';
    let negative_prompt = '';
    let style_id = '';
    let style_name = '';
    
    // 根据styleType设置参数
    if (styleType === 'Classic styles') {
      // Classic styles使用风格名称作为prompt
      prompt = positiveWords;
      negative_prompt = '';
      style_id = '1'; // 假设1代表Classic styles
      style_name = positiveWords;
    } else if (styleType === 'Custom styles') {
      try {
        // Custom styles使用用户输入的prompt和negative_prompt
        // 解析JSON字符串，并提取所有text字段组成新数组
        const positiveWordsArray = JSON.parse(positiveWords);
        prompt = JSON.stringify(positiveWordsArray.map((item: any) => item.text));
        
        if (negativeWords && negativeWords.trim() !== '') {
          const negativeWordsArray = JSON.parse(negativeWords);
          negative_prompt = JSON.stringify(negativeWordsArray.map((item: any) => item.text));
        } else {
          negative_prompt = '';
        }
        
        style_id = '99'; // 99代表Custom styles
        style_name = 'custom style';
      } catch (error) {
        console.error('Error parsing JSON words:', error);
        return res.status(400).json({ error: 'Invalid JSON format for words' });
      }
    } else {
      console.log('Validation failed: Invalid style type');
      return res.status(400).json({ error: 'Invalid style type' });
    }
    
    // 解析图片尺寸
    if (!size.includes('*')) {
      console.log('Validation failed: Invalid size format');
      return res.status(400).json({ error: 'Invalid size format, expected format: width*height' });
    }
    
    // 创建新的设计记录
    const gardenDesign = await GardenDesign.create({
      user_id,
      project_id: projectId,
      pic_orginial: imageUrl,
      status: 1, // 1代表生成中
      style_id: Number(style_id),
      style_name,
      positive_words: prompt, // 直接存储JSON格式字符串
      negative_words: negative_prompt, // 直接存储JSON格式字符串
      structural_similarity: parseInt(structuralSimilarity),
      is_like: 0,
      is_del: 0,
      ctime: Math.floor(Date.now() / 1000),
      utime: Math.floor(Date.now() / 1000)
    });
    
    // 调用第三方接口生成图片
    try {
      console.log('Calling third-party API to generate image');
      
      // API配置
      const apiUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis";
      const apiKey = "sk-93f08f8aec02495ebad527ed5c2a7d8c"; // 应该从环境变量获取
      
      // 请求头
      const headers = {
        'X-DashScope-Async': 'enable',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };
      
      // 请求体
      const payload = {
        "model": "wanx2.1-t2i-plus",
        "input": {
          "prompt": prompt,
          "negative_prompt": negative_prompt
        },
        "parameters": {
          "size": size,
          "n": 1,
          "prompt_extend": true
        }
      };
      
      console.log('API Payload:', JSON.stringify(payload, null, 2));
      
      // 发送POST请求
      const response = await axios.post(apiUrl, payload, { headers });
      
      // 检查响应
      if (response.status !== 200) {
        throw new Error(`API responded with status code ${response.status}`);
      }
      
      const result = response.data;
      const task_id = result.output.task_id;
      console.log(`Task created successfully, task_id: ${task_id}`);
      
      // 更新设计记录的third_task_id
      await gardenDesign.update({ third_task_id: task_id });
      
      return res.status(200).json(gardenDesign);
    } catch (apiError: any) {
      console.error('Error calling third-party API:', apiError);
      
      // 更新设计记录状态为失败
      await gardenDesign.update({ status: 3 }); // 3代表失败
      
      return res.status(500).json({ 
        error: 'Failed to generate garden design', 
        details: apiError.message 
      });
    }
  } catch (error) {
    console.error('Error generating garden design:', error);
    return res.status(500).json({ error: 'Failed to generate garden design' });
  }
}; 