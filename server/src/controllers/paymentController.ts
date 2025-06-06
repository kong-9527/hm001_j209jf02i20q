import { Request, Response } from 'express';
import { format, addDays } from 'date-fns';
import axios from 'axios';
import crypto from 'crypto';
import { Goods, PayOrder, UserOrder, User, PointsLog } from '../models';

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

// 回调参数接口
interface RedirectParams {
  request_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
}

// Creem API密钥
const CREEM_API_KEY = process.env.CREEM_API_KEY || '';

// 如果未设置API密钥，显示警告
if (!CREEM_API_KEY) {
  console.warn('⚠️ 严重警告: CREEM API密钥未设置! ⚠️');
  console.warn('支付验证功能将无法正常工作。');
  console.warn('请在.env文件中设置CREEM_API_KEY环境变量。');
  console.warn('示例: CREEM_API_KEY=your_api_key_here');
  
  // 如果是生产环境，可能需要中断启动
  if (process.env.NODE_ENV === 'production') {
    console.error('生产环境中缺少必要的API密钥，这可能导致严重的安全风险。');
    // 注释以下行以允许继续启动
    // process.exit(1);
  }
}

// 生成订单号
const generateOrderNumber = (): string => {
  // 生成规则：G_后面加上当前时刻的年月日时分秒14位数字，再后面是6位随机
  const dateStr = format(new Date(), 'yyyyMMddHHmmss');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `G_${dateStr}${random}`;
};

