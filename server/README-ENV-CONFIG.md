# 环境变量配置指南

本文档说明如何设置应用所需的环境变量，特别是与支付相关的配置。

## 必要的环境变量

### 支付相关

- `CREEM_API_KEY`: Creem支付平台的API密钥，用于支付验证和签名生成。**此环境变量必须设置，否则支付功能将无法正常工作**。

## 安全注意事项

- **不要在代码中硬编码API密钥**：所有敏感信息应通过环境变量提供，而不是直接写在代码中。
- **保护您的API密钥**：API密钥等同于密码，泄露可能导致安全风险或未授权的接口调用。
- **定期轮换密钥**：考虑定期更新API密钥，减小潜在的安全风险。

## 设置方法

### 开发环境

1. 在项目根目录下创建`.env`文件:

```
# 支付配置
CREEM_API_KEY=your_creem_api_key_here
```

2. 确保`.env`文件已添加到`.gitignore`中，避免提交敏感信息到代码仓库。

### 生产环境

在生产服务器上，可以通过以下方式设置环境变量：

1. 直接在系统中设置环境变量:

```bash
# Linux/macOS
export CREEM_API_KEY=your_creem_api_key_here

# Windows (PowerShell)
$env:CREEM_API_KEY="your_creem_api_key_here"
```

2. 如果使用Docker部署，在`docker-compose.yml`中设置:

```yaml
version: '3'
services:
  app:
    # ... 其他配置 ...
    environment:
      - CREEM_API_KEY=your_creem_api_key_here
```

3. 如果使用云服务如Heroku、Vercel等，使用其平台的环境变量配置界面。

## 验证配置

启动应用时，系统会检查必要的环境变量是否存在。如果环境变量未设置，会在控制台输出警告信息，并且相关功能会停用或返回错误。

如果您看到类似"CREEM API密钥未设置"的警告，这意味着:
1. 环境变量没有正确设置
2. 支付功能将无法工作
3. 所有签名验证都将失败

请立即设置正确的环境变量以确保系统功能正常。

## 环境变量配置

本项目使用以下环境变量：

```env
# 数据库配置
DB_DIALECT=postgres
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=5432

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Google OAuth配置
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Cloudinary配置
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# 其他配置
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

请确保在开发和生产环境中正确设置这些环境变量。 