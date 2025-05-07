import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

// 定义项目表的接口
interface ProjectAttributes {
  id: number;
  project_name: string | null;
  project_pic: string | null;
  user_id: number | null;
  ctime: number | null;
  utime: number | null;
}

// 创建时的可选属性
interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id'> {}

// 项目模型类
class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public project_name!: string | null;
  public project_pic!: string | null;
  public user_id!: number | null;
  public ctime!: number | null;
  public utime!: number | null;
}

// 初始化模型
Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    project_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    project_pic: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
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
    tableName: 'project',
    modelName: 'Project',
  }
);

// 建立关联关系
Project.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

export default Project; 