import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import type { ModelStatic } from 'sequelize';

// 定义花园设计表的接口
interface GardenDesignAttributes {
  id: number;
  user_id: number | null;
  project_id: number | null;
  pic_orginial: string | null;
  pic_result: string | null;
  pic_third_orginial: string | null;
  status: number | null;
  points_cost: number | null;
  style_id: number | null;
  style_name: string | null;
  positive_words: string | null;
  negative_words: string | null;
  structural_similarity: number | null;
  is_like: number | null;
  is_del: number | null;
  third_task_id: string | null;
  third_generate_id: number | null;
  seed: string | null;
  ctrlnet_strength: number | null;
  ctrlnet_start_percent: number | null;
  ctime: number | null;
  utime: number | null;
}

// 创建时的可选属性
interface GardenDesignCreationAttributes extends Optional<GardenDesignAttributes, 'id'> {}

// 花园设计模型类
class GardenDesign extends Model<GardenDesignAttributes, GardenDesignCreationAttributes> implements GardenDesignAttributes {
  public id!: number;
  public user_id!: number | null;
  public project_id!: number | null;
  public pic_orginial!: string | null;
  public pic_result!: string | null;
  public pic_third_orginial!: string | null;
  public status!: number | null;
  public points_cost!: number | null;
  public style_id!: number | null;
  public style_name!: string | null;
  public positive_words!: string | null;
  public negative_words!: string | null;
  public structural_similarity!: number | null;
  public is_like!: number | null;
  public is_del!: number | null;
  public third_task_id!: string | null;
  public third_generate_id!: number | null;
  public seed!: string | null;
  public ctrlnet_strength!: number | null;
  public ctrlnet_start_percent!: number | null;
  public ctime!: number | null;
  public utime!: number | null;
}

// 初始化模型
GardenDesign.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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
    pic_orginial: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pic_result: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pic_third_orginial: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      comment: '第三方接口原始图片URL',
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '1生成中 2成功 3失败',
    },
    points_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    style_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '自定义时用99',
    },
    style_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '自定义时：custom style',
    },
    positive_words: {
      type: DataTypes.STRING(4096),
      allowNull: true,
    },
    negative_words: {
      type: DataTypes.STRING(4096),
      allowNull: true,
    },
    structural_similarity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '70代表70%',
    },
    third_task_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '第三方任务ID',
    },
    third_generate_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '第三方生成ID',
    },
    seed: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '生成图片使用的种子数',
    },
    ctrlnet_strength: {
      type: DataTypes.FLOAT(11, 2),
      allowNull: true,
      comment: 'ControlNet的强度参数',
    },
    ctrlnet_start_percent: {
      type: DataTypes.FLOAT(11, 2),
      allowNull: true,
      comment: 'ControlNet的开始百分比参数',
    },
    is_like: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '0不喜欢 1喜欢',
    },
    is_del: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '0未删除 1已删除',
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
    tableName: 'garden_design',
    modelName: 'GardenDesign',
  }
);

// 建立与User模型的关联关系
GardenDesign.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// 延迟关联关系的建立
export const setupGardenDesignAssociations = (Project: ModelStatic<Model>) => {
  GardenDesign.belongsTo(Project, {
    foreignKey: 'project_id',
    as: 'project',
  });
};

export default GardenDesign; 