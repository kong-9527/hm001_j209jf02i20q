import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 初始化Cloudinary配置
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary; 