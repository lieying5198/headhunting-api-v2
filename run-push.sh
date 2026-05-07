#!/bin/bash
cd "C:/Users/lieying/WorkBuddy/2026-05-07-task-2"

echo "========================================"
echo "推送 headhunting-api 到 GitHub"
echo "使用用户名: lieying5198"
echo "========================================"
echo ""

# 检查 Git 仓库是否存在
if [ ! -d ".git" ]; then
    echo "[错误] 当前目录不是 Git 仓库"
    echo "请先在项目目录执行: git init"
    exit 1
fi

# 检查 remote 是否已设置
if git remote get-url origin >/dev/null 2>&1; then
    echo "[步骤1] 更新 remote 为正确用户名..."
    git remote set-url origin git@github.com:lieying5198/headhunting-api.git
else
    echo "[步骤1] 添加 remote..."
    git remote add origin git@github.com:lieying5198/headhunting-api.git
fi

echo ""
echo "当前 remote URL:"
git remote get-url origin
echo ""

# 尝试创建仓库（如果已存在会报错，继续推送即可）
echo "[步骤2] 尝试创建 GitHub 仓库（如果已存在可忽略错误）..."
gh repo create headhunting-api --source=. --private --remote= 2>/dev/null || echo "仓库可能已存在，继续推送..."

echo ""
echo "[步骤3] 推送到 GitHub..."
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "推送成功！"
    echo "仓库地址: https://github.com/lieying5198/headhunting-api"
    echo "========================================"
else
    echo ""
    echo "[错误] 推送失败，请检查错误信息"
fi
