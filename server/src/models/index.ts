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

// 初始化所有模型之间的关联关系
setupGardenAdvisorAssociations(Project);
setupGardenAdvisorSpaceAssociations(GardenAdvisor);
setupGardenAdvisorSpacePlantAssociations(GardenAdvisorSpace);
setupGardenDesignAssociations(Project);

// 导出数据库连接实例和模型
export {
  sequelize,
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