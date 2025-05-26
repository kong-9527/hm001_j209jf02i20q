import { Request, Response } from 'express';
import { Op } from 'sequelize';
import GardenAdvisor from '../models/GardenAdvisor';
import GardenAdvisorSpace from '../models/GardenAdvisorSpace';
import GardenAdvisorSpacePlant from '../models/GardenAdvisorSpacePlant';
import User from '../models/User';
import PointsLog from '../models/PointsLog';
import UserOrder from '../models/UserOrder';
import sequelize from '../config/database';
import OpenAI from "openai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 加载环境变量
dotenv.config();

// Points required to create a garden advisor
const REQUIRED_POINTS = 5;

// 定义用户类型
interface UserInfo {
  id: number;
  email: string;
  [key: string]: any;
}

// 初始化OpenAI客户端
const openai = new OpenAI(
  {
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
  }
);

/**
 * 获取用户在指定项目下的花园顾问列表
 */
export const getGardenAdvisorListByProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as UserInfo;
    const userId = user?.id;
    const projectId = req.query.project_id ? Number(req.query.project_id) : undefined;

    // 参数校验
    if (!userId) {
      res.status(401).json({ message: '用户未认证' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ message: '项目ID不能为空' });
      return;
    }

    // 查询数据库
    const gardenAdvisors = await GardenAdvisor.findAll({
      where: {
        user_id: userId,
        project_id: projectId
      },
      order: [['ctime', 'DESC']] // 按创建时间倒序排序
    });

    res.status(200).json(gardenAdvisors);
  } catch (error) {
    console.error('获取花园顾问列表失败:', error);
    res.status(500).json({ message: '获取花园顾问列表失败', error });
  }
};

/**
 * 创建花园顾问及其空间数据
 */
