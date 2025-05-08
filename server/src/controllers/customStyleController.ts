import { Request, Response } from 'express';
import CustomStyle from '../models/CustomStyle';
import { getUserIdFromRequest } from '../utils/auth';

/**
 * 创建自定义风格
 * @route POST /api/custom-styles
 */
export const createCustomStyle = async (req: Request, res: Response) => {
  try {
    // 从请求中获取用户ID
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { custom_style_name, positive_words, negative_words } = req.body;
    
    // 验证必要字段
    if (!custom_style_name) {
      return res.status(400).json({ error: 'Style name is required' });
    }
    
    // 创建自定义风格记录
    const currentTime = Math.floor(Date.now() / 1000);
    const customStyle = await CustomStyle.create({
      custom_style_name,
      user_id: userId,
      positive_words: positive_words || [],
      negative_words: negative_words || [],
      is_del: 0,
      ctime: currentTime,
      utime: currentTime,
    });
    
    return res.status(201).json({
      id: customStyle.id,
      custom_style_name: customStyle.custom_style_name,
      positive_words: customStyle.positive_words,
      negative_words: customStyle.negative_words,
      create_time: customStyle.ctime,
    });
  } catch (error) {
    console.error('创建自定义风格失败:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * 获取当前用户的所有自定义风格
 * @route GET /api/custom-styles
 */
export const getUserCustomStyles = async (req: Request, res: Response) => {
  try {
    // 从请求中获取用户ID
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 查询用户的所有未删除的自定义风格
    const customStyles = await CustomStyle.findAll({
      where: {
        user_id: userId,
        is_del: 0,
      },
      order: [['ctime', 'DESC']], // 按创建时间降序排序
    });
    
    // 转换为客户端需要的格式
    const formattedStyles = customStyles.map(style => ({
      id: style.id,
      custom_style_name: style.custom_style_name,
      positive_words: style.positive_words,
      negative_words: style.negative_words,
      create_time: style.ctime,
    }));
    
    return res.status(200).json(formattedStyles);
  } catch (error) {
    console.error('获取自定义风格列表失败:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * 根据ID获取自定义风格
 * @route GET /api/custom-styles/:id
 */
export const getCustomStyleById = async (req: Request, res: Response) => {
  try {
    // 从请求中获取用户ID
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const styleId = Number(req.params.id);
    
    if (isNaN(styleId)) {
      return res.status(400).json({ error: 'Invalid style ID' });
    }
    
    // 查询指定ID的自定义风格
    const customStyle = await CustomStyle.findOne({
      where: {
        id: styleId,
        user_id: userId, // 确保只能访问自己的风格
        is_del: 0,
      },
    });
    
    if (!customStyle) {
      return res.status(404).json({ error: 'Custom style not found' });
    }
    
    return res.status(200).json({
      id: customStyle.id,
      custom_style_name: customStyle.custom_style_name,
      positive_words: customStyle.positive_words,
      negative_words: customStyle.negative_words,
      create_time: customStyle.ctime,
    });
  } catch (error) {
    console.error('获取自定义风格失败:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * 更新自定义风格
 * @route PUT /api/custom-styles/:id
 */
export const updateCustomStyle = async (req: Request, res: Response) => {
  try {
    // 从请求中获取用户ID
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const styleId = Number(req.params.id);
    
    if (isNaN(styleId)) {
      return res.status(400).json({ error: 'Invalid style ID' });
    }
    
    const { custom_style_name, positive_words, negative_words } = req.body;
    
    // 验证必要字段
    if (!custom_style_name) {
      return res.status(400).json({ error: 'Style name is required' });
    }
    
    // 查询指定ID的自定义风格
    const customStyle = await CustomStyle.findOne({
      where: {
        id: styleId,
        user_id: userId, // 确保只能更新自己的风格
        is_del: 0,
      },
    });
    
    if (!customStyle) {
      return res.status(404).json({ error: 'Custom style not found' });
    }
    
    // 更新风格
    const currentTime = Math.floor(Date.now() / 1000);
    await customStyle.update({
      custom_style_name,
      positive_words: positive_words || [],
      negative_words: negative_words || [],
      utime: currentTime,
    });
    
    return res.status(200).json({
      id: customStyle.id,
      custom_style_name: customStyle.custom_style_name,
      positive_words: customStyle.positive_words,
      negative_words: customStyle.negative_words,
      create_time: customStyle.ctime,
    });
  } catch (error) {
    console.error('更新自定义风格失败:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * 删除自定义风格（软删除）
 * @route DELETE /api/custom-styles/:id
 */
export const deleteCustomStyle = async (req: Request, res: Response) => {
  try {
    // 从请求中获取用户ID
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const styleId = Number(req.params.id);
    
    if (isNaN(styleId)) {
      return res.status(400).json({ error: 'Invalid style ID' });
    }
    
    // 查询指定ID的自定义风格
    const customStyle = await CustomStyle.findOne({
      where: {
        id: styleId,
        user_id: userId, // 确保只能删除自己的风格
        is_del: 0,
      },
    });
    
    if (!customStyle) {
      return res.status(404).json({ error: 'Custom style not found' });
    }
    
    // 软删除风格
    const currentTime = Math.floor(Date.now() / 1000);
    await customStyle.update({
      is_del: 1,
      utime: currentTime,
    });
    
    return res.status(200).json({
      success: true,
      message: 'Custom style deleted successfully',
    });
  } catch (error) {
    console.error('删除自定义风格失败:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}; 