@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║         猎头AI加油站 - Git 推送                     ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo 正在执行推送...
echo.

node push-to-github.js

echo.
pause
