@echo off
REM Cloudflare Workers 快速部署脚本 (Windows)

echo =====================================
echo  Cloudflare Workers 部署脚本
echo =====================================

REM 检查 .dev.vars 是否存在
if not exist .dev.vars (
    echo.
    echo [!] .dev.vars 文件不存在，正在创建...
    if exist .dev.vars.example (
        copy .dev.vars.example .dev.vars
        echo [+] 已创建 .dev.vars 文件
        echo.
        echo [!] 请编辑 .dev.vars 文件，填入你的 CLOUDFLARE_API_TOKEN
        echo    然后重新运行此脚本
        pause
        exit /b 1
    ) else (
        echo [!] .dev.vars.example 也不存在！
        pause
        exit /b 1
    )
)

REM 检查 API Token 是否已配置
findstr /C:"your_api_token_here" .dev.vars >nul 2>&1
if %errorlevel%==0 (
    echo.
    echo [!] 请先编辑 .dev.vars，填入真实的 CLOUDFLARE_API_TOKEN
    pause
    exit /b 1
)

echo.
echo [+] 安装依赖...
call npm install

echo.
echo [+] 开始部署...
call npx wrangler deploy

echo.
echo =====================================
echo [OK] 部署完成！
echo =====================================
echo.
echo 访问你的 API：
echo    https://headhunting-api.your-subdomain.workers.dev
echo.
pause
