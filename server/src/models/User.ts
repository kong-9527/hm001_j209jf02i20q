import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 定义用户表的接口
interface UserAttributes {
  id: number;
  email: string;
  password: string | null;
  register_type: number | null; // 1自由注册2google
  nick_name: string | null;
  head_pic: string | null;
  points: string | null;
  ctime: number | null;
  utime: number | null;
  google_id: string | null; // 添加Google ID字段
}

// 创建时的可选属性
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// 用户模型类
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string | null;
  public register_type!: number | null;
  public nick_name!: string | null;
  public head_pic!: string | null;
  public points!: string | null;
  public ctime!: number | null;
  public utime!: number | null;
  public google_id!: string | null; // 添加Google ID字段
}

// 初始化模型
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    register_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '1自由注册2google',
    },
    nick_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    head_pic: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    points: {
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
    google_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Google授权ID',
    },
  },
  {
    sequelize,
    tableName: 'user', // 对应数据库中的表名
    modelName: 'User',
  }
);

export default User; 