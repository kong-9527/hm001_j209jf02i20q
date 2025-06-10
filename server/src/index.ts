// 加载环境变量 - 必须在其他导入之前
import dotenv from 'dotenv';
import path from 'path';

// 显示当前工作目录
console.log('当前工作目录:', process.cwd());

// 明确指定 .env 文件的路径
const envPath = path.resolve(process.cwd(), '.env');
console.log('尝试加载 .env 文件:', envPath);

// 加载环境变量
dotenv.config({ path: envPath });

// 输出版本信息
console.log('Node.js 版本:', process.version);
console.log('操作系统:', process.platform, process.arch);

// 设置HTTP代理（必须在其他网络请求之前）
import setupProxy from './config/httpProxy';
const proxyEnabled = setupProxy();
if (proxyEnabled) {
  console.log('全局HTTP代理已启用');
}

// 直接打印一些环境变量值（不显示敏感信息）
console.log('环境变量检查:');
console.log('GOOGLE_CLIENT_ID 是否设置:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET 是否设置:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('JWT_SECRET 是否设置:', !!process.env.JWT_SECRET);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { sequelize, dbConnectionStatus, initializeDatabase } from './models';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import goodsRoutes from './routes/goodsRoutes';
import paymentRoutes from './routes/paymentRoutes';
import uploadRoutes from './routes/uploadRoutes';
import projectRoutes from './routes/projectRoutes';
import gardenDesignRoutes from './routes/gardenDesignRoutes';
import gardenAdvisorRoutes from './routes/gardenAdvisorRoutes';
import passport from './config/passport';
import checkEnvVariables from './utils/envCheck';
import customStyleRoutes from './routes/customStyleRoutes';

// 检查环境变量
checkEnvVariables();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS配置
const allowedOrigins = [
  'https://www.aigardendesign.org',  // 生产环境前端域名
  'http://localhost:3000',              // 开发环境前端地址
];

// 中间件
const corsOptions = process.env.NODE_ENV === 'production' 
  ? {
      // 生产环境使用更宽松的CORS配置
      origin: true, // 允许所有域
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Set-Cookie'],
      maxAge: 86400
    }
  : {
      // 开发环境使用严格的CORS配置
      origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        // 允许没有origin的请求（比如移动端APP）
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Set-Cookie'],
      maxAge: 86400
    };

app.use(cors(corsOptions));

// 配置Helmet，但允许内联脚本执行（使弹窗中的脚本能够执行）
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL as string],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 添加服务器状态检查端点
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    server: 'running',
    env: process.env.NODE_ENV,
    db_connected: dbConnectionStatus.connected,
    db_error: dbConnectionStatus.error ? dbConnectionStatus.error.message : null,
    time: new Date().toISOString()
  });
});

// 强制要求数据库连接成功，立即执行数据库连接并等待结果
(async () => {
  console.log('正在连接数据库...');
  
  try {
    // 确保数据库连接成功
    await sequelize.authenticate();
    console.log('数据库连接成功 ✅');
    
    // 为了在出现问题时抛出异常，我们先尝试一个查询
    await sequelize.query('SELECT 1+1 AS result');
    console.log('数据库查询测试成功 ✅');
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
    
  } catch (error) {
    console.error('致命错误: 数据库连接失败:', error);
    
    // 输出环境变量配置（不包含敏感信息）
    console.error('数据库配置信息:');
    console.error('- DB_DIALECT:', process.env.DB_DIALECT);
    console.error('- DB_HOST:', process.env.DB_HOST);
    console.error('- DB_PORT:', process.env.DB_PORT);
    console.error('- DB_NAME:', process.env.DB_NAME);
    console.error('- DB_USER 是否设置:', !!process.env.DB_USER);
    
    // 检查pg包是否正确安装
    try {
      const pg = require('pg');
      console.error('pg 版本:', pg.version);
    } catch (e) {
      console.error('pg 包安装错误:', e);
    }
    
    // 抛出异常终止程序
    throw new Error('数据库连接失败，终止服务启动');
  }
})();

// 路由
app.get('/', (req, res) => {
  res.send('花园网站 API 服务正在运行');
});

// API 路由
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/goods', goodsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/garden-designs', gardenDesignRoutes);
app.use('/api/custom-styles', customStyleRoutes);
app.use('/api/garden-advisors', gardenAdvisorRoutes);

module.exports = app;