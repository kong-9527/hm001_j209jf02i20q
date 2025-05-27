import express from 'express';
import { getGardenAdvisorListByProject, createGardenAdvisor, getGardenAdvisorDetail } from '../controllers/gardenAdvisorController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 获取用户特定项目下的花园顾问列表
router.get('/list', authenticateJWT, getGardenAdvisorListByProject);

// 获取花园顾问详情
router.get('/detail/:id', authenticateJWT, getGardenAdvisorDetail);

// 创建花园顾问
router.post('/create', authenticateJWT, createGardenAdvisor);

export default router; 