# 客户端 Google 认证设置指南

## 配置环境变量

为了确保前端应用能够正确连接到后端 API，您需要设置环境变量。

1. 在 `client` 目录下创建一个名为 `.env.local` 的文件
2. 添加以下内容：

```
# API 服务器地址
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

如果您的后端 API 运行在不同的地址或端口，请相应地调整 URL。

## 测试 Google 登录

1. 确保后端服务器已经启动并正确配置了 Google 认证凭据
2. 启动前端开发服务器：

```
npm run dev
```

3. 访问登录页面: http://localhost:3000/signin
4. 点击"使用 Google 账号登录"按钮
5. 您将被重定向到 Google 登录页面
6. 登录成功后，您将被重定向回应用的仪表板页面

## 故障排除

如果您遇到与 Google 登录相关的问题，请检查：

1. 后端服务器控制台是否有错误信息
2. 浏览器控制台是否有错误信息
3. Google 认证凭据是否正确配置
4. 重定向 URI 是否与 Google Cloud Console 中配置的一致
5. 网络连接和跨域请求设置是否正确

## 生产环境配置

对于生产环境，您需要：

1. 更新 `.env.production` 文件中的 API URL
2. 在 Google Cloud Console 中添加生产环境的重定向 URI
3. 确保 CORS 设置正确允许前端域名访问后端 