import express from 'express';
import paymentController from '../controllers/paymentController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 创建支付订单并获取结账链接
router.post('/checkout', authenticateJWT, paymentController.createOrder);

// 处理支付回调 (POST方法接收前端传来的回调参数)
router.post('/callback', paymentController.handlePaymentCallback);

// 获取支付状态
router.get('/status/:checkoutId', paymentController.getPaymentStatus);

// 获取用户订单
router.get('/user-orders', authenticateJWT, paymentController.getUserOrders);

export default router; 