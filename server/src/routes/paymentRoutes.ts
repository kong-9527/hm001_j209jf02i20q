import express from 'express';
import paymentController from '../controllers/paymentController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 创建支付订单并获取结账链接
router.post('/checkout', authenticateJWT, paymentController.createOrder);

export default router; 