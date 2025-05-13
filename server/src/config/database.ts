import { Sequelize, Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 检查和记录数据库配置
console.log('数据库配置检查:');
console.log('DB_NAME 是否设置:', !!process.env.DB_NAME);
console.log('DB_USER 是否设置:', !!process.env.DB_USER);
console.log('DB_HOST 是否设置:', !!process.env.DB_HOST);
console.log('DB_DIALECT 是否设置:', !!process.env.DB_DIALECT);

// 数据库连接配置（针对Serverless环境优化）
const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST as string,
    dialect: (process.env.DB_DIALECT || 'postgres') as Dialect,
    port: parseInt(process.env.DB_PORT as string) || 6543,
    timezone: '+08:00', // 中国时区
    define: {
      timestamps: false, // 禁用默认时间戳
      freezeTableName: true // 表名不复数
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // Serverless环境优化设置
    pool: {
      max: 2, // 减小连接池大小，适合Serverless环境
      min: 0, // 最小为0，不保持连接
      acquire: 30000, // 获取连接的超时时间
      idle: 10000 // 空闲连接的超时时间
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// 错误处理：添加连接错误处理
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功.');
  })
  .catch(err => {
    console.error('无法连接到数据库:', err);
    
    // 如果是pg包相关错误，提供更清晰的提示
    if (err.message && err.message.includes('install pg')) {
      console.error('请确保pg包已正确安装，可在服务器目录运行: npm install pg --save');
    }
  });

export default sequelize;
