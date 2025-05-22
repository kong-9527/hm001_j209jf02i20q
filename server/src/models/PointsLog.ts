import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

// 定义积分记录表的接口
interface PointsLogAttributes {
  id: number;
  user_id: number;
  points_type: string | null;
  points_num: number | null;
  log_type: number | null;
  log_content: string | null;
  related_id: string | null;
  ctime: number | null;
  utime: number | null;
}

// 创建时的可选属性
interface PointsLogCreationAttributes extends Optional<PointsLogAttributes, 'id'> {}

// 积分记录模型类
class PointsLog extends Model<PointsLogAttributes, PointsLogCreationAttributes> implements PointsLogAttributes {
  public id!: number;
  public user_id!: number;
  public points_type!: string | null;
  public points_num!: number | null;
  public log_type!: number | null;
  public log_content!: string | null;
  public related_id!: string | null;
  public ctime!: number | null;
  public utime!: number | null;
}

// 初始化模型
PointsLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    points_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '1增加 2减少',
    },
    points_num: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    log_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '1订单充值 2每日赠送 11消耗:生成设计 12消耗:生成建议  98失败退回 99到期清零',
    },
    log_content: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    related_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '订单id 生成的id 退回的时候关联本表id',
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
    tableName: 'points_log',
    modelName: 'PointsLog',
  }
);

// 建立与User模型的关联
PointsLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

export default PointsLog; 