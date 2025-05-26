import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import type { ModelStatic } from 'sequelize';

// 定义花园顾问空间表的接口
interface GardenAdvisorSpaceAttributes {
  id: number;
  advisor_id: number | null;
  in_out: number | null;
  cultivation: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  measurement: number | null;
  diameter: number | null;
  sunlight: number | null;
  soil: number | null;
  water_access: number | null;
}

// 创建时的可选属性
interface GardenAdvisorSpaceCreationAttributes extends Optional<GardenAdvisorSpaceAttributes, 'id'> {}

// 花园顾问空间模型类
class GardenAdvisorSpace extends Model<GardenAdvisorSpaceAttributes, GardenAdvisorSpaceCreationAttributes> implements GardenAdvisorSpaceAttributes {
  public id!: number;
  public advisor_id!: number | null;
  public in_out!: number | null;
  public cultivation!: number | null;
  public length!: number | null;
  public width!: number | null;
  public height!: number | null;
  public measurement!: number | null;
  public diameter!: number | null;
  public sunlight!: number | null;
  public soil!: number | null;
  public water_access!: number | null;
}

// 初始化模型
GardenAdvisorSpace.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    advisor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    in_out: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cultivation: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    length: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    width: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    measurement: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    diameter: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sunlight: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    soil: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    water_access: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'garden_advisor_space',
    modelName: 'GardenAdvisorSpace',
  }
);

// 延迟关联关系的建立
export const setupGardenAdvisorSpaceAssociations = (GardenAdvisor: ModelStatic<Model>) => {
  GardenAdvisorSpace.belongsTo(GardenAdvisor, {
    foreignKey: 'advisor_id',
    as: 'advisor',
  });
};

export default GardenAdvisorSpace; 