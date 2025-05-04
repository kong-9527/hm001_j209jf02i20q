/**
 * 环境变量检查工具
 * 用于调试环境变量是否正确加载
 */

export const checkEnvVariables = () => {
  const requiredVariables = [
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'CREEM_API_KEY'
  ];

  let missingVariables = 0;

  requiredVariables.forEach(variable => {
    if (!process.env[variable]) {
      console.warn(`警告: 环境变量 ${variable} 未设置`);
      missingVariables++;
    }
  });

  if (missingVariables > 0) {
    console.warn(`总共有 ${missingVariables} 个必需的环境变量未设置。请检查.env文件或系统环境变量配置。`);
  }
};

export default checkEnvVariables;