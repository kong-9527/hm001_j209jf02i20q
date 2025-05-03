// 确保环境变量已加载
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

/**
 * JWT 配置
 * 密钥应从环境变量中获取
 * 请确保在项目根目录下的 .env 文件中设置以下环境变量：
 * 
 * JWT_SECRET=一个安全的随机字符串，用于签名JWT令牌
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 如果未设置 JWT 密钥，在控制台显示警告
if (JWT_SECRET === 'your-secret-key') {
  console.warn('警告: 使用默认的 JWT 密钥！在生产环境中，请在 .env 文件中设置 JWT_SECRET 环境变量。');
}

/**
 * 处理 Google 认证回调
 * 当用户通过 Google 认证后，此函数会被调用
 * 会生成 JWT 令牌并重定向到前端页面
 */
export const googleCallback = async (req: Request, res: Response) => {
  try {
    // 此时用户已通过 Passport 验证
    const user = req.user as any;

    if (!user) {
      return res.redirect('/signin?error=authentication_failed');
    }

    // 生成 JWT 令牌
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        nickName: user.nick_name,
        registerType: user.register_type 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 将令牌保存到 Cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7天
    });

    // 重定向到前端的仪表板页面
    // CLIENT_URL 应在 .env 文件中配置
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`);
  } catch (error) {
    console.error('Google 认证回调处理失败:', error);
    return res.redirect('/signin?error=server_error');
  }
};

/**
 * 获取当前登录用户信息
 * 验证 JWT 令牌并返回用户数据
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // 从 Cookie 中获取令牌
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(401).json({ message: '未授权，请先登录' });
    }
    
    // 验证令牌
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // 获取用户信息
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'nick_name', 'register_type', 'head_pic', 'points', 'ctime']
    });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('获取当前用户信息失败:', error);
    return res.status(401).json({ message: '令牌无效或已过期' });
  }
};

/**
 * 用户登出
 * 清除认证 Cookie
 */
export const logout = (req: Request, res: Response) => {
  res.clearCookie('authToken');
  return res.status(200).json({ message: '成功登出' });
}; 