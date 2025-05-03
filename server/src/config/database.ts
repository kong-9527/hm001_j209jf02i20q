import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 数据库连接配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'garden',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: parseInt(process.env.DB_PORT || '3306'),
    timezone: '+08:00', // 中国时区
    define: {
      timestamps: false, // 禁用默认时间戳
      freezeTableName: true // 表名不复数
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

export default sequelize;
