# 花园网站服务端

## 项目设置

### 安装依赖
```bash
npm install
```

### 配置环境变量
创建 `.env` 文件，参考以下内容：

```
# 服务器配置
PORT=5000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=garden_db
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Google OAuth配置
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Cloudinary配置 (图片上传)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# 其他配置
CLIENT_URL=http://localhost:3000
```

### 数据库配置
确保您已经在本地 MySQL 数据库中创建了 `user` 表，表结构如下：

```sql
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `register_type` int DEFAULT NULL COMMENT '1自由注册2google',
  `nick_name` varchar(255) DEFAULT NULL,
  `head_pic` varchar(255) DEFAULT NULL,
  `points` varchar(255) DEFAULT NULL,
  `ctime` int DEFAULT NULL,
  `utime` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## 运行服务器

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 运行生产版本
```bash
npm start
```

## API 端点

### 用户 API

- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取指定 ID 的用户
- `POST /api/users` - 创建新用户

### 创建用户请求示例

```json
{
  "email": "user@example.com",
  "password": "password123",
  "nick_name": "用户昵称",
  "register_type": 1
}
```

## 环境变量配置

本项目需要配置以下环境变量，请在项目根目录创建`.env`文件：

```
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

# Cloudinary配置 (图片上传)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# 其他配置
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Cloudinary配置

1. 注册[Cloudinary](https://cloudinary.com/)账号
2. 登录后在控制面板获取云名称、API密钥和API密钥
3. 将这些值添加到`.env`文件中 