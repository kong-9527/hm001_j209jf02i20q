import express from 'express';
import { goodsController } from '../controllers';

const router = express.Router();

// 获取所有定价计划
router.get('/pricing-plans', goodsController.getPricingPlans);

export default router; 