import { Request, Response } from 'express';
import { User } from '../models';

// 获取所有用户
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'nick_name', 'register_type', 'head_pic', 'points', 'ctime']
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error('获取用户失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 根据ID获取用户
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'email', 'nick_name', 'register_type', 'head_pic', 'points', 'ctime']
    });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('获取用户失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 创建用户
export const createUser = async (req: Request, res: Response) => {
  const { email, password, nick_name, register_type } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: '邮箱不能为空' });
  }
  
  try {
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }
    
    // 创建新用户
    const now = Math.floor(Date.now() / 1000); // 当前Unix时间戳（秒）
    const newUser = await User.create({
      email,
      password,
      nick_name: nick_name || email.split('@')[0], // 默认使用邮箱前缀作为昵称
      register_type: register_type || 1,
      points: '0',
      ctime: now,
      utime: now
    });
    
    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      nick_name: newUser.nick_name
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}; 