import { Request, Response } from 'express';
import { Op } from 'sequelize';
import GardenAdvisor from '../models/GardenAdvisor';

/**
 * 获取用户在指定项目下的花园顾问列表
 */
export const getGardenAdvisorListByProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const projectId = req.query.project_id ? Number(req.query.project_id) : undefined;

    // 参数校验
    if (!userId) {
      res.status(401).json({ message: '用户未认证' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ message: '项目ID不能为空' });
      return;
    }

    // 查询数据库
    const gardenAdvisors = await GardenAdvisor.findAll({
      where: {
        user_id: userId,
        project_id: projectId
      },
      order: [['ctime', 'DESC']] // 按创建时间倒序排序
    });

    res.status(200).json(gardenAdvisors);
  } catch (error) {
    console.error('获取花园顾问列表失败:', error);
    res.status(500).json({ message: '获取花园顾问列表失败', error });
  }
}; 