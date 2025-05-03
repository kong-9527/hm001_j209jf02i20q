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