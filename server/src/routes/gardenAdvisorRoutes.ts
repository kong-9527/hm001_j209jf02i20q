import express from 'express';
import { getGardenAdvisorListByProject, createGardenAdvisor, getGardenAdvisorDetail, getPlantDetail } from '../controllers/gardenAdvisorController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 获取用户特定项目下的花园顾问列表
router.get('/list', authenticateJWT, getGardenAdvisorListByProject);

// 获取花园顾问详情
router.get('/detail/:id', authenticateJWT, getGardenAdvisorDetail);

// 获取植物详情
router.get('/plant-detail/:spaceId/:plantName', authenticateJWT, getPlantDetail);

// 创建花园顾问
router.post('/create', authenticateJWT, createGardenAdvisor);

export default router; 