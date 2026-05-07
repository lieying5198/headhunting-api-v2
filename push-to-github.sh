#!/bin/bash
echo "========================================"
echo "推送 headhunting-api 到 GitHub"
echo "用户名: lieying5198"
echo "========================================"
echo ""

# 检查 Git 状态
echo "[状态] 检查 Git 环境..."
if ! command -v git &> /dev/null; then
    echo "[错误] 未找到 Git，请先安装 Git"
    exit 1
fi

# 检查 Git 仓库
if [ ! -d ".git" ]; then
    echo "[步骤0] 初始化 Git 仓库..."
    git init
    git config user.name "lieying5198"
    git config user.email "lieying5198@users.noreply.github.com"
fi

# 设置正确的 remote
echo ""
echo "[步骤1] 设置 remote URL..."
git remote set-url origin git@github.com:lieying5198/headhunting-api.git
git remote -v

# 创建仓库
echo ""
echo "[步骤2] 创建 GitHub 仓库..."
gh repo create headhunting-api --source=. --private --remote= --confirm

echo ""
echo "[步骤3] 推送到 GitHub main 分支..."
git branch -M main
git push -u origin main --force

echo ""
echo "========================================"
echo "完成！"
echo "请访问: https://github.com/lieying5198/headhunting-api"
echo "========================================"
