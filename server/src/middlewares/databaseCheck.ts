import { Request, Response, NextFunction } from 'express';
import { dbConnectionStatus } from '../models';

/**
 * 数据库连接中间件 - 检查数据库连接状态
 * 
 * 对于非关键路由(allowBypass=true)：
 * - 即使数据库连接失败也允许请求继续
 * - 适用于静态内容、验证、不需要数据库的API等
 * 
 * 对于关键路由(allowBypass=false)：
 * - 需要数据库连接才能继续
 * - 适用于需要从数据库读取或写入数据的API
 */
export const databaseCheck = (allowBypass = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 如果数据库已连接，继续处理请求
    if (dbConnectionStatus.connected) {
      return next();
    }
    
    // 如果允许绕过，且路由不依赖数据库，记录警告并继续
    if (allowBypass) {
      console.warn(`警告: 数据库未连接，但允许路由 ${req.originalUrl} 继续执行`);
      return next();
    }
    
    // 否则返回数据库连接错误
    console.error(`错误: 数据库未连接，无法处理路由 ${req.originalUrl}`);
    return res.status(503).json({
      error: 'database_unavailable',
      message: '数据库服务暂时不可用，请稍后再试',
      details: dbConnectionStatus.error?.message || '未知错误'
    });
  };
}; 