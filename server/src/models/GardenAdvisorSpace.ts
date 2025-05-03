import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import type { ModelStatic } from 'sequelize';

// 定义花园顾问空间表的接口
interface GardenAdvisorSpaceAttributes {
  id: number;
  advisor_id: number | null;
  in_out: string | null;
  cultivation: string | null;
  length: number | null;
  width: number | null;
  height: number | null;
  diameter: string | null;
  sunlight: string | null;
  soil: string | null;
  water_access: string | null;
}

// 创建时的可选属性
interface GardenAdvisorSpaceCreationAttributes extends Optional<GardenAdvisorSpaceAttributes, 'id'> {}

// 花园顾问空间模型类
class GardenAdvisorSpace extends Model<GardenAdvisorSpaceAttributes, GardenAdvisorSpaceCreationAttributes> implements GardenAdvisorSpaceAttributes {
  public id!: number;
  public advisor_id!: number | null;
  public in_out!: string | null;
  public cultivation!: string | null;
  public length!: number | null;
  public width!: number | null;
  public height!: number | null;
  public diameter!: string | null;
  public sunlight!: string | null;
  public soil!: string | null;
  public water_access!: string | null;
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
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cultivation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    length: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    width: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    height: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    diameter: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sunlight: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    soil: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    water_access: {
      type: DataTypes.STRING(255),
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