import express from 'express';
import { getUserProjects, createProject, updateProject, deleteProject } from '../controllers/projectController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 所有路由都需要身份验证
router.use(authenticateJWT);

// 获取用户的所有项目
router.get('/', getUserProjects);

// 创建新项目
router.post('/', createProject);

// 更新项目
router.put('/:id', updateProject);

// 删除项目
router.delete('/:id', deleteProject);

export default router; 