// 生成签名
const generateSignature = (params: RedirectParams, apiKey: string): string => {
  // 按字典顺序对参数键进行排序，确保顺序一致性
  const sortedParams = Object.keys(params).sort().reduce((acc: Record<string, string | null>, key) => {
    const typedKey = key as keyof RedirectParams;
    const value = params[typedKey];
    // 只添加非undefined的值
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  // 过滤并格式化参数字符串
  const data = Object.entries(sortedParams)
    .filter(([, value]) => value !== undefined && value !== null) // 过滤掉undefined和null值
    .map(([key, value]) => `${key}=${value}`)
    .concat(`salt=${apiKey}`) // 添加salt参数
    .join('|');
  
  console.log('签名数据字符串:', data);
  
  // 生成SHA-256哈希
  return crypto.createHash('sha256').update(data).digest('hex');
};

// 验证签名
const verifySignature = (params: any, signature: string): boolean => {
  // 如果API密钥未设置，无法验证签名
  if (!CREEM_API_KEY) {
    console.error('无法验证签名: CREEM API密钥未设置');
    return false;
  }
  
  // 提取需要验证的参数，只添加实际存在的参数
  const redirectParams: RedirectParams = {};
  
  // 有条件地添加参数，只处理存在的参数
  if (params.request_id) redirectParams.request_id = params.request_id;
  if (params.checkout_id) redirectParams.checkout_id = params.checkout_id;
  if (params.order_id) redirectParams.order_id = params.order_id;
  if (params.customer_id) redirectParams.customer_id = params.customer_id;
  if (params.subscription_id) redirectParams.subscription_id = params.subscription_id;
  if (params.product_id) redirectParams.product_id = params.product_id;
  
  // 添加调试日志
  console.log('支付回调参数:', params);
  console.log('用于签名验证的参数:', redirectParams);
  
  // 生成签名
  const calculatedSignature = generateSignature(redirectParams, CREEM_API_KEY);
  
  // 添加日志比较签名
  console.log('收到的签名:', signature);
  console.log('计算的签名:', calculatedSignature);
  console.log('签名验证结果:', calculatedSignature === signature);
  
  // 比较计算的签名和提供的签名
  return calculatedSignature === signature;
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

    // 检查API密钥是否设置
    if (!CREEM_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: '支付功能未正确配置，请联系管理员' 
      });
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

    // 获取基础URL (支持https)
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://aigardendesign.org' // 生产环境域名，请替换为实际域名
      : 'https://aigardendesign.org:3000'; // 开发环境使用https

    // 支付成功后的回调URL
    const successUrl = `${baseUrl}/dashboard/billing/payment`;

    // 请求第三方支付平台获取结账链接
    const postData = {
      product_id: goodsItem.creem_product_id,
      request_id: orderNumber,
      units: 1,
      customer: {
        email: userData.email
      },
      success_url: successUrl // 指定支付成功后的回调URL
    };

    const response = await axios.post('https://api.creem.io/v1/checkouts', postData, {
      headers: {
        'x-api-key': CREEM_API_KEY,
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

// 处理支付回调
export const handlePaymentCallback = async (req: Request, res: Response) => {
  try {
    console.log('收到支付回调请求:', req.body);
    
    // 获取请求中的参数（POST请求体中的参数）
    const callbackParams = req.body;
    const checkout_id = callbackParams.checkout_id;
    const signature = callbackParams.signature;
    
    // 验证必要参数
    if (!checkout_id) {
      console.error('缺少checkout_id参数');
      return res.status(400).json({ 
        success: false, 
        message: '缺少checkout_id参数',
        status: 'error'
      });
    }
    
    console.log(`正在查找checkout_id=${checkout_id}的订单`);
    
    // 查找对应的支付订单
    const payOrder = await PayOrder.findOne({
      where: { platform_num: checkout_id }
    });
    
    if (!payOrder) {
      console.error(`找不到platform_num=${checkout_id}的支付订单`);
      return res.status(404).json({ 
        success: false, 
        message: '找不到对应的支付订单',
        status: 'error'
      });
    }
    
    console.log(`找到订单: ID=${payOrder.id}, pay_num=${payOrder.pay_num}`);
    
    // 将所有回调参数保存到订单的return_request字段
    await payOrder.update({
      return_request: JSON.parse(JSON.stringify(callbackParams)) as any,
      utime: Math.floor(Date.now() / 1000)
    });
    
    console.log('已保存回调参数到订单');
    
    // 验证签名
    let isValidSignature = false;
    if (signature) {
      console.log('开始验证签名');
      isValidSignature = verifySignature(callbackParams, signature);
      console.log(`签名验证结果: ${isValidSignature ? '成功' : '失败'}`);
    } else {
      console.warn('未提供签名参数，跳过验证');
    }
    
    // 更新订单状态（如果签名有效）
    if (isValidSignature) {
      console.log('签名验证成功，更新订单状态为已支付');
      await payOrder.update({
        platform_status: '1', // 支付成功
        utime: Math.floor(Date.now() / 1000)
      });
      
      // 查询商品信息
      const goodsItem = await Goods.findByPk(payOrder.goods_id || 0);
      if (!goodsItem) {
        console.error(`找不到goods_id=${payOrder.goods_id}的商品`);
        return res.status(404).json({ 
          success: false, 
          message: '找不到对应的商品信息',
          status: 'error'
        });
      }
      
      // 获取当前日期
      const currentDate = new Date();
      // 转换为YYYY-MM-DD格式字符串用于日志
      const startDateStr = currentDate.toISOString().split('T')[0];
      // 计算会员结束日期：当前日期 + 商品的during天数
      const endDate = addDays(currentDate, goodsItem.during || 0);
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // 创建新的Date对象，仅包含日期部分
      const startDateOnly = new Date(startDateStr);
      const endDateOnly = new Date(endDateStr);
      
      console.log('订单开始日期(字符串):', startDateStr);
      console.log('订单结束日期(字符串):', endDateStr);
      
      // 1. 在user_order表中创建新记录
      await UserOrder.create({
        related_id: payOrder.pay_num, // 使用支付订单号作为关联ID
        user_id: payOrder.user_id || 0,
        goods_id: payOrder.goods_id,
        order_type: 1, // 订单类型
        points_num: goodsItem.points, // 使用商品的points字段
        points_remain: goodsItem.points, // 剩余点数初始等于总点数
        member_start_date: startDateOnly, // 会员开始日期，使用Date对象
        member_end_date: endDateOnly, // 会员结束日期，使用Date对象
        ctime: Math.floor(Date.now() / 1000),
        utime: Math.floor(Date.now() / 1000)
      });
      
      // 2. 在points_log表中创建新记录
      await PointsLog.create({
        user_id: payOrder.user_id || 0,
        points_type: '1', // 1表示增加积分 (字符串类型)
        points_num: goodsItem.points, // 使用商品的points字段
        log_type: 1, // 1表示订单充值
        log_content: '订单', // 日志内容
        related_id: payOrder.pay_num, // 使用支付订单号作为关联ID
        ctime: Math.floor(Date.now() / 1000),
        utime: Math.floor(Date.now() / 1000)
      });
      
      // 3. 更新user表中的points值
      const user = await User.findByPk(payOrder.user_id || 0);
      if (user) {
        // 获取用户当前积分，如果为null则默认为0
        const currentPoints = parseInt(user.points || '0', 10);
        // 计算新的积分总数：当前积分 + 商品points数
        const newPoints = currentPoints + goodsItem.points;
        
        // 更新用户积分
        await user.update({
          points: newPoints.toString(),
          utime: Math.floor(Date.now() / 1000)
        });
        
        console.log(`已更新用户ID=${payOrder.user_id}的积分，从${currentPoints}增加到${newPoints}`);
      } else {
        console.error(`找不到user_id=${payOrder.user_id}的用户信息`);
      }
      
      return res.status(200).json({ 
        success: true, 
        message: '支付成功',
        status: 'success',
        orderNumber: payOrder.pay_num,
        goodsName: payOrder.goods_name
      });
    } else {
      console.log('签名验证失败或未提供，订单状态保持不变');
      return res.status(200).json({ 
        success: true, 
        message: '支付回调已记录，但签名验证失败或缺失',
        status: 'pending',
        orderNumber: payOrder.pay_num,
        goodsName: payOrder.goods_name
      });
    }
  } catch (error) {
    console.error('处理支付回调失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '处理支付回调失败',
      status: 'error'
    });
  }
};

// 查询支付状态
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { checkoutId } = req.params;
    
    if (!checkoutId) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少checkoutId参数' 
      });
    }
    
    // 查询订单状态
    const payOrder = await PayOrder.findOne({
      where: { platform_num: checkoutId }
    });
    
    if (!payOrder) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到对应的支付订单' 
      });
    }
    
    const paymentStatus = payOrder.platform_status === '1' ? 'success' : 'pending';
    
    return res.status(200).json({
      success: true,
      status: paymentStatus,
      orderNumber: payOrder.pay_num,
      goodsName: payOrder.goods_name
    });
  } catch (error) {
    console.error('查询支付状态失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: '查询支付状态失败' 
    });
  }
};

// 获取用户订单列表
export const getUserOrders = async (req: Request, res: Response) => {
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

    // 查询用户订单，按ctime倒序排序
    const userOrders = await UserOrder.findAll({
      where: { user_id: userId },
      order: [['ctime', 'DESC']],
      include: [
        {
          model: Goods,
          as: 'goods',
          attributes: ['goods_name']
        }
      ]
    });

    return res.status(200).json({ success: true, data: userOrders });
  } catch (error) {
    console.error('获取用户订单失败:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
};

export default {
  createOrder,
  handlePaymentCallback,
  getPaymentStatus,
  getUserOrders
}; 