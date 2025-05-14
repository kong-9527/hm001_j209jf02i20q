import sequelize from '../config/database';
import User from './User';
import PayOrder from './PayOrder';
import UserOrder from './UserOrder';
import PointsLog from './PointsLog';
import Project from './Project';
import GardenAdvisor, { setupGardenAdvisorAssociations } from './GardenAdvisor';
import GardenAdvisorSpace, { setupGardenAdvisorSpaceAssociations } from './GardenAdvisorSpace';
import GardenAdvisorSpacePlant, { setupGardenAdvisorSpacePlantAssociations } from './GardenAdvisorSpacePlant';
import GardenDesign, { setupGardenDesignAssociations } from './GardenDesign';
import Goods from './Goods';
import CustomStyle from './CustomStyle';

// 标记数据库连接状态
let dbConnectionStatus = {
  error: null as Error | null,
  connected: false,
  initializationAttempted: false
};

// 尝试初始化数据库连接和关联
const initializeDatabase = async () => {
  if (dbConnectionStatus.initializationAttempted) {
    return dbConnectionStatus;
  }
  
  dbConnectionStatus.initializationAttempted = true;
  
  try {
    console.log('尝试连接数据库...');
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 初始化所有模型之间的关联关系
    setupGardenAdvisorAssociations(Project);
    setupGardenAdvisorSpaceAssociations(GardenAdvisor);
    setupGardenAdvisorSpacePlantAssociations(GardenAdvisorSpace);
    setupGardenDesignAssociations(Project);
    
    dbConnectionStatus.connected = true;
    console.log('数据库模型关联初始化完成');
  } catch (error) {
    console.error('数据库连接失败:', error);
    dbConnectionStatus.error = error as Error;
  }
  
  return dbConnectionStatus;
};

// 启动数据库初始化，但不等待结果完成
initializeDatabase().catch(err => {
  console.error('数据库初始化过程中发生错误:', err);
});

// 导出数据库连接实例和模型
export {
  sequelize,
  dbConnectionStatus,
  initializeDatabase,
  User,
  PayOrder,
  UserOrder,
  PointsLog,
  Project,
  GardenAdvisor,
  GardenAdvisorSpace,
  GardenAdvisorSpacePlant,
  GardenDesign,
  Goods,
  CustomStyle
}; 