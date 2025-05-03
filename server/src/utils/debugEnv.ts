// 环境变量调试脚本
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

console.log('当前工作目录:', process.cwd());
const envPath = path.resolve(process.cwd(), '.env');
console.log('尝试读取的 .env 文件路径:', envPath);

// 检查文件是否存在
if (fs.existsSync(envPath)) {
  console.log('文件存在!');
  
  // 尝试读取文件内容
  try {
    const fileContent = fs.readFileSync(envPath, 'utf8');
    console.log('文件内容长度:', fileContent.length);
    console.log('文件内容前50个字符:', fileContent.substring(0, 50));
  } catch (error) {
    console.error('无法读取文件:', error);
  }
} else {
  console.error('文件不存在!');
}

// 加载环境变量
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('加载 .env 文件时出错:', result.error);
} else {
  console.log('成功加载 .env 文件');
}

// 检查环境变量
console.log('\n===== 环境变量值 =====');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '(已设置)' : '(未设置)');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '(已设置)' : '(未设置)');
console.log('PORT:', process.env.PORT);
console.log('=====================\n');

// 导出函数以便可以导入
export const debugEnv = () => {
  console.log('环境变量调试函数被调用');
};

export default debugEnv; 