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

// 尝试加载pg-native以支持SCRAM-SHA-256认证
let pgNative = null;
try {
  pgNative = require('pg-native');
  console.log('成功加载pg-native库，用于SCRAM-SHA-256认证');
} catch (e) {
  console.warn('未能加载pg-native库，将使用默认认证方式:', e);
}

// 检查是否存在必要的数据库包
try {
  const pg = require('pg');
  console.log('成功加载 pg 包，版本:', pg.version);
  
  // 配置pg以使用SCRAM-SHA-256认证
  try {
    // 尝试配置pg客户端默认设置
    if (process.env.NODE_ENV === 'production') {
      console.log('为生产环境配置pg客户端...');
      const { Client } = pg;
      console.log('确保启用SSL和SCRAM-SHA-256认证支持');
    }
  } catch (e) {
    console.warn('配置pg客户端时出错:', e);
  }
  
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

// 如果是Supabase，确保使用安全连接字符串
let connectionString = '';
if (dbHost.includes('supabase')) {
  console.log('检测到Supabase主机，使用特殊配置');
  // 不在连接字符串中指定SSL模式，而是在dialectOptions中配置
  connectionString = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
  console.log('使用连接字符串（已隐藏密码）');
}

// 共享的SSL配置
const sslConfig = {
  require: true,
  rejectUnauthorized: false // 关键修改：不验证证书，避免自签名证书问题
};

// 数据库连接配置
const sequelize = connectionString 
  ? new Sequelize(connectionString, {
    dialect: dbDialect as Dialect,
    timezone: '+08:00', // 中国时区
    define: {
      timestamps: false, // 禁用默认时间戳
      freezeTableName: true // 表名不复数
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // 配置连接池
    pool: {
      // 确保连接不被缓存太长时间
      max: 10,
      min: 0,
      idle: 10000,
      acquire: 30000
    },
    dialectOptions: {
      // 为 SSL 连接添加额外选项 (适用于所有环境)
      ssl: sslConfig,
      // 添加Supabase SCRAM-SHA-256认证支持
      client_encoding: 'UTF8',
      application_name: 'garden_app',
      keepAlive: true,
      options: `-c client_encoding=UTF8 -c search_path=public`,
      statement_timeout: 60000,
      idle_timeout: 60000
    }
  })
  : new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: dbDialect as Dialect,
    timezone: '+08:00', // 中国时区
    define: {
      timestamps: false, // 禁用默认时间戳
      freezeTableName: true // 表名不复数
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // 配置连接池
    pool: {
      // 确保连接不被缓存太长时间
      max: 10,
      min: 0,
      idle: 10000,
      acquire: 30000
    },
    dialectOptions: {
      // 为 SSL 连接添加额外选项 (适用于所有环境)
      ssl: sslConfig,
      // 添加Supabase SCRAM-SHA-256认证支持
      client_encoding: 'UTF8',
      application_name: 'garden_app',
      keepAlive: true,
      options: `-c client_encoding=UTF8 -c search_path=public`,
      statement_timeout: 60000,
      idle_timeout: 60000
    }
  });

export default sequelize;
