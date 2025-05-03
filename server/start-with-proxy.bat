@echo off
echo 正在使用代理启动服务...

REM 从.env文件中提取代理URL
for /f "tokens=2 delims==" %%a in ('findstr "PROXY_URL" .env') do (
    set PROXY_URL=%%a
)

REM 如果.env文件中没有PROXY_URL，则使用默认值
if "%PROXY_URL%"=="" (
    set PROXY_URL=http://127.0.0.1:7890
    echo 未在.env中找到PROXY_URL，使用默认代理: %PROXY_URL%
) else (
    echo 使用.env中配置的代理: %PROXY_URL%
)

REM 设置各种环境变量以确保代理正常工作
set HTTP_PROXY=%PROXY_URL%
set http_proxy=%PROXY_URL%
set HTTPS_PROXY=%PROXY_URL%
set https_proxy=%PROXY_URL%
set ENABLE_PROXY=true

echo 代理环境变量已设置:
echo HTTP_PROXY=%HTTP_PROXY%
echo HTTPS_PROXY=%HTTPS_PROXY%
echo ENABLE_PROXY=%ENABLE_PROXY%
echo.

echo 测试代理连接...
REM 测试代理是否可用
curl -s --connect-timeout 5 -x %PROXY_URL% https://www.google.com >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 代理连接测试成功！现在启动服务...
    echo.
    REM 启动服务
    npm run dev
) else (
    echo 代理连接测试失败！请检查以下可能的原因:
    echo 1. 代理软件是否已启动？
    echo 2. 代理地址和端口是否正确？
    echo 3. 代理软件是否能正常访问外网？
    echo.
    echo 您仍然可以尝试启动服务，但可能无法正常连接Google服务。
    echo 按任意键继续启动服务，或按Ctrl+C退出...
    pause >nul
    npm run dev
) 