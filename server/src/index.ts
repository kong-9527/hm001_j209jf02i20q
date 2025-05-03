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

// 直接打印一些环境变量值（不显示敏感信息）
console.log('环境变量检查:');
console.log('GOOGLE_CLIENT_ID 是否设置:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET 是否设置:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('JWT_SECRET 是否设置:', !!process.env.JWT_SECRET);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { sequelize } from './models';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import passport from './config/passport';
import checkEnvVariables from './utils/envCheck';

// 检查环境变量
checkEnvVariables();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

// 路由
app.get('/', (req, res) => {
  res.send('花园网站 API 服务正在运行');
});

// API 路由
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 