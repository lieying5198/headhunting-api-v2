@echo off
chcp 65001 >nul
title GitHub Pages 部署

echo ========================================
echo   猎头AI加油站 - GitHub Pages 部署
echo ========================================
echo.

set PROJECT=C:\Users\lieying\WorkBuddy\2026-05-07-task-2
set WEBSITE=%PROJECT%\website
set TEMP=%PROJECT%\.gh-temp
set REPO=git@github.com:lieying5198/headhunting-power-station.git

echo [1/7] 准备临时目录...
if exist "%TEMP%" rmdir /s /q "%TEMP%"
mkdir "%TEMP%"

echo [2/7] 复制 website 文件到临时目录...
xcopy "%WEBSITE%\*" "%TEMP%\" /s /e /y >nul
echo 创建 .nojekyll...
echo. > "%TEMP%\.nojekyll"

echo [3/7] 初始化 Git...
cd /d "%TEMP%"
git init
git config user.name "lieying"
git config user.email "lieying5198@users.noreply.github.com"

echo [4/7] 配置远程仓库...
git remote add origin %REPO%

echo [5/7] 添加文件并提交...
git add .
git commit -m "feat: 猎头AI加油站 v1.0.0 - GitHub Pages"
echo.

echo [6/7] 推送到 GitHub...
git push -u origin master --force

echo [7/7] 清理临时目录...
cd /d "%PROJECT%"
rmdir /s /q "%TEMP%"

echo.
echo ========================================
echo   部署完成!
echo ========================================
echo.
echo 下一步:
echo   1. 访问: https://github.com/lieying5198/headhunting-power-station
echo   2. Settings ^> Pages
echo   3. Source 选择 "master" 分支
echo   4. 等待 2-5 分钟
echo   5. 访问: https://lieying5198.github.io/headhunting-power-station
echo ========================================
pause
