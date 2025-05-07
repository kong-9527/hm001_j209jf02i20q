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
import { sequelize } from './models';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import goodsRoutes from './routes/goodsRoutes';
import paymentRoutes from './routes/paymentRoutes';
import uploadRoutes from './routes/uploadRoutes';
import projectRoutes from './routes/projectRoutes';
import gardenDesignRoutes from './routes/gardenDesignRoutes';
import passport from './config/passport';
import checkEnvVariables from './utils/envCheck';

// 检查环境变量
checkEnvVariables();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors({
  origin: true, // 允许所有来源的请求，这样可以保证弹窗可以正常通信
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 配置Helmet，但允许内联脚本执行（使弹窗中的脚本能够执行）
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/goods', goodsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/garden-designs', gardenDesignRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 