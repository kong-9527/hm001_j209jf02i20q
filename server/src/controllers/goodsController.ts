import { Request, Response } from 'express';
import Goods from '../models/Goods';

/**
 * 获取定价计划
 * 从数据库中获取所有定价计划商品
 */
export const getPricingPlans = async (req: Request, res: Response) => {
  try {
    const goods = await Goods.findAll({
      attributes: [
        'id', 
        'goods_name', 
        'goods_description', 
        'price_original', 
        'price_pay',
        'price_compare',
        'price_per_month',
        'goods_version',
        'design_num',
        'creem_product_id',
        'features'
      ]
    });

    // 如果没有找到商品，返回404
    if (!goods || goods.length === 0) {
      return res.status(404).json({ message: 'No pricing plans found' });
    }

    return res.status(200).json(goods);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 