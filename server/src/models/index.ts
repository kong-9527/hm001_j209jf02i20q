import sequelize from '../config/database';
import User from './User';

// 初始化所有模型之间的关联关系
// (当有更多模型时)

// 导出数据库连接实例和模型
export {
  sequelize,
  User
}; 