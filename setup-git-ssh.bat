@echo off
chcp 65001 >nul
echo ========================================
echo    GitHub SSH 配置傻瓜式教程
echo ========================================
echo.

echo 【步骤1】请输入你的 GitHub 邮箱，然后按回车：
echo （例如：your-email@example.com）
set /p email=
echo.

echo 【步骤2】请输入你的 GitHub 用户名，然后按回车：
echo （例如：lieying5198）
set /p username=
echo.

echo ========================================
echo    正在配置 Git...
echo ========================================
echo.

:: 设置 Git 全局配置
git config --global user.email "%email%"
git config --global user.name "%username%"

echo ✅ Git 用户名和邮箱配置完成！
echo.

echo ========================================
echo    正在检查/生成 SSH Key...
echo ========================================
echo.

:: 检查是否已有 SSH Key
if exist "%USERPROFILE%\.ssh\id_rsa.pub" (
    echo 发现已有 SSH Key！
    echo.
    echo 【重要】请复制下面的公钥内容，添加到 GitHub：
    echo.
    type "%USERPROFILE%\.ssh\id_rsa.pub"
    echo.
) else (
    echo 正在生成新的 SSH Key...
    ssh-keygen -t rsa -C "%email%" -f "%USERPROFILE%\.ssh\id_rsa" -N ""
    echo.
    echo ✅ SSH Key 生成成功！
    echo.
    echo 【重要】请复制下面的公钥内容，添加到 GitHub：
    echo.
    type "%USERPROFILE%\.ssh\id_rsa.pub"
    echo.
)

echo ========================================
echo    请按以下步骤添加 SSH Key 到 GitHub：
echo ========================================
echo.
echo 1. 打开浏览器访问：https://github.com/settings/keys
echo 2. 点击 "New SSH key"
echo 3. Title 随便填，例如：我的电脑
echo 4. Key 类型选择：Authentication Key
echo 5. 将上面显示的公钥内容 Ctrl+C 复制粘贴到 Key 框中
echo 6. 点击 "Add SSH key"
echo.
echo ========================================
echo    添加完成后，验证连接：
echo ========================================
echo.
echo 在命令行输入以下命令验证：
echo    ssh -T git@github.com
echo.
echo 如果显示 "Hi %username%!" 表示配置成功！
echo.
echo ========================================
echo    配置完成后，运行推送命令：
echo ========================================
echo.
echo 在项目目录执行：
echo    git add .
echo    git commit -m "feat: 猎头AI加油站 v1.0.0"
echo    git push -u origin master
echo.
echo 或者直接双击运行：push.bat
echo.
pause
