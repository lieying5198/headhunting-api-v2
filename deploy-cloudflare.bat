@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ==============================================
echo   猎头能量站 - Cloudflare Workers 部署脚本
echo ==============================================
echo.

REM 检查wrangler
echo [1/6] 检查 Wrangler CLI...
where wrangler >nul 2>&1
if errorlevel 1 (
    echo   Wrangler 未安装，正在安装...
    npm install -g wrangler
) else (
    for /f "delims=" %%v in ('wrangler --version 2^>nul') do set WRANGLER_VERSION=%%v
    echo   ✅ Wrangler 已安装: !WRANGLER_VERSION!
)
echo.

REM 检查登录状态
echo [2/6] 检查 Cloudflare 登录状态...
wrangler whoami >nul 2>&1
if errorlevel 1 (
    echo   ⚠️  未登录 Cloudflare，正在打开登录页面...
    echo   请在浏览器中完成登录，然后返回此窗口
    echo.
    start https://dash.cloudflare.com/
    wrangler login
) else (
    echo   ✅ 已登录 Cloudflare
    wrangler whoami
)
echo.

REM 切换到项目目录
cd /d "C:\Users\lieying\WorkBuddy\2026-05-07-task-2"
echo [3/6] 当前目录: %CD%
echo.

REM 创建D1数据库
echo [4/6] 创建 D1 数据库...
echo   如果数据库已存在，会返回已有信息
echo.
for /f "tokens=*" %%d in ('wrangler d1 create headhunting-db 2^>^&1') do set D1_OUTPUT=!D1_OUTPUT! %%d
echo !D1_OUTPUT!

REM 提取database_id
echo.
echo   请检查上方输出中的 database_id
echo   如果创建成功，应该能看到类似: "database_id": "xxxx-xxxx-xxxx"
echo.

REM 创建KV命名空间
echo [5/6] 创建 KV 命名空间...
for /f "tokens=*" %%k in ('wrangler kv:namespace create "HEADHUNTING_CACHE" 2^>^&1') do set KV_OUTPUT=!KV_OUTPUT! %%k
echo !KV_OUTPUT!

echo.
echo   请检查上方输出中的 id
echo   如果创建成功，应该能看到类似: "id": "xxxx-xxxx-xxxx"
echo.

REM 提示用户手动配置
echo ==============================================
echo   重要：请手动配置 wrangler.toml
echo ==============================================
echo.
echo   1. 打开 wrangler.toml 文件
echo   2. 找到 database_id = "your-database-id"
echo   3. 替换为实际的 D1 数据库 ID
echo   4. 找到 id = "your-kv-namespace-id"  
echo   5. 替换为实际的 KV 命名空间 ID
echo.

REM 询问是否继续
echo.
set /p CONTINUE="配置完成后按 Enter 继续部署，或输入 'q' 退出: "
if /i "%CONTINUE%"=="q" exit /b

REM 执行数据库初始化
echo.
echo [6/6] 执行数据库初始化...
echo.
set /p DB_ID="请输入 D1 数据库 ID (database_id): "
if not "%DB_ID%"=="" (
    echo   使用数据库 ID: %DB_ID%
    
    REM 更新 wrangler.toml
    powershell -Command "(Get-Content wrangler.toml) -replace 'database_id = \"your-database-id\"', 'database_id = \"%DB_ID%\"' | Set-Content wrangler.toml"
)

set /p KV_ID="请输入 KV 命名空间 ID (id): "
if not "%KV_ID%"=="" (
    echo   使用 KV ID: %KV_ID%
    powershell -Command "(Get-Content wrangler.toml) -replace 'id = \"your-kv-namespace-id\"', 'id = \"%KV_ID%\"' | Set-Content wrangler.toml"
)
echo.

REM 执行数据库初始化
echo   执行数据库 schema...
call wrangler d1 execute headhunting-db --file=./database/schema.sql --remote
echo   ✅ 数据库初始化完成！
echo.

REM 部署
echo.
echo ==============================================
echo   🚀 开始部署 Cloudflare Workers
echo ==============================================
echo.
call wrangler deploy
echo.

echo.
echo ==============================================
echo   部署完成！
echo ==============================================
echo.
echo   请运行以下命令确认 API 地址:
echo   wrangler deployments list
echo.
echo   然后将地址填入 website/app.js 第7行
echo.
pause
