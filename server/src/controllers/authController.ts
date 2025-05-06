// 确保环境变量已加载
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User as UserModel } from '../models';
import { generateAvatarFromNickName } from '../utils/avatarGenerator';

// 扩展Request类型以包含user属性
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * JWT 配置
 * 密钥应从环境变量中获取
 * 请确保在项目根目录下的 .env 文件中设置以下环境变量：
 * 
 * JWT_SECRET=一个安全的随机字符串，用于签名JWT令牌
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// 会话超时时间 (30分钟)
const SESSION_TIMEOUT = 30 * 60; // 秒

// 如果未设置 JWT 密钥，在控制台显示警告
if (JWT_SECRET === 'your-secret-key') {
  console.warn('警告: 使用默认的 JWT 密钥！在生产环境中，请在 .env 文件中设置 JWT_SECRET 环境变量。');
}

/**
 * 创建JWT令牌和设置Cookie
 * @param user 用户对象
 * @param res Express响应对象
 * @returns JWT令牌
 */
const createTokenAndSetCookie = (user: any, res: Response) => {
  // 生成 JWT 令牌
  const token = jwt.sign(
    { 
      id: user.id,
      email: user.email,
      nickName: user.nick_name,
      registerType: user.register_type,
      googleId: user.google_id
    },
    JWT_SECRET,
    { expiresIn: `${SESSION_TIMEOUT}s` } // 设置为30分钟
  );

  // 将令牌保存到 Cookie
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TIMEOUT * 1000 // 毫秒
  });

  return token;
};

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

    // 创建令牌并设置Cookie
    createTokenAndSetCookie(user, res);

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    
    // 检查是否为弹窗模式
    const isPopup = req.query.popup === 'true';
    
    if (isPopup) {
      // 弹窗模式：使用自动关闭HTML
      // 关键改进：
      // 1. 避免使用postMessage进行跨窗口通信
      // 2. 使用自关闭重定向方式
      // 3. 直接关闭窗口，不使用倒计时
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Login Success</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
            .success-message { margin: 20px auto; max-width: 400px; }
            .btn { 
              background: #4285f4; 
              color: white; 
              border: none; 
              padding: 10px 20px; 
              border-radius: 4px; 
              cursor: pointer; 
            }
          </style>
          <script>
            // 立即关闭窗口
            function closeWindow() {
              window.close();
              // 如果窗口未关闭，尝试重定向到客户端
              setTimeout(() => {
                if (!window.closed) {
                  window.location.href = "${clientUrl}/auth-success";
                }
              }, 300);
            }

            // 页面加载时立即尝试关闭窗口
            window.onload = function() {
              try {
                if (window.opener && !window.opener.closed) {
                  // 告诉父窗口登录成功
                  window.opener.location.href = "${clientUrl}/auth-success";
                  // 立即关闭本窗口
                  closeWindow();
                } else {
                  // 如果没有父窗口，也尝试关闭
                  closeWindow();
                }
              } catch(e) {
                console.error("通知父窗口失败", e);
                // 失败后仍然尝试关闭窗口
                closeWindow();
              }
            };
          </script>
        </head>
        <body>
          <div class="success-message">
            <h2>Login Successful!</h2>
            <p>Your account has been successfully logged in</p>
          </div>
        </body>
        </html>
      `;
      return res.send(html);
    } else {
      // 普通模式：重定向到前端的仪表板页面
      return res.redirect(`${clientUrl}/dashboard`);
    }
  } catch (error) {
    console.error('Google 认证回调处理失败:', error);
    
    // 检查是否为弹窗模式
    const isPopup = req.query.popup === 'true';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    
    if (isPopup) {
      // 弹窗模式：返回错误消息，但使用更可靠的自关闭机制
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Login Failed</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
            .error-message { margin: 20px auto; max-width: 400px; }
            .btn { 
              background: #f44336; 
              color: white; 
              border: none; 
              padding: 10px 20px; 
              border-radius: 4px; 
              cursor: pointer; 
            }
          </style>
          <script>
            // 立即关闭窗口
            function closeWindow() {
              window.close();
              // 如果窗口未关闭，尝试重定向到客户端
              setTimeout(() => {
                if (!window.closed) {
                  window.location.href = "${clientUrl}/auth-error";
                }
              }, 300);
            }

            // 页面加载时立即尝试关闭窗口
            window.onload = function() {
              try {
                if (window.opener && !window.opener.closed) {
                  // 告诉父窗口登录失败
                  window.opener.location.href = "${clientUrl}/auth-error";
                  // 立即关闭本窗口
                  closeWindow();
                } else {
                  // 如果没有父窗口，也尝试关闭
                  closeWindow();
                }
              } catch(e) {
                console.error("通知父窗口失败", e);
                // 失败后仍然尝试关闭窗口
                closeWindow();
              }
            };
          </script>
        </head>
        <body>
          <div class="error-message">
            <h2>Login Failed</h2>
            <p>Sorry, there was a problem during the login process</p>
            <button class="btn" onclick="closeWindow()">Click here if window doesn't close automatically</button>
          </div>
        </body>
        </html>
      `;
      return res.send(html);
    } else {
      // 普通模式：重定向到登录页
      return res.redirect('/signin?error=server_error');
    }
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
    const user = await (UserModel as any).findByPk(decoded.id, {
      attributes: ['id', 'email', 'nick_name', 'register_type', 'head_pic', 'points', 'ctime', 'google_id']
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
 * 刷新用户会话
 * 当用户有活动时调用此函数，重置会话超时时间
 */
export const refreshSession = async (req: Request, res: Response) => {
  try {
    // 从 Cookie 中获取令牌
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(401).json({ message: '未授权，请先登录' });
    }
    
    try {
      // 验证令牌
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // 获取用户信息
      const user = await (UserModel as any).findByPk(decoded.id);
      
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }
      
      // 创建新令牌并设置Cookie
      createTokenAndSetCookie(user, res);
      
      return res.status(200).json({ message: '会话已刷新' });
    } catch (error) {
      // 令牌已过期或无效，需要重新登录
      res.clearCookie('authToken');
      return res.status(401).json({ message: '会话已过期，请重新登录' });
    }
  } catch (error) {
    console.error('刷新会话失败:', error);
    return res.status(500).json({ message: '服务器错误' });
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