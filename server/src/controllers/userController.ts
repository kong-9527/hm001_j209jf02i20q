import { Request, Response } from 'express';
import { User } from '../models';
import { generateAvatarFromNickName } from '../utils/avatarGenerator';
import jwt from 'jsonwebtoken';

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
    
    // 设置昵称 - 默认使用邮箱前缀
    const userNickName = nick_name || email.split('@')[0];
    
    // 根据昵称生成头像
    const avatarUrl = generateAvatarFromNickName(userNickName);
    
    // 创建新用户
    const now = Math.floor(Date.now() / 1000); // 当前Unix时间戳（秒）
    const newUser = await User.create({
      email,
      password,
      nick_name: userNickName,
      register_type: register_type || 1,
      head_pic: avatarUrl, // 设置生成的头像URL
      points: '0',
      ctime: now,
      utime: now
    });
    
    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      nick_name: newUser.nick_name,
      head_pic: newUser.head_pic
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
};

// 更新用户资料
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    // 从 Cookie 中获取令牌
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(401).json({ message: '未授权，请先登录' });
    }
    
    // 验证令牌
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // 提取要更新的字段
    const { nick_name } = req.body;
    
    if (!nick_name) {
      return res.status(400).json({ message: '昵称不能为空' });
    }
    
    // 检查昵称长度
    if (nick_name.length > 30) {
      return res.status(400).json({ message: '昵称长度不能超过30个字符' });
    }
    
    // 更新用户资料
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 更新用户昵称
    user.nick_name = nick_name;
    // 更新修改时间
    user.utime = Math.floor(Date.now() / 1000);
    
    await user.save();
    
    return res.status(200).json({ 
      message: '资料更新成功',
      user: {
        id: user.id,
        email: user.email,
        nick_name: user.nick_name
      }
    });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}; 