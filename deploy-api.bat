@echo off
chcp 65001 >nul
cd /d "C:\Users\lieying\WorkBuddy\2026-05-07-task-2"

echo ==============================================
echo   部署 Cloudflare Workers
echo ==============================================
echo.

npx wrangler deploy --env production

echo.
echo ==============================================
echo   部署完成！
echo ==============================================
pause
