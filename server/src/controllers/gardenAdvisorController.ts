import { Request, Response } from 'express';
import { Op } from 'sequelize';
import GardenAdvisor from '../models/GardenAdvisor';
import GardenAdvisorSpace from '../models/GardenAdvisorSpace';
import User from '../models/User';
import PointsLog from '../models/PointsLog';
import UserOrder from '../models/UserOrder';
import sequelize from '../config/database';

// Points required to create a garden advisor
const REQUIRED_POINTS = 5;

// 定义用户类型
interface UserInfo {
  id: number;
  email: string;
  [key: string]: any;
}

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

    // 获取用户有效的订单记录
    const currentDate = new Date();
    const validUserOrders = await UserOrder.findAll({
      where: {
        user_id: userId,
        points_remain: {
          [Op.gt]: 0  // 剩余点数大于0
        },
        member_start_date: {
          [Op.lte]: currentDate  // 开始日期小于等于当前日期
        },
        member_end_date: {
          [Op.gte]: currentDate  // 结束日期大于等于当前日期
        }
      },
      order: [['member_start_date', 'ASC']],  // 按开始日期正序排序
      transaction
    });

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
        status: 0, // 初始状态为0
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
    const spacesPromises = gardenSpaces.map(async (space: any) => {
      // 提取和转换空间数据
      const spaceData = {
        advisor_id: advisor.id,
        in_out: space.inOut,
        type: space.type,
        length: space.length,
        width: space.width,
        height: space.height,
        diameter: space.diameter,
        sunlight: space.sunlight,
        soil: space.soil,
        water_access: space.waterAccess,
        measurement: space.measurement,
        ctime: Math.floor(Date.now() / 1000),
        utime: Math.floor(Date.now() / 1000)
      };
      return GardenAdvisorSpace.create(spaceData, { transaction });
    });

    await Promise.all(spacesPromises);
    console.log('Garden Advisor Space记录已创建');

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
      await order.update({
        points_remain: newOrderPointsRemain,
        utime: Math.floor(Date.now() / 1000)
      }, { transaction });

      // 创建点数日志条目
      pointsLogEntries.push({
        user_id: userId,
        points_type: '2', // 2表示减少
        points_num: pointsToDeduct,
        log_type: 12, // 12消耗:生成建议
        log_content: `Create Garden Advisor ID: ${advisor.id}`,
        related_id: order.related_id, // 订单的related_id
        content_id: advisor.id.toString(), // 本次生成的garden_advisor的id
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

    await transaction.commit();
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
    'cm': 1,
    'inch': 2
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