import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义自定义风格表的接口
interface CustomStyleAttributes {
  id: number;
  custom_style_name: string;
  user_id: number;
  positive_words: object | null;
  negative_words: object | null;
  is_del: number | null;
  ctime: number | null;
  utime: number | null;
}

// 定义创建时的可选字段
interface CustomStyleCreationAttributes extends Optional<CustomStyleAttributes, 'id'> {}

// 定义CustomStyle模型
class CustomStyle extends Model<CustomStyleAttributes, CustomStyleCreationAttributes> implements CustomStyleAttributes {
  public id!: number;
  public custom_style_name!: string;
  public user_id!: number;
  public positive_words!: object | null;
  public negative_words!: object | null;
  public is_del!: number | null;
  public ctime!: number | null;
  public utime!: number | null;
}

// 初始化模型
CustomStyle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    custom_style_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    positive_words: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    negative_words: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_del: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '0正常1删除',
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
    tableName: 'custom_styles',
    timestamps: false, // 不使用Sequelize的自动时间戳
  }
);

export default CustomStyle; 