import express from 'express';
import { getGardenDesigns } from '../controllers/gardenDesignController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 获取当前用户和项目的花园设计图片
router.get('/', authenticateJWT, getGardenDesigns);

export default router; 