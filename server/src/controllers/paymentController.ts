import { Request, Response } from 'express';
import { format } from 'date-fns';
import axios from 'axios';
import { Goods, PayOrder, UserOrder, User } from '../models';

// 第三方支付平台响应结构
interface CheckoutResponse {
  id: string;
  object: string;
  product: string;
  units: number;
  status: string;
  checkout_url: string;
  success_url?: string;
  mode: string;
}

// 生成订单号
const generateOrderNumber = (): string => {
  // 生成规则：G_后面加上当前时刻的年月日时分秒14位数字，再后面是6位随机
  const dateStr = format(new Date(), 'yyyyMMddHHmmss');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `G_${dateStr}${random}`;
};

// 创建订单并获取支付链接
export const createOrder = async (req: Request, res: Response) => {
  try {
    // 检查用户是否登录
    if (!req.user) {
      return res.status(401).json({ success: false, message: '未登录', redirect: '/signin' });
    }
    
    // @ts-ignore - 忽略类型检查
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: '用户ID无效' });
    }

    const { goodsId } = req.body;
    
    // 验证商品ID
    if (!goodsId) {
      return res.status(400).json({ success: false, message: '缺少商品ID' });
    }

    // 查询商品信息
    const goodsItem = await Goods.findByPk(goodsId);

    if (!goodsItem) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    // 获取用户信息以获取邮箱
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: '用户不存在' });
    }
    
    // @ts-ignore - 忽略类型检查
    const userData = user.toJSON();
    if (!userData.email) {
      return res.status(400).json({ success: false, message: '用户邮箱不存在' });
    }

    // 生成订单号
    const orderNumber = generateOrderNumber();

    // 创建用户订单记录
    await UserOrder.create({
      user_id: userId,
      goods_id: goodsId,
      order_type: 1, // 订单类型：1为普通订单
      ctime: Math.floor(Date.now() / 1000),
      utime: Math.floor(Date.now() / 1000)
    });

    // 创建支付订单记录
    const payOrder = await PayOrder.create({
      user_id: userId,
      pay_num: orderNumber,
      platform: 'creem',
      platform_num: '', // 暂时留空，等待支付平台返回
      platform_status: '0', // 初始状态，未支付
      goods_id: goodsId,
      goods_name: goodsItem.goods_name,
      platform_product_id: goodsItem.creem_product_id,
      goods_month: goodsItem.goods_version,
      price_type: 1, // 美元
      price_original: goodsItem.price_original,
      price_pay: goodsItem.price_pay,
      ctime: Math.floor(Date.now() / 1000),
      utime: Math.floor(Date.now() / 1000)
    });

    // 请求第三方支付平台获取结账链接
    const creamApiKey = process.env.CREEM_API_KEY || 'creem_5UxTP8KTjKQVrDTwOC52sk';
    const postData = {
      product_id: goodsItem.creem_product_id,
      request_id: orderNumber,
      units: 1,
      customer: {
        email: userData.email
      }
    };

    const response = await axios.post('https://api.creem.io/v1/checkouts', postData, {
      headers: {
        'x-api-key': creamApiKey,
        'Content-Type': 'application/json'
      }
    });

    const responseData = response.data as CheckoutResponse;

    // 确保响应包含必要的字段
    if (!responseData.id || !responseData.checkout_url) {
      return res.status(500).json({ 
        success: false, 
        message: '支付平台返回数据无效',
        data: responseData
      });
    }

    // 更新支付订单的支付平台流水号和响应数据
    await payOrder.update({
      platform_num: responseData.id,
      // 将响应数据序列化为JSON字符串
      checkout_response: JSON.parse(JSON.stringify(response.data)) as any,
      utime: Math.floor(Date.now() / 1000)
    });

    // 返回结账URL和订单ID
    return res.status(200).json({
      success: true,
      orderId: payOrder.id,
      orderNumber: orderNumber,
      checkoutUrl: responseData.checkout_url
    });
  } catch (error) {
    console.error('创建支付订单失败:', error);
    return res.status(500).json({ success: false, message: '创建支付订单失败，请稍后再试' });
  }
};

export default {
  createOrder
}; 