import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
// 使用类型导入而不是值导入，避免可能的循环依赖
import type { ModelStatic } from 'sequelize';

// 定义花园顾问表的接口
interface GardenAdvisorAttributes {
  id: number;
  user_id: number | null;
  project_id: number | null;
  status: number | null;
  points_cost: number | null;
  loaction: number | null; // 保持原始SQL中的字段名
  hardiness_zone: number | null;
  experience: number | null;
  budget: number | null;
  time: number | null;
  maintenance: number | null;
  fertilizer: number | null;
  spaces: number | null;
  goals: string | null;
  plant_types: string | null;
  allergies: string | null;
  ctime: number | null;
  utime: number | null;
}

// 创建时的可选属性
interface GardenAdvisorCreationAttributes extends Optional<GardenAdvisorAttributes, 'id'> {}

// 花园顾问模型类
class GardenAdvisor extends Model<GardenAdvisorAttributes, GardenAdvisorCreationAttributes> implements GardenAdvisorAttributes {
  public id!: number;
  public user_id!: number | null;
  public project_id!: number | null;
  public status!: number | null;
  public points_cost!: number | null;
  public loaction!: number | null;
  public hardiness_zone!: number | null;
  public experience!: number | null;
  public budget!: number | null;
  public time!: number | null;
  public maintenance!: number | null;
  public fertilizer!: number | null;
  public spaces!: number | null;
  public goals!: string | null;
  public plant_types!: string | null;
  public allergies!: string | null;
  public ctime!: number | null;
  public utime!: number | null;
}

// 初始化模型
GardenAdvisor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    points_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    loaction: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    hardiness_zone: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    budget: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maintenance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fertilizer: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    spaces: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    goals: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    plant_types: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    allergies: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ctime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    utime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'garden_advisor',
    modelName: 'GardenAdvisor',
  }
);

// 建立关联关系
GardenAdvisor.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// 延迟关联关系的建立，在所有模型定义后再执行
export const setupGardenAdvisorAssociations = (Project: ModelStatic<Model>) => {
  GardenAdvisor.belongsTo(Project, {
    foreignKey: 'project_id',
    as: 'project',
  });
};

export default GardenAdvisor; 