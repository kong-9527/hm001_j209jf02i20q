// 确保 PostgreSQL 依赖项正确安装
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('正在安装必要的数据库依赖...');
console.log('Node.js 版本:', process.version);
console.log('操作系统:', process.platform, process.arch);

// 检查package.json中是否已包含pg
let hasPgInDependencies = false;
try {
  const packageJsonPath = path.resolve(__dirname, 'package.json');
  console.log('检查package.json:', packageJsonPath);
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    hasPgInDependencies = !!(packageJson.dependencies && packageJson.dependencies.pg);
    console.log('package.json中pg依赖状态:', hasPgInDependencies);
  } else {
    console.log('package.json文件不存在');
  }
} catch (error) {
  console.error('读取package.json时出错:', error.message);
}

try {
  // 先清理node_modules/pg目录（如果存在）以避免部分安装问题
  const pgDir = path.resolve(__dirname, 'node_modules/pg');
  if (fs.existsSync(pgDir)) {
    console.log('发现旧的pg目录，正在删除...');
    try {
      if (process.platform === 'win32') {
        // Windows需要特殊处理
        execSync(`rd /s /q "${pgDir}"`, { stdio: 'inherit' });
      } else {
        execSync(`rm -rf "${pgDir}"`, { stdio: 'inherit' });
      }
      console.log('成功删除旧的pg目录');
    } catch (e) {
      console.error('无法删除旧的pg目录:', e.message);
    }
  }

  // 确保安装 pg 和 pg-hstore 包
  console.log('安装 PostgreSQL 驱动...');
  
  // 尝试先单独安装pg，这样可以确保它正确编译
  execSync('npm install pg@8.11.3 --no-save --verbose', { stdio: 'inherit' });
  console.log('pg包安装完成');
  
  // 然后安装pg-hstore
  execSync('npm install pg-hstore@2.3.4 --no-save --verbose', { stdio: 'inherit' });
  console.log('pg-hstore包安装完成');
  
  // 如果package.json中没有pg，则添加到dependencies
  if (!hasPgInDependencies) {
    console.log('将pg添加到package.json...');
    execSync('npm install pg@8.11.3 pg-hstore@2.3.4 --save --verbose', { stdio: 'inherit' });
  }
  
  // 检查 pg 是否正确安装
  try {
    const pg = require('pg');
    console.log('pg 包已成功加载✅ 版本:', pg.version);
  } catch (err) {
    console.error('WARNING: 无法加载 pg 包，尝试最后一次强制安装...');
    
    // 最后尝试强制安装
    execSync('npm install pg@8.11.3 --force --verbose', { stdio: 'inherit' });
    
    // 再次检查
    try {
      const pg = require('pg');
      console.log('pg 包最终加载成功✅ 版本:', pg.version);
    } catch (e) {
      console.error('ERROR: pg 包仍然无法加载，安装失败:', e.message);
      process.exit(1);
    }
  }
  
  console.log('数据库依赖项安装完成✅');
} catch (error) {
  console.error('安装数据库依赖时出错:', error.message);
  process.exit(1);
} 