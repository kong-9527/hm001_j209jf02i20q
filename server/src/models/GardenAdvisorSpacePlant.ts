import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import type { ModelStatic } from 'sequelize';

// 定义花园顾问空间植物表的接口
interface GardenAdvisorSpacePlantAttributes {
  id: number;
  space_id: number | null;
  plant_name: string | null;
  plant_pic: string | null;
  reason: string | null;
  conditions_sunlight: string | null;
  conditions_water: string | null;
  conditions_soil: string | null;
  growth_environment: string | null;
  characteristic_height: string | null;
  characteristic_distance: string | null;
  characteristic_bloom: string | null;
  characteristic_lifespan: string | null;
  growing_habits: string | null;
  growing_month: string | null;
  growing_fertilizer: string | null;
  growing_match: string | null;
  growing_cutting: string | null;
  growing_pest: string | null;
  growing_flower_harvest: string | null;
  planting_instructions: string | null;
  tips: string | null;
}

// 创建时的可选属性
interface GardenAdvisorSpacePlantCreationAttributes extends Optional<GardenAdvisorSpacePlantAttributes, 'id'> {}

// 花园顾问空间植物模型类
class GardenAdvisorSpacePlant extends Model<GardenAdvisorSpacePlantAttributes, GardenAdvisorSpacePlantCreationAttributes> implements GardenAdvisorSpacePlantAttributes {
  public id!: number;
  public space_id!: number | null;
  public plant_name!: string | null;
  public plant_pic!: string | null;
  public reason!: string | null;
  public conditions_sunlight!: string | null;
  public conditions_water!: string | null;
  public conditions_soil!: string | null;
  public growth_environment!: string | null;
  public characteristic_height!: string | null;
  public characteristic_distance!: string | null;
  public characteristic_bloom!: string | null;
  public characteristic_lifespan!: string | null;
  public growing_habits!: string | null;
  public growing_month!: string | null;
  public growing_fertilizer!: string | null;
  public growing_match!: string | null;
  public growing_cutting!: string | null;
  public growing_pest!: string | null;
  public growing_flower_harvest!: string | null;
  public planting_instructions!: string | null;
  public tips!: string | null;
}

// 初始化模型
GardenAdvisorSpacePlant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    space_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    plant_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plant_pic: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '推荐理由',
    },
    conditions_sunlight: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    conditions_water: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    conditions_soil: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    growth_environment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '生长环境要求',
    },
    characteristic_height: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    characteristic_distance: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '间距',
    },
    characteristic_bloom: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '开花时间',
    },
    characteristic_lifespan: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '寿命周期，如多年生，常年，季节性，……',
    },
    growing_habits: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '生长习性',
    },
    growing_month: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '种植月份',
    },
    growing_fertilizer: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '如何施肥',
    },
    growing_match: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '跟其他植物搭配',
    },
    growing_cutting: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '修剪事项',
    },
    growing_pest: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '害虫防治',
    },
    growing_flower_harvest: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '种下去多久收获',
    },
    planting_instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '如何栽种',
    },
    tips: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '维护提示',
    },
  },
  {
    sequelize,
    tableName: 'garden_advisor_space_plant',
    modelName: 'GardenAdvisorSpacePlant',
  }
);

// 延迟关联关系的建立
export const setupGardenAdvisorSpacePlantAssociations = (GardenAdvisorSpace: ModelStatic<Model>) => {
  GardenAdvisorSpacePlant.belongsTo(GardenAdvisorSpace, {
    foreignKey: 'space_id',
    as: 'space',
  });
};

export default GardenAdvisorSpacePlant; 