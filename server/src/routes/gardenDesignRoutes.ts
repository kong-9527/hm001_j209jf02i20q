import express from 'express';
import { getGardenDesigns, updateLikeStatus, softDeleteDesign, generateDesign, checkComfyStatus } from '../controllers/gardenDesignController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 获取当前用户和项目的花园设计图片
router.get('/', authenticateJWT, getGardenDesigns);

// 更新花园设计图片的收藏状态
router.put('/:id/like', authenticateJWT, updateLikeStatus);

// 软删除花园设计图片
router.put('/:id/delete', authenticateJWT, softDeleteDesign);

// 生成花园设计图片
router.post('/generate', authenticateJWT, generateDesign);

// 检查Comfy的生成状态
router.get('/check-comfy-status/:promptId', authenticateJWT, checkComfyStatus);

export default router; 