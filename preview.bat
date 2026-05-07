@echo off
chcp 65001 >nul
title 猎头AI加油站 - 本地预览

cd /d "%~dp0public"

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║         🦁 猎头AI加油站 - 本地预览                  ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo 正在启动本地服务器...
echo 访问地址: http://localhost:8080
echo 按 Ctrl+C 停止服务器
echo.

REM 尝试使用 Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [Python] 启动中...
    python -m http.server 8080
    goto :end
)

REM 尝试使用 Python3
where python3 >nul 2>&1
if %errorlevel% equ 0 (
    echo [Python3] 启动中...
    python3 -m http.server 8080
    goto :end
)

REM 尝试使用 Node.js http-server
where npx >nul 2>&1
if %errorlevel% equ 0 (
    echo [Node.js] 启动中...
    npx http-server . -p 8080 -c-1
    goto :end
)

echo.
echo ❌ 未找到可用的服务器软件
echo.
echo 请安装以下任一软件:
echo   1. Python: https://www.python.org/downloads/
echo   2. Node.js: https://nodejs.org/
echo.
pause

:end
pause
