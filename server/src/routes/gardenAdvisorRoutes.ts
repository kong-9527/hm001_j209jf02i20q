import express from 'express';
import { getGardenAdvisorListByProject } from '../controllers/gardenAdvisorController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 获取用户特定项目下的花园顾问列表
router.get('/list', authenticateJWT, getGardenAdvisorListByProject);

export default router; 