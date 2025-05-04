import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义支付订单表的接口
interface PayOrderAttributes {
  id: number;
  user_id: number | null;
  pay_num: string | null;
  platform: string | null;
  platform_num: string | null;
  platform_status: string | null;
  goods_id: number | null;
  goods_name: string | null;
  goods_month: number | null;
  price_type: number | null;
  price_original: number | null;
  price_pay: number | null;
  ctime: number | null;
  utime: number | null;
}

// 创建时的可选属性
interface PayOrderCreationAttributes extends Optional<PayOrderAttributes, 'id'> {}

// 支付订单模型类
class PayOrder extends Model<PayOrderAttributes, PayOrderCreationAttributes> implements PayOrderAttributes {
  public id!: number;
  public user_id!: number | null;
  public pay_num!: string | null;
  public platform!: string | null;
  public platform_num!: string | null;
  public platform_status!: string | null;
  public goods_id!: number | null;
  public goods_name!: string | null;
  public goods_month!: number | null;
  public price_type!: number | null;
  public price_original!: number | null;
  public price_pay!: number | null;
  public ctime!: number | null;
  public utime!: number | null;
}

// 初始化模型
PayOrder.init(
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
    pay_num: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '本站订单id',
    },
    platform: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '支付平台类型',
    },
    platform_num: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '支付平台流水号',
    },
    platform_status: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '支付平台的支付状态：0默认 1订单有效',
    },
    goods_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    goods_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    goods_month: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '1月付3季付12年付',
    },
    price_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '1美刀9其他币种',
    },
    price_original: {
      type: DataTypes.FLOAT(255, 2),
      allowNull: true,
      comment: '原价',
    },
    price_pay: {
      type: DataTypes.FLOAT(255, 2),
      allowNull: true,
      comment: '实际支付价格',
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
    tableName: 'pay_order',
    modelName: 'PayOrder',
  }
);

export default PayOrder; 