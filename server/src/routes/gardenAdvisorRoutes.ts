import express from 'express';
import { getGardenAdvisorListByProject, createGardenAdvisor } from '../controllers/gardenAdvisorController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 获取用户特定项目下的花园顾问列表
router.get('/list', authenticateJWT, getGardenAdvisorListByProject);

// 创建花园顾问
router.post('/create', authenticateJWT, createGardenAdvisor);

export default router; 