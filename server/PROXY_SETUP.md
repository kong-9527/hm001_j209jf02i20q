# HTTP代理设置指南

本文档介绍如何为服务器设置HTTP代理，以确保能够访问Google等国际服务。

## 启动顺序（重要）

正确的启动顺序如下：
1. 首先启动代理软件（如Clash, V2Ray, Shadowsocks等）
2. 确认代理已经正常运行
3. 然后再启动服务器应用

不正确的启动顺序可能导致Google认证服务无法正常工作。

## 快速启动（推荐方式）

我们提供了便捷的启动脚本，自动配置代理环境并启动服务：

### Windows PowerShell（推荐）

```
.\start-with-proxy.ps1
```

### Windows命令行（CMD）

```
start-with-proxy.bat
```

这些脚本会自动从.env文件获取代理配置，设置必要的环境变量，测试代理连接，然后启动服务。

## 配置方法

### 1. 创建或编辑.env文件

在服务器根目录下创建或编辑`.env`文件，添加以下代理设置：

```
# 代理设置 (用于访问Google等国际服务)
ENABLE_PROXY=true
PROXY_URL=http://127.0.0.1:7890
```

请将`127.0.0.1:7890`替换为您实际使用的代理地址和端口。常见的代理端口包括：
- Clash: 7890
- V2Ray: 10809
- Shadowsocks: 1080

### 2. 验证代理设置

启动服务器后，检查控制台输出，应该会看到如下信息：
```
使用代理: http://127.0.0.1:7890
全局HTTP代理已启用
```

### 3. 测试代理连接

在启动服务器前，可以测试代理是否正常工作：

```
# PowerShell
$env:HTTP_PROXY="http://127.0.0.1:7890"
curl -Uri https://www.google.com

# CMD
set HTTP_PROXY=http://127.0.0.1:7890
curl https://www.google.com
```

如果能够成功获取Google首页内容，说明代理工作正常。

## 手动启动服务器

如果不使用启动脚本，可以手动设置环境变量并启动服务：

```
# PowerShell
$env:HTTP_PROXY="http://127.0.0.1:7890"
$env:HTTPS_PROXY="http://127.0.0.1:7890"
$env:ENABLE_PROXY="true"
npm run dev
```

## 常见问题解决

1. **无法连接到代理**：确保您的代理服务已经启动，并且端口号正确。

2. **代理不工作**：尝试在命令行中测试代理：
   ```
   curl -x http://127.0.0.1:7890 https://www.google.com
   ```
   
3. **应用启动后才打开代理**：必须在应用启动前确保代理已经在运行，因为代理设置是在应用初始化时配置的。

## 代理软件推荐

- [Clash for Windows](https://github.com/Fndroid/clash_for_windows_pkg/releases)
- [V2rayN](https://github.com/2dust/v2rayN/releases)
- [Shadowsocks](https://github.com/shadowsocks/shadowsocks-windows/releases)

## 注意事项

- 代理设置会影响所有HTTP/HTTPS请求，包括对本地服务的请求。如果遇到连接本地服务的问题，请考虑设置不代理本地地址。
- 在生产环境中，通常不需要设置代理，应根据实际部署环境决定是否使用代理。 