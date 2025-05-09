import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 如果未设置JWT密钥，在控制台显示警告
if (JWT_SECRET === 'your-secret-key') {
  console.warn('警告: 使用默认的JWT密钥。在生产环境中，请在.env文件中设置JWT_SECRET环境变量。');
}

// 定义JWT解析后的用户类型
interface JwtPayload {
  id: number;
  email: string;
  nickName?: string | null;
  registerType?: number | null;
  googleId?: string | null;
  [key: string]: any;
}

// JWT认证中间件
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // 从cookie中获取token
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '未提供认证令牌', 
      redirect: '/signin' 
    });
  }

  try {
    // 验证token
    const user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // 将用户信息添加到请求对象中
    req.user = user;
    
    next();
  } catch (error) {
    // token无效或已过期
    return res.status(403).json({ 
      success: false, 
      message: '无效或已过期的认证令牌', 
      redirect: '/signin' 
    });
  }
}; 