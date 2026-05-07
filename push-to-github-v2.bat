@echo off
chcp 65001 >nul
echo ========================================
echo 推送 headhunting-api 到 GitHub
echo 使用用户名: lieying5198
echo ========================================
echo.

REM 切换到项目目录
cd /d "%~dp0"

REM 检查 Git 仓库是否存在
if not exist ".git" (
    echo [错误] 当前目录不是 Git 仓库
    echo 请先在项目目录执行: git init
    pause
    exit /b 1
)

REM 检查 remote 是否已设置
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo [步骤1] 添加 remote...
    git remote add origin git@github.com:lieying5198/headhunting-api.git
) else (
    echo [步骤1] 更新 remote 为正确用户名...
    git remote set-url origin git@github.com:lieying5198/headhunting-api.git
)

echo.
echo 当前 remote URL:
git remote get-url origin
echo.

REM 尝试创建仓库（如果已存在会报错，继续推送即可）
echo [步骤2] 尝试创建 GitHub 仓库（如果已存在可忽略错误）...
gh repo create headhunting-api --source=. --private --remote= 2>nul || echo 仓库可能已存在，继续推送...

echo.
echo [步骤3] 推送到 GitHub...
git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo 推送成功！
    echo 仓库地址: https://github.com/lieying5198/headhunting-api
    echo ========================================
) else (
    echo.
    echo [错误] 推送失败，请检查错误信息
)

pause
