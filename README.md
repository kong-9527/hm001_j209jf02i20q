# 花园网站

这是一个使用Node.js和TypeScript构建的全栈花园网站项目。

## 技术栈

### 前端
- Next.js
- React
- TypeScript
- Tailwind CSS

### 后端
- Node.js
- Express
- TypeScript
- MongoDB

## 项目结构

```
/
├── client/           # 前端项目
│   ├── app/          # Next.js 应用
│   │   ├── components/  # 可复用组件
│   │   ├── lib/      # 实用工具和函数
│   │   └── pages/    # 页面组件
│   └── public/       # 静态资源
└── server/           # 后端项目
    └── src/          # 源代码
        ├── config/       # 配置文件
        ├── controllers/  # 控制器
        ├── middleware/   # 中间件
        ├── models/       # 数据模型
        └── routes/       # 路由
```

## 开始使用

### 安装依赖

```bash
npm run install-all
```

### 开发模式

```bash
# 启动前端和后端
npm run dev

# 仅启动前端
npm run client

# 仅启动后端
npm run server
```

### 构建项目

```bash
cd client && npm run build
cd server && npm run build
``` 