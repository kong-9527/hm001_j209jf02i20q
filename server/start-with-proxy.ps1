# 设置代理环境变量
$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
$env:ENABLE_PROXY = "true"

Write-Host "代理环境变量已设置:" -ForegroundColor Green
Write-Host "HTTP_PROXY=$env:HTTP_PROXY"
Write-Host "HTTPS_PROXY=$env:HTTPS_PROXY"
Write-Host "ENABLE_PROXY=$env:ENABLE_PROXY"

# 启动服务
npm run dev 