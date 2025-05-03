# Google 认证设置指南

## 在 Google Cloud Console 创建认证凭据

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建一个新项目或选择现有项目
3. 导航到 API 和服务 → 凭据
4. 点击"创建凭据" → 选择 "OAuth 客户端 ID"
5. 应用类型选择 "Web 应用"
6. 填写应用名称（例如："花园网站认证"）
7. 添加已获授权的重定向 URI：`http://localhost:5000/api/auth/google/callback`（开发环境）或您的生产环境 URL
8. 点击"创建"按钮
9. 系统将生成客户端 ID 和客户端密钥

## 配置环境变量

在服务器根目录创建 `.env` 文件（如果尚不存在），添加以下内容：

```
# 服务器配置
PORT=5000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=garden_db
DB_USER=root
DB_PASSWORD=your_db_password

# JWT 配置
JWT_SECRET=generate_a_strong_random_secret_key

# Google OAuth 配置
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# 客户端URL
CLIENT_URL=http://localhost:3000
```

将 `your_google_client_id_here` 和 `your_google_client_secret_here` 替换为您从 Google Cloud Console 获取的实际值。

## 启用必要的 API

在 Google Cloud Console 中，您可能需要启用以下 API：

1. 导航到 API 和服务 → 库
2. 搜索并启用 "Google+ API" 或 "Google People API"（用于获取用户信息）

## 测试配置

配置完成后，您可以使用以下命令启动服务器：

```
npm start
```

然后访问前端登录页面，尝试使用 Google 账号登录。 