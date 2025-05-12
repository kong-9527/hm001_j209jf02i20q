import { Sequelize, Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 数据库连接配置
const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST as string,
    dialect: process.env.DB_DIALECT as Dialect,
    port: parseInt(process.env.DB_PORT as string),
    timezone: '+08:00', // 中国时区
    define: {
      timestamps: false, // 禁用默认时间戳
      freezeTableName: true // 表名不复数
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

export default sequelize;
