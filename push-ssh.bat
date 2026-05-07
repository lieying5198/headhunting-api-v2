@echo off
chcp 65001 >nul
title Git Push to GitHub (SSH)

cd /d "C:\Users\lieying\WorkBuddy\2026-05-07-task-2"

echo === 检查 SSH Key ===
if not exist "%USERPROFILE%\.ssh\id_rsa" (
    echo [错误] 未找到 SSH Key！
    echo 请先运行 setup-git-ssh.bat 配置 SSH
    pause
    exit /b 1
)
echo ✅ SSH Key 已配置
echo.

echo === 检查 Git 状态 ===
git status --short
echo.

echo === 添加所有文件 ===
git add .
echo.

echo === 提交代码 ===
git commit -m "feat: 猎头AI加油站 v1.0.0"
echo.

echo === 检查远程仓库 (SSH) ===
git remote -v
echo.

echo === 推送代码 ===
git push -u origin master
echo.

echo === 完成 ===
pause
