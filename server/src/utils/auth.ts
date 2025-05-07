import { Request } from 'express';

/**
 * 从请求对象中获取用户ID
 * @param req Express请求对象
 * @returns 用户ID或null（如果未找到）
 */
export const getUserIdFromRequest = (req: Request): number | null => {
  // 检查是否有用户信息
  if (req.user && typeof req.user === 'object' && 'id' in req.user) {
    return Number(req.user.id);
  }
  return null;
}; 