@echo off
chcp 65001 >nul
echo ==========================================
echo   GitHub 仓库创建和推送向导
echo ==========================================
echo.
echo 第一步：请在浏览器中打开以下链接创建仓库：
echo.
echo   https://github.com/new
echo.
echo   填写信息：
echo   - Repository name: headhunting-api
echo   - Description: 猎头招聘管理系统 API 服务
echo   - Public (公开)
echo   - 不要勾选任何初始化选项
echo.
echo 创建仓库后，按 Enter 继续...
pause >nul

echo.
echo 第二步：更新 Git remote URL 为正确用户名...
git remote set-url origin git@github.com:lieying5198/headhunting-api.git

echo.
echo 第三步：推送代码到 GitHub...
git push -u origin main

echo.
echo ==========================================
echo 完成！请访问: https://github.com/lieying5198/headhunting-api
echo ==========================================
pause
