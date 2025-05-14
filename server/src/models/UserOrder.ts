import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Goods from './Goods';

// 定义用户订单表的接口
interface UserOrderAttributes {
  id: number;
  related_id: string | null;
  user_id: number;
  goods_id: number | null;
  order_type: number;
  points_num: number | null;
  points_remain: number | null;
  member_start_date: Date | null;
  member_end_date: Date | null;
  ctime: number | null;
  utime: number | null;
}

// 创建时的可选属性
interface UserOrderCreationAttributes extends Optional<UserOrderAttributes, 'id'> {}

// 用户订单模型类
class UserOrder extends Model<UserOrderAttributes, UserOrderCreationAttributes> implements UserOrderAttributes {
  public id!: number;
  public related_id!: string | null;
  public user_id!: number;
  public goods_id!: number | null;
  public order_type!: number;
  public points_num!: number | null;
  public points_remain!: number | null;
  public member_start_date!: Date | null;
  public member_end_date!: Date | null;
  public ctime!: number | null;
  public utime!: number | null;
}

// 初始化模型
UserOrder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    related_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    goods_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '1免费234档付费',
    },
    order_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '1订单 2每日赠送 9其他',
    },
    points_num: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    points_remain: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    member_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    member_end_date: {
      type: DataTypes.DATE,
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
    tableName: 'user_order',
    modelName: 'UserOrder',
  }
);

// 建立与User模型的关联
UserOrder.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// 建立与Goods模型的关联
UserOrder.belongsTo(Goods, {
  foreignKey: 'goods_id',
  as: 'goods',
});

const currentDate = new Date();
console.log('服务器当前时间:', currentDate.toISOString());
console.log('本地格式时间:', currentDate.toLocaleString());
// 创建一个只包含日期部分的新日期对象
const dateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
console.log('只包含日期的时间对象:', dateOnly.toISOString().split('T')[0]);

export default UserOrder; 