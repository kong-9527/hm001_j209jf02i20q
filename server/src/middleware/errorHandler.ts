import { Request, Response, NextFunction } from 'express';

/**
 * 全局错误处理中间件
 * 捕获所有未处理的错误并返回合适的响应
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('服务器错误:', err);
  
  // 数据库连接错误
  if (err.name === 'SequelizeConnectionError' || 
      (err.message && err.message.includes('install pg')) ||
      (err.message && err.message.includes('database connection'))) {
    return res.status(500).json({
      error: 'Database Connection Error',
      message: '数据库连接失败，请稍后再试或联系管理员'
    });
  }
  
  // 验证错误
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: '数据验证失败',
      details: err.errors.map((e: any) => ({ field: e.path, message: e.message }))
    });
  }
  
  // JWT认证错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: '认证失败，请重新登录'
    });
  }
  
  // 默认响应
  return res.status(500).json({
    error: 'Server Error',
    message: '服务器内部错误，请稍后再试'
  });
};

/**
 * 异步错误捕获包装器
 * 用于捕获async/await中的错误并传递给错误处理中间件
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  errorHandler,
  asyncHandler
}; 