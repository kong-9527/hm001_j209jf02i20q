/**
 * 环境变量检查工具
 * 用于调试环境变量是否正确加载
 */

export const checkEnvVariables = () => {
  console.log('\n===== 环境变量检查 =====');
  console.log(`GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '已设置' : '未设置'}`);
  console.log(`GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '已设置' : '未设置'}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '已设置' : '未设置'}`);
  console.log(`PORT: ${process.env.PORT || '5000 (默认值)'}`);
  console.log('=========================\n');
};

export default checkEnvVariables;