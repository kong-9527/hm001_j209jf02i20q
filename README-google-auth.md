# Google 认证登录功能设置

## 概述

本项目已完成 Google 认证登录功能的实现，包括：

1. 用户可以使用 Google 账号登录系统
2. 新用户自动注册（使用 Google 邮箱和昵称）
3. 登录后重定向到仪表板页面
4. 用户认证状态持久化和令牌验证

## 关键文件

### 后端文件：

- `server/src/config/passport.ts` - Google 认证策略配置
- `server/src/controllers/authController.ts` - 处理认证回调和用户信息
- `server/src/routes/authRoutes.ts` - 认证相关路由
- `server/src/index.ts` - 入口文件，配置中间件和路由

### 前端文件：

- `client/app/services/authService.ts` - 与后端 API 交互的服务
- `client/app/signin/page.tsx` - 登录页面，包含 Google 登录按钮
- `client/app/dashboard/page.tsx` - 仪表板页面，展示用户信息

## 设置步骤

1. **安装依赖**：

```bash
# 后端依赖
cd server
npm install passport passport-google-oauth20 jsonwebtoken cookie-parser --save
npm install --save-dev @types/passport @types/passport-google-oauth20 @types/jsonwebtoken @types/cookie-parser

# 前端依赖
cd ../client
npm install axios --save
```

2. **获取 Google 认证凭据**：

详细步骤见 `server/google-auth-setup.md` 文件

- 访问 [Google Cloud Console](https://console.cloud.google.com/)
- 创建项目并获取 OAuth 客户端 ID 和密钥
- 配置授权的重定向 URI

3. **配置环境变量**：

后端环境变量（`server/.env`）：

```
# Google OAuth 配置
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT 配置
JWT_SECRET=your_jwt_secret_key

# 客户端URL
CLIENT_URL=http://localhost:3000
```

前端环境变量（`client/.env.local`）：

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **启动服务**：

```bash
# 启动后端
cd server
npm start

# 启动前端
cd ../client
npm run dev
```

## 流程说明

1. 用户点击"使用 Google 账号登录"按钮
2. 重定向到 Google 认证页面
3. 用户授权应用访问其账号信息
4. Google 重定向回应用的回调 URL
5. 后端验证用户，创建或获取用户信息
6. 生成 JWT 令牌并设置 Cookie
7. 重定向到仪表板页面
8. 前端验证用户状态并展示用户信息

## 故障排除

如果遇到问题，请参考：
- `client/google-auth-client-setup.md` - 前端设置指南
- `server/google-auth-setup.md` - 后端设置指南

## 注意事项

- 请确保 Google 认证凭据保密，不要将其提交到版本控制系统
- 在生产环境中使用 HTTPS 保护用户数据
- 定期更新依赖包以修复安全漏洞 