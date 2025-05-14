import { Sequelize, Dialect } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 尝试加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 输出数据库配置相关信息
console.log('数据库配置模块加载...');
console.log('Node.js版本:', process.version);
console.log('工作目录:', process.cwd());

// 检查pg包文件是否存在
const pgPackagePath = path.resolve(process.cwd(), 'node_modules/pg/package.json');
if (fs.existsSync(pgPackagePath)) {
  try {
    const pgPackage = JSON.parse(fs.readFileSync(pgPackagePath, 'utf-8'));
    console.log('找到pg包，版本:', pgPackage.version);
  } catch (e) {
    console.error('读取pg包信息时出错:', e);
  }
} else {
  console.error('警告: pg包文件不存在于:', pgPackagePath);
}

// 检查是否存在必要的数据库包
try {
  const pg = require('pg');
  console.log('成功加载 pg 包，版本:', pg.version);
} catch (err) {
  console.error('严重错误: pg 包未正确加载:', err);
  
  // 尝试查看pg模块是否存在
  try {
    const pgPath = path.resolve(process.cwd(), 'node_modules/pg');
    const pgExists = fs.existsSync(pgPath);
    console.error('pg模块目录是否存在:', pgExists);
    
    if (pgExists) {
      // 列出pg目录下的文件
      const files = fs.readdirSync(pgPath);
      console.error('pg目录下的文件:', files);
    }
  } catch (e) {
    console.error('检查pg目录时出错:', e);
  }
  
  // 退出进程，强制停止服务
  console.error('无法继续: 缺少pg包，数据库连接将无法建立');
  process.exit(1);
}

// 为 Vercel 部署设置默认值
const dbDialect = process.env.DB_DIALECT || 'postgres';
const dbName = process.env.DB_NAME || 'vercel_demo_db';
const dbUser = process.env.DB_USER || 'default_user';
const dbPassword = process.env.DB_PASSWORD || 'default_password';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432');

console.log(`数据库配置: 类型=${dbDialect}, 主机=${dbHost}, 端口=${dbPort}, 数据库=${dbName}`);

// 数据库连接配置
const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    dialect: dbDialect as Dialect,
    port: dbPort,
    timezone: '+08:00', // 中国时区
    define: {
      timestamps: false, // 禁用默认时间戳
      freezeTableName: true // 表名不复数
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // 为 SSL 连接添加额外选项 (用于 Vercel)
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

export default sequelize;