export const createGardenAdvisor = async (req: Request, res: Response): Promise<void> => {
  const transaction = await sequelize.transaction();

  try {
    const user = req.user as UserInfo;
    const userId = user?.id;
    const projectId = Number(req.body.projectId);
    const {
      gardenLocation, 
      hardinessZone,
      experienceId,
      budgetId, 
      timeId,
      maintenanceId,
      goals,
      plantTypes,
      fertilizerId,
      allergies,
      gardenSpaces
    } = req.body;

    // 记录请求数据，便于调试
    console.log('创建Garden Advisor请求数据:', {
      userId,
      projectId,
      gardenSpaces: gardenSpaces?.length || 0
    });

    // 参数校验
    if (!userId) {
      res.status(401).json({ message: '用户未认证' });
      return;
    }

    if (!projectId) {
      res.status(400).json({ message: '项目ID不能为空' });
      return;
    }

    if (!gardenSpaces || !Array.isArray(gardenSpaces) || gardenSpaces.length === 0) {
      res.status(400).json({ message: '至少需要一个种植空间' });
      return;
    }

    // 检查用户是否有足够的点数
    const userRecord = await User.findByPk(userId);
    if (!userRecord) {
      await transaction.rollback();
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    const userPoints = userRecord.points ? parseFloat(userRecord.points) : 0;
    if (userPoints < REQUIRED_POINTS) {
      await transaction.rollback();
      res.status(400).json({ 
        message: '点数不足',
        msg: 'Insufficient points',
        required: REQUIRED_POINTS,
        current: userPoints 
      });
      return;
    }

    console.log('开始查询用户订单, 用户ID:', userId);
    
    // 直接查询所有订单，不加任何过滤条件，用于调试
    const allUserOrders = await UserOrder.findAll({
      where: {
        user_id: userId
      },
      transaction
    });
    
    console.log('用户所有订单数量:', allUserOrders.length);
    if (allUserOrders.length > 0) {
      console.log('所有订单信息:', allUserOrders.map(order => ({
        id: order.id,
        points_remain: order.points_remain,
        start_date: order.member_start_date,
        end_date: order.member_end_date
      })));
    }

    // 获取用户有效的订单记录 - 检查points_remain和user_id
    const validUserOrders = await UserOrder.findAll({
      where: {
        user_id: userId,  // 确保只查询当前用户的订单
        points_remain: {
          [Op.gt]: 0  // 剩余点数大于0
        }
      },
      order: [['member_start_date', 'ASC']],  // 按开始日期正序排序
      transaction
    });

    // 记录日志便于调试
    console.log('查询到的有效订单数量:', validUserOrders.length);
    if (validUserOrders.length > 0) {
      console.log('有效订单信息:', validUserOrders.map(order => ({
        id: order.id,
        points_remain: order.points_remain,
        start_date: order.member_start_date,
        end_date: order.member_end_date
      })));
    } else {
      console.log('没有找到有效订单，尝试直接使用用户总点数');
      
      // 如果没有找到有效订单，直接返回错误信息
      await transaction.rollback();
      res.status(400).json({ 
        message: '点数不足',
        msg: 'Insufficient points',
        required: REQUIRED_POINTS,
        current: userPoints,
        error: 'No valid orders found'
      });
      return;
    }

    // 检查是否有有效订单
    if (validUserOrders.length === 0) {
      await transaction.rollback();
      res.status(400).json({ 
        message: '没有有效的订单点数',
        msg: 'No valid order points',
      });
      return;
    }

    // 构建计划名称：location + spaces数量 + "places plan"
    // 如果location为空，则使用默认值"My"
    const locationPrefix = gardenLocation || "My";
    const planName = `${locationPrefix} ${gardenSpaces.length} places plan`;

    // 创建花园顾问记录
    const advisor = await GardenAdvisor.create(
      {
        user_id: userId,
        project_id: projectId,
        status: 0, // 更新为生成中状态(0)
        points_cost: REQUIRED_POINTS, // 每次生成消耗5点
        location: gardenLocation,
        plan_name: planName,
        hardiness_zone: hardinessZone,
        experience: experienceId ? Number(experienceId) : null,
        budget: budgetId ? Number(budgetId) : null,
        time: timeId ? Number(timeId) : null,
        maintenance: maintenanceId ? Number(maintenanceId) : null,
        fertilizer: fertilizerId ? Number(fertilizerId) : null,
        spaces: gardenSpaces.length, // 记录空间数量
        goals: goals?.join(','),
        plant_types: plantTypes?.join(','),
        allergies: allergies?.join(','),
        ctime: Math.floor(Date.now() / 1000),
        utime: Math.floor(Date.now() / 1000)
      },
      { transaction }
    );

    console.log('Garden Advisor记录已创建:', advisor.id);

    // 创建种植空间记录
    const createdSpaces = [];
    for (let i = 0; i < gardenSpaces.length; i++) {
      const space = gardenSpaces[i];
      console.log(`处理空间数据 #${i}:`, {
        inOut: space.inOut,
        type: space.type,
        measurement: space.measurement
      });
      
      try {
        // 创建空间记录
        const spaceData: any = {
          advisor_id: advisor.id,
          in_out: space.inOut === 'indoor' ? 1 : 2, // indoor=1, outdoor=2
          cultivation: getCultivationTypeId(space.type),
          measurement: getMeasurementUnitId(space.measurement),
          sunlight: getSunlightTypeId(space.sunlight),
          soil: getSoilTypeId(space.soil),
          water_access: getWaterAccessTypeId(space.waterAccess)
        };

        // 处理尺寸数据
        if (space.type === 'round-pot') {
          // 对于圆形花盆，只保留直径和高度，强制清空长度和宽度
          spaceData.diameter = space.diameter ? parseFloat(String(space.diameter)) : null;
          spaceData.height = space.height ? parseFloat(String(space.height)) : null;
          spaceData.length = null;
          spaceData.width = null;
        } else if (space.type === 'square-pot') {
          // 方形花盆：保留length, width, height，清空diameter
          spaceData.length = space.length ? parseFloat(String(space.length)) : null;
          spaceData.width = space.width ? parseFloat(String(space.width)) : null;
          spaceData.height = space.height ? parseFloat(String(space.height)) : null;
          spaceData.diameter = null;
        } else if (space.type === 'raised-bed') {
          // 高床：保留length, width, height，清空diameter
          spaceData.length = space.length ? parseFloat(String(space.length)) : null;
          spaceData.width = space.width ? parseFloat(String(space.width)) : null;
          spaceData.height = space.height ? parseFloat(String(space.height)) : null;
          spaceData.diameter = null;
        } else if (space.type === 'ground') {
          // 地上种植：保留length和width，清空height和diameter
          spaceData.length = space.length ? parseFloat(String(space.length)) : null;
          spaceData.width = space.width ? parseFloat(String(space.width)) : null;
          spaceData.height = null;
          spaceData.diameter = null;
        } else {
          // 其他未知类型
          spaceData.length = space.length ? parseFloat(String(space.length)) : null;
          spaceData.width = space.width ? parseFloat(String(space.width)) : null;
          spaceData.height = space.height ? parseFloat(String(space.height)) : null;
          spaceData.diameter = space.diameter ? parseFloat(String(space.diameter)) : null;
        }

        const spaceRecord = await GardenAdvisorSpace.create(spaceData, { transaction });
        createdSpaces.push(spaceRecord);
      } catch (err) {
        console.error(`创建空间 #${i} 时发生错误:`, err);
        throw err;
      }
    }

    console.log('所有Garden Space记录已创建');

    // 从订单中扣除点数
    let remainingPointsToDeduct = REQUIRED_POINTS;
    const pointsLogEntries = [];

    // 遍历有效订单，扣除点数
    for (const order of validUserOrders) {
      // 如果没有剩余点数需要扣除，跳出循环
      if (remainingPointsToDeduct <= 0) break;

      // 当前订单可以扣除的点数
      const orderPoints = order.points_remain || 0;
      // 实际从该订单扣除的点数
      const pointsToDeduct = Math.min(orderPoints, remainingPointsToDeduct);
      
      // 更新订单剩余点数
      const newOrderPointsRemain = orderPoints - pointsToDeduct;
      
      // 使用原始查询更新订单
      await UserOrder.update(
        {
          points_remain: newOrderPointsRemain,
          utime: Math.floor(Date.now() / 1000)
        },
        {
          where: {
            id: order.id
          },
          transaction
        }
      );

      // 创建点数日志条目
      pointsLogEntries.push({
        user_id: userId,
        points_type: '2', // 2表示减少
        points_num: pointsToDeduct,
        log_type: 12, // 12消耗:生成建议
        log_content: `Create Garden Advisor`,
        related_id: advisor.id.toString(), // 将garden_advisor的id保存在related_id字段
        ctime: Math.floor(Date.now() / 1000),
        utime: Math.floor(Date.now() / 1000)
      });

      // 减少剩余待扣点数
      remainingPointsToDeduct -= pointsToDeduct;
    }

    // 插入点数日志
    await PointsLog.bulkCreate(pointsLogEntries, { transaction });

    // 更新用户总点数
    const newPoints = (userPoints - REQUIRED_POINTS).toString();
    await userRecord.update({ points: newPoints }, { transaction });

    // 提交事务
    await transaction.commit();
    
    // 异步执行植物生成任务，不阻塞响应
    console.log(`[植物生成] 开始异步执行植物生成任务，Advisor ID: ${advisor.id}, 空间数量: ${createdSpaces.length}`);
    generatePlantsForAdvisor(advisor.id, createdSpaces);
    console.log(`[植物生成] 植物生成任务已启动，响应将不等待任务完成`);

    // 返回成功响应
    res.status(201).json({ 
      id: advisor.id,
      message: '花园顾问创建成功',
      pointsDeducted: REQUIRED_POINTS,
      remainingPoints: newPoints
    });
  } catch (error) {
    await transaction.rollback();
    console.error('创建花园顾问失败:', error);
    res.status(500).json({ message: '创建花园顾问失败', error });
  }
};

// 辅助函数：转换种植类型为数值
function getCultivationTypeId(type: string | undefined | null): number {
  if (!type) return 1; // 默认值
  
  const typeMap: {[key: string]: number} = {
    'square-pot': 1,
    'round-pot': 2,
    'raised-bed': 3,
    'ground': 4
  };
  return typeMap[type.toLowerCase()] || 1;
}

// 辅助函数：转换计量单位为数值
function getMeasurementUnitId(unit: string | undefined | null): number {
  if (!unit) return 1; // 默认值
  
  const unitMap: {[key: string]: number} = {
    'inches': 1,
    'inch': 1,
    'cm': 2
  };
  return unitMap[unit.toLowerCase()] || 1;
}

// 辅助函数：转换阳光条件为数值
function getSunlightTypeId(sunlight: string | undefined | null): number {
  if (!sunlight) return 1; // 默认值
  
  const sunlightMap: {[key: string]: number} = {
    'full-sun': 1,
    'partial-sun': 2,
    'partial-shade': 3,
    'full-shade': 4
  };
  return sunlightMap[sunlight.toLowerCase()] || 1;
}

// 辅助函数：转换土壤类型为数值
function getSoilTypeId(soil: string | undefined | null): number {
  if (!soil) return 1; // 默认值
  
  const soilMap: {[key: string]: number} = {
    'clay': 1,
    'loam': 2,
    'sandy': 3,
    'silt': 4
  };
  return soilMap[soil.toLowerCase()] || 1;
}

// 辅助函数：转换水源可获得性为数值
function getWaterAccessTypeId(waterAccess: string | undefined | null): number {
  if (!waterAccess) return 1; // 默认值
  
  const waterAccessMap: {[key: string]: number} = {
    'easy': 1,
    'limited': 2,
    'difficult': 3
  };
  return waterAccessMap[waterAccess.toLowerCase()] || 1;
}

/**
 * 异步为advisor生成植物推荐
 * @param advisorId Garden Advisor ID
 * @param spaces 创建的空间列表
 */
async function generatePlantsForAdvisor(advisorId: number, spaces: GardenAdvisorSpace[]): Promise<void> {
  try {
    console.log(`[植物生成] 开始为Advisor ID: ${advisorId} 生成植物推荐，共 ${spaces.length} 个空间`);
    
    // 获取advisor详细信息
    const advisor = await GardenAdvisor.findByPk(advisorId);
    if (!advisor) {
      console.error(`[植物生成] 找不到Advisor ID: ${advisorId}`);
      return;
    }

    console.log(`[植物生成] 成功获取Advisor信息: ${advisor.plan_name || '未命名计划'}`);

    // 为每个空间生成植物推荐
    for (let i = 0; i < spaces.length; i++) {
      const space = spaces[i];
      console.log(`[植物生成] 开始处理空间 ${i+1}/${spaces.length}, ID: ${space.id}`);
      
      try {
        await generatePlantsForSpace(advisor, space);
        console.log(`[植物生成] 空间 ${i+1}/${spaces.length} 处理完成`);
      } catch (spaceError) {
        console.error(`[植物生成] 为空间 ${i+1}/${spaces.length}, ID: ${space.id} 生成植物失败:`, spaceError);
      }
    }

    // 所有空间处理完成后，更新advisor状态为已完成(1)
    console.log(`[植物生成] 所有空间处理完成，更新Advisor状态为已完成(1)`);
    await GardenAdvisor.update(
      {
        status: 1,
        utime: Math.floor(Date.now() / 1000)
      },
      {
        where: { id: advisorId }
      }
    );
    
    console.log(`[植物生成] Advisor ID: ${advisorId} 的植物生成任务已全部完成`);
  } catch (error) {
    console.error(`[植物生成] 生成植物推荐失败 (Advisor ID: ${advisorId}):`, error);
    
    // 出错时，更新advisor状态为失败(2)
    console.log(`[植物生成] 更新Advisor状态为失败(2)`);
    await GardenAdvisor.update(
      {
        status: 2,
        utime: Math.floor(Date.now() / 1000)
      },
      {
        where: { id: advisorId }
      }
    );
  }
}

/**
 * 为单个空间生成植物推荐
 * @param advisor Garden Advisor记录
 * @param space 空间记录
 */
async function generatePlantsForSpace(advisor: GardenAdvisor, space: GardenAdvisorSpace): Promise<void> {
  console.log(`[植物生成-详细] 进入generatePlantsForSpace函数，空间ID: ${space.id}`);
  try {
    console.log(`[植物生成] 开始为空间 ID: ${space.id} 生成植物推荐`);
    
    // 构建容器尺寸说明
    let containerSizeDesc = '';
    const measurementUnit = space.measurement === 1 ? 'inches' : 'cm';
    
    if (space.diameter) {
      containerSizeDesc = `diameter ${space.diameter}${measurementUnit}`;
      if (space.height) {
        containerSizeDesc += `, height ${space.height}${measurementUnit}`;
      }
    } else {
      if (space.length) containerSizeDesc += `length ${space.length}${measurementUnit}`;
      if (space.width) {
        if (containerSizeDesc) containerSizeDesc += ', ';
        containerSizeDesc += `width ${space.width}${measurementUnit}`;
      }
      if (space.height) {
        if (containerSizeDesc) containerSizeDesc += ', ';
        containerSizeDesc += `height ${space.height}${measurementUnit}`;
      }
    }
    
    // 构建请求内容 - 使用Record<number, string>类型解决索引签名问题
    const experienceMap: Record<number, string> = { 1: 'Novice', 2: 'Proficient', 3: 'Expert' };
    const budgetMap: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };
    const timeMap: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };
    const maintenanceMap: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };
    const fertilizerMap: Record<number, string> = { 1: 'Organic natural fertilizer', 2: 'Conventional fertilizer' };
    const inOutMap: Record<number, string> = { 1: 'Indoor', 2: 'Outdoor' };
    const cultivationMap: Record<number, string> = { 1: 'Square Pot', 2: 'Round pot', 3: 'Raised Bed', 4: 'Ground' };
    const sunlightMap: Record<number, string> = { 1: 'Full Sun', 2: 'Partial Sun', 3: 'Partial Shade', 4: 'Full Shade' };
    const soilMap: Record<number, string> = { 1: 'Clay', 2: 'Loam', 3: 'Sandy', 4: 'Silty' };
    const waterAccessMap: Record<number, string> = { 1: 'Convenient for watering', 2: 'Limited watering frequency', 3: 'Relying on rainfall' };
    
    // 获取基本提示词
    const basePrompt = fs.readFileSync(path.join(__dirname, '../data/advisor_prmopt.txt'), 'utf8');
    
    // 构建用户提示词
    let promptContent = basePrompt.replace('1. My gardening information is as follows:', `1. My gardening information is as follows:
Country: ${advisor.location || 'United States'}
Cold resistant zone number (USDA standard): ${advisor.hardiness_zone || '6b'}
Horticultural Experience Level: ${experienceMap[advisor.experience || 1] || 'Novice'}
Planting purpose and use: ${advisor.goals || 'for hobbies/garden fragrance/beauty'}
Preferred plant types: ${advisor.plant_types || 'flowers/aquatic plants/orchids/succulents'}
Preference for Fertilization Method: ${fertilizerMap[advisor.fertilizer || 1] || 'Organic natural fertilizer'}
Horticultural budget level: ${budgetMap[advisor.budget || 1] || 'Low'}
Available time: ${timeMap[advisor.time || 1] || 'Low'}
Maintenance difficulty: ${maintenanceMap[advisor.maintenance || 1] || 'Low'}
Allergens or plant ingredients to avoid: ${advisor.allergies || 'mold/weeds/dust/shrubs/insects'}
Cultivation location: ${inOutMap[space.in_out || 1] || 'Indoor'}
Type of cultivation container: ${cultivationMap[space.cultivation || 1] || 'Square Pot'}
Cultivation container size: ${containerSizeDesc || 'diameter 30cm, height 30cm'}
Sunshine environment: ${sunlightMap[space.sunlight || 1] || 'Full Sun'}
Soil conditions: ${soilMap[space.soil || 1] || 'Loam'}
Watering method: ${waterAccessMap[space.water_access || 1] || 'Convenient for watering'}`);
    
    console.log(`[植物生成] 开始为空间 ID: ${space.id} 调用API生成植物推荐`);
    console.log(`[植物生成] 使用API密钥: ${process.env.DASHSCOPE_API_KEY ? '已配置' : '未配置'}`);
    console.log(`[植物生成] 提示词长度: ${promptContent.length} 字符`);
    
    // 调用第三方API
    console.log(`[植物生成] 正在发送请求到模型: qwen-plus`);
    const completion = await openai.chat.completions.create(
      {
        model: "qwen-plus",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: promptContent }
        ]
      },
      { timeout: 600000 } // 600秒超时
    );
    
    console.log(`[植物生成] 空间 ID: ${space.id} 获取API响应成功`);
    
    // 打印完整的API响应对象到控制台
    console.log(`[植物生成] API完整响应对象 (空间 ID: ${space.id}):`);
    console.log(JSON.stringify(completion, null, 2));
    
    // 解析API返回的结果
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error(`[植物生成] API返回内容为空，响应对象:`, JSON.stringify(completion));
      throw new Error('API返回内容为空');
    }
    
    console.log(`[植物生成] API返回内容长度: ${content.length} 字符`);
    console.log(`[植物生成] API返回内容 (空间 ID: ${space.id}):`);
    console.log(content);
    
    // 尝试提取JSON内容（处理可能被包装在markdown代码块中的情况）
    let jsonContent = content;
    // 检查是否被markdown代码块包装 (```json ... ```)
    const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
      console.log(`[植物生成] 检测到返回内容被markdown代码块包装，提取JSON内容`);
      jsonContent = jsonBlockMatch[1];
    }
    
    // 尝试解析JSON
    const plantsData = JSON.parse(jsonContent);
    
    // 获取植物列表，兼容两种可能的数据结构
    const plantsList: any[] = Array.isArray(plantsData) 
      ? plantsData 
      : (plantsData.plants && Array.isArray(plantsData.plants) ? plantsData.plants : []);
    
    if (plantsList.length === 0) {
      console.error(`[植物生成] 无法识别返回的数据结构或植物列表为空: ${JSON.stringify(plantsData).substring(0, 200)}...`);
      throw new Error('返回的数据结构不符合预期或植物列表为空');
    }
    
    console.log(`[植物生成] 解析成功，共获取到 ${plantsList.length} 个植物推荐`);
    
    // 保存每个植物的数据 - 处理字段名称差异
    for (let i = 0; i < plantsList.length; i++) {
      const plant = plantsList[i];
      console.log(`[植物生成] 正在保存第 ${i+1}/${plantsList.length} 个植物: ${plant['Recommended plant name'] || plant['recommended_plant_name'] || '未命名植物'}`);
      
      // 创建映射以处理不同的命名格式
      const getFieldValue = (possibleNames: string[]): any => {
        for (const name of possibleNames) {
          if (plant[name] !== undefined) return plant[name];
        }
        return null;
      };
      
      await GardenAdvisorSpacePlant.create({
        space_id: space.id,
        plant_name: getFieldValue(['Recommended plant name', 'recommended_plant_name']),
        plant_pic: getFieldValue(['Photos', 'photos']),
        reason: getFieldValue(['Recommendation reason', 'recommendation_reason']),
        growth_environment: getFieldValue(['Requirements for Growth Environment', 'growth_environment_requirements']),
        growing_habits: getFieldValue(['Growth habits', 'growth_habits']),
        growing_fertilizer: getFieldValue(['Fertilization suggestions', 'fertilization_suggestions']),
        growing_pest: getFieldValue(['Disease and pest control measures', 'disease_and_pest_control_measures']),
        growing_month: getFieldValue(['Suitable planting months', 'suitable_planting_months']),
        growing_flower_harvest: getFieldValue(['Flowering or ripening period', 'flowering_or_ripening_period']),
        characteristic_distance: getFieldValue(['Recommended planting spacing', 'recommended_planting_spacing']),
        growing_match: getFieldValue(['Suggestions for plant compatibility', 'plant_compatibility_suggestions']),
        growing_cutting: getFieldValue(['Pruning suggestions', 'pruning_suggestions']),
        planting_instructions: getFieldValue(['Planting and transplanting precautions', 'planting_and_transplanting_precautions']),
        tips: getFieldValue(['Daily maintenance suggestions', 'daily_maintenance_suggestions'])
      });
    }
    
    console.log(`[植物生成] 空间 ID: ${space.id} 成功保存了 ${plantsList.length} 个植物推荐`);
  } catch (error) {
    console.error(`[植物生成] 为空间 ID: ${space.id} 生成植物失败:`, error);
    if (error instanceof SyntaxError) {
      console.error('[植物生成] JSON解析错误，可能是API返回的内容格式不正确');
    }
    throw error;
  } finally {
    console.log(`[植物生成-详细] 离开generatePlantsForSpace函数，空间ID: ${space.id}`);
  }
}