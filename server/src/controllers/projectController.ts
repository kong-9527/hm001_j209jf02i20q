import { Request, Response } from 'express';
import Project from '../models/Project';

// 定义用户类型
interface UserPayload {
  id: number;
  [key: string]: any;
}

// 获取用户的所有项目
export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserPayload | undefined;
    const userId = user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const projects = await Project.findAll({
      where: { user_id: userId },
      order: [['utime', 'DESC']]
    });
    
    return res.status(200).json(projects);
  } catch (error) {
    console.error('Error getting user projects:', error);
    return res.status(500).json({ error: 'Failed to get projects' });
  }
};

// 创建新项目
export const createProject = async (req: Request, res: Response) => {
  try {
    const { project_name, project_pic } = req.body;
    const user = req.user as UserPayload | undefined;
    const userId = user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const newProject = await Project.create({
      project_name,
      project_pic,
      user_id: userId,
      ctime: Date.now(),
      utime: Date.now()
    });
    
    return res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
};

// 更新项目
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { project_name, project_pic } = req.body;
    const user = req.user as UserPayload | undefined;
    const userId = user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const project = await Project.findOne({
      where: { id, user_id: userId }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    await project.update({
      project_name,
      project_pic,
      utime: Date.now()
    });
    
    return res.status(200).json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ error: 'Failed to update project' });
  }
};

// 删除项目
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as UserPayload | undefined;
    const userId = user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const project = await Project.findOne({
      where: { id, user_id: userId }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    await project.destroy();
    
    return res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
}; 