import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义商品表的接口
interface GoodsAttributes {
  id: number;
  goods_name: string | null;
  goods_month: number | null;
  during: number | null;
  price_original: number | null;
  price_pay: number | null;
}

// 创建时的可选属性
interface GoodsCreationAttributes extends Optional<GoodsAttributes, 'id'> {}

// 商品模型类
class Goods extends Model<GoodsAttributes, GoodsCreationAttributes> implements GoodsAttributes {
  public id!: number;
  public goods_name!: string | null;
  public goods_month!: number | null;
  public during!: number | null;
  public price_original!: number | null;
  public price_pay!: number | null;
}

// 初始化模型
Goods.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    goods_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    goods_month: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    during: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '天数',
    },
    price_original: {
      type: DataTypes.FLOAT(10, 2),
      allowNull: true,
    },
    price_pay: {
      type: DataTypes.FLOAT(10, 2),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'goods',
    modelName: 'Goods',
  }
);

export default Goods; 