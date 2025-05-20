import { Request, Response } from 'express';
import GardenDesign from '../models/GardenDesign';
import User from '../models/User';
import UserOrder from '../models/UserOrder';
import PointsLog from '../models/PointsLog';
import { getUserIdFromRequest } from '../utils/auth';
import axios from 'axios';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import gardenStylesData, { commonGardenPrompts, commonRenderingPrompts } from '../data/gardenStyles';

// 添加WordTag接口定义
interface WordTag {
  id: number | string;
  text: string;
}

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

    // 创建当前日期，仅包含年月日部分
    const now = new Date();
    // 将日期转换为YYYY-MM-DD格式的字符串
    const todayStr = now.toISOString().split('T')[0];
    // 创建只包含日期的Date对象
    const today = new Date(todayStr);
    
    console.log('今天日期(字符串格式):', todayStr);
    console.log('今天日期(Date对象):', today);

    // 检查用户是否有活跃订阅
    const activeSubscription = await UserOrder.findOne({
      where: {
        user_id,
        member_start_date: {
          [Op.lte]: today // 开始日期小于等于当前日期
        },
        member_end_date: {
          [Op.gte]: today // 结束日期大于等于当前日期
        }
      }
    });

    // 调试日志
    console.log('查询订阅条件:', {
      user_id,
      'member_start_date <=': todayStr,
      'member_end_date >=': todayStr,
      'Date对象': today
    });

    if (!activeSubscription) {
      console.log('No active subscription for user:', user_id);
      return res.status(403).json({ 
        error: 'No active subscription',
        message: 'There are no active subscriptions, please check the annual discount subscription information.'
      });
    } else {
      console.log('Found active subscription:', {
        id: activeSubscription.id,
        start_date: activeSubscription.member_start_date,
        end_date: activeSubscription.member_end_date
      });
    }

    // 检查用户积分是否足够
    const user = await User.findByPk(user_id);
    if (!user) {
      console.log('User not found:', user_id);
      return res.status(404).json({ error: 'User not found' });
    }

    // 检查用户积分是否足够
    const userPoints = parseInt(user.points || '0', 10);
    if (userPoints < 1) {
      console.log('Insufficient points for user:', user_id);
      return res.status(400).json({ error: 'Insufficient points' });
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
    let finalPrompt = '';  // 最终发送给API的正向提示词
    let finalNegativePrompt = ''; // 最终发送给API的负向提示词
    let style_id = '';  // 风格ID
    let style_name = ''; // 风格名称
    let positiveWordsArr: WordTag[] = []; // 正向词数组
    let negativeWordsArr: WordTag[] = []; // 负向词数组

    // 限制每种类型词组的数量
    const MAX_STYLE_WORDS = 5;
    const MAX_COMMON_GARDEN_WORDS = 5;
    const MAX_COMMON_RENDERING_WORDS = 5;

    // 根据styleType进行不同处理
    if (styleType === 'Classic styles') {
      // Classic styles: 使用风格名称查找预设风格
      style_name = positiveWords; // 风格名称保存在positiveWords
      
      // 在gardenStylesData中查找对应风格
      const styleIndex = gardenStylesData.findIndex((style: any) => style.name === style_name);
      
      if (styleIndex !== -1) {
        style_id = (styleIndex + 1).toString(); // 风格ID为索引+1
        
        // 获取该风格的预设正向词和负向词
        const stylePositivePrompts = gardenStylesData[styleIndex].positivePrompts;
        const styleNegativePrompts = gardenStylesData[styleIndex].negativePrompts;
        
        // 将风格名称作为WordTag添加到positiveWordsArr，限制数量
        positiveWordsArr = stylePositivePrompts.split(',')
          .slice(0, MAX_STYLE_WORDS)
          .map((text: string) => ({
          id: Date.now() + Math.random(),
          text: text.trim()
        }));
        
        // 如果有负向词，也添加到negativeWordsArr，限制数量
        if (styleNegativePrompts) {
          negativeWordsArr = styleNegativePrompts.split(',')
            .slice(0, MAX_STYLE_WORDS)
            .map((text: string) => ({
            id: Date.now() + Math.random(),
            text: text.trim()
          }));
        }
        
        // 添加通用花园提示词，限制数量
        const commonGardenPositive = commonGardenPrompts.positivePrompts.split(',')
          .slice(0, MAX_COMMON_GARDEN_WORDS)
          .map((text: string) => ({
          id: Date.now() + Math.random(),
          text: text.trim()
        }));
        
        const commonGardenNegative = commonGardenPrompts.negativePrompts.split(',')
          .slice(0, MAX_COMMON_GARDEN_WORDS)
          .map((text: string) => ({
          id: Date.now() + Math.random(),
          text: text.trim()
        }));
        
        // 添加通用渲染质量提示词，限制数量
        const commonRenderingPositive = commonRenderingPrompts.positivePrompts.split(',')
          .slice(0, MAX_COMMON_RENDERING_WORDS)
          .map((text: string) => ({
          id: Date.now() + Math.random(),
          text: text.trim()
        }));
        
        const commonRenderingNegative = commonRenderingPrompts.negativePrompts.split(',')
          .slice(0, MAX_COMMON_RENDERING_WORDS)
          .map((text: string) => ({
          id: Date.now() + Math.random(),
          text: text.trim()
        }));
        
        // 合并所有正向词
        positiveWordsArr = [
          ...positiveWordsArr,
          ...commonGardenPositive,
          ...commonRenderingPositive
        ];
        
        // 合并所有负向词
        negativeWordsArr = [
          ...negativeWordsArr,
          ...commonGardenNegative,
          ...commonRenderingNegative
        ];
      } else {
        console.log('Style not found:', style_name);
        return res.status(400).json({ error: 'Invalid style name' });
      }
    } else if (styleType === 'Custom styles') {
      // Custom styles: 解析用户提供的自定义词汇
      style_id = '99'; // 99代表Custom styles
      style_name = 'custom style';

      try {
        // 处理用户提供的正向词，已是逗号分隔的字符串
        const userPositiveWordsArray = positiveWords ? positiveWords.split(',') : [];
        positiveWordsArr = userPositiveWordsArray
          .slice(0, MAX_STYLE_WORDS)
          .map((text: string) => ({
            id: Date.now() + Math.random(),
            text: text.trim()
          }));
        
        // 处理用户提供的负向词，已是逗号分隔的字符串
        const userNegativeWordsArray = negativeWords ? negativeWords.split(',') : [];
        negativeWordsArr = userNegativeWordsArray
          .slice(0, MAX_STYLE_WORDS)
          .map((text: string) => ({
            id: Date.now() + Math.random(),
            text: text.trim()
          }));
        
        // 添加通用花园提示词，限制数量
        const commonGardenPositive = commonGardenPrompts.positivePrompts.split(',')
          .slice(0, MAX_COMMON_GARDEN_WORDS)
          .map((text: string) => ({
          id: Date.now() + Math.random(),
          text: text.trim()
        }));
        
        const commonGardenNegative = commonGardenPrompts.negativePrompts.split(',')
          .slice(0, MAX_COMMON_GARDEN_WORDS)
          .map((text: string) => ({
          id: Date.now() + Math.random(),
          text: text.trim()
        }));
        
        // 添加通用渲染质量提示词，限制数量
        const commonRenderingPositive = commonRenderingPrompts.positivePrompts.split(',')
          .slice(0, MAX_COMMON_RENDERING_WORDS)
          .map((text: string) => ({
          id: Date.now() + Math.random(),
          text: text.trim()
        }));
        
        const commonRenderingNegative = commonRenderingPrompts.negativePrompts.split(',')
          .slice(0, MAX_COMMON_RENDERING_WORDS)
          .map((text: string) => ({
          id: Date.now() + Math.random(),
          text: text.trim()
        }));
        
        // 合并所有正向词
        positiveWordsArr = [
          ...positiveWordsArr,
          ...commonGardenPositive,
          ...commonRenderingPositive
        ];
        
        // 合并所有负向词
        negativeWordsArr = [
          ...negativeWordsArr,
          ...commonGardenNegative,
          ...commonRenderingNegative
        ];
      } catch (e) {
        console.error('Error parsing word tags:', e);
        return res.status(400).json({ error: 'Invalid word tag format' });
      }
    } else {
      console.log('Validation failed: Invalid style type');
      return res.status(400).json({ error: 'Invalid style type' });
    }
    
    // 将WordTag数组转换为字符串，用英文逗号分隔
    finalPrompt = positiveWordsArr.map(tag => tag.text).filter(Boolean).join(', ');
    finalNegativePrompt = negativeWordsArr.map(tag => tag.text).filter(Boolean).join(', ');
    
    console.log('Final positive prompt:', finalPrompt);
    console.log('Final negative prompt:', finalNegativePrompt);
    
    // 解析图片尺寸
    if (!size.includes('*')) {
      console.log('Validation failed: Invalid size format');
      return res.status(400).json({ error: 'Invalid size format, expected format: width*height' });
    }

    // 先调用第三方接口生成图片
    let task_id = null;
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
      
      // 请求体 - 使用合并后的提示词
      const payload = {
        "model": "wanx2.1-t2i-plus",
        "input": {
          "prompt": finalPrompt,
          "negative_prompt": finalNegativePrompt
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
      task_id = result.output.task_id;
      console.log(`Task created successfully, task_id: ${task_id}`);

      if (!task_id) {
        throw new Error('Failed to get task_id from third-party API');
      }
    } catch (apiError: any) {
      console.error('Error calling third-party API:', apiError);
      return res.status(500).json({ 
        error: 'Failed to generate garden design', 
        details: apiError.message 
      });
    }
    
    // 创建新的设计记录 - 保存为逗号分隔的字符串，不再使用JSON格式
    const gardenDesign = await GardenDesign.create({
      user_id,
      project_id: projectId,
      pic_orginial: imageUrl,
      status: 1, // 1代表生成中
      style_id: Number(style_id),
      style_name,
      positive_words: positiveWordsArr.map(tag => tag.text).join(','), // 保存为逗号分隔的字符串
      negative_words: negativeWordsArr.map(tag => tag.text).join(','), // 保存为逗号分隔的字符串
      structural_similarity: parseInt(structuralSimilarity),
      is_like: 0,
      is_del: 0,
      points_cost: 1, // 记录消耗的点数
      third_task_id: task_id,
      ctime: Math.floor(Date.now() / 1000),
      utime: Math.floor(Date.now() / 1000)
    });

    // 处理积分扣除
    try {
      // 1. 更新用户积分
      await user.update({
        points: (userPoints - 1).toString(),
        utime: Math.floor(Date.now() / 1000)
      });

      // 2. 更新用户订单表中的积分余额
      const userOrder = await UserOrder.findOne({
        where: {
          user_id,
          points_remain: {
            [Op.gt]: 0
          }
        },
        order: [['member_start_date', 'ASC']]
      });

      if (userOrder) {
        await userOrder.update({
          points_remain: (userOrder.points_remain || 0) - 1,
          utime: Math.floor(Date.now() / 1000)
        });
      } else {
        console.log('No valid user order found for user:', user_id);
      }

      // 3. 添加积分日志
      await PointsLog.create({
        user_id,
        points_type: '2', // 2代表减少
        points_num: 1,    // 本次扣除数量
        log_type: 11,     // 11代表生成设计图
        log_content: '生成garden_design',
        related_id: gardenDesign.id.toString(),
        ctime: Math.floor(Date.now() / 1000),
        utime: Math.floor(Date.now() / 1000)
      });

      console.log('Points deducted successfully for user:', user_id);
    } catch (pointsError) {
      console.error('Error processing points deduction:', pointsError);
      // 记录错误但不中断流程
    }
    
    return res.status(200).json(gardenDesign);
  } catch (error) {
    console.error('Error generating garden design:', error);
    return res.status(500).json({ error: 'Failed to generate garden design' });
  }
}; 