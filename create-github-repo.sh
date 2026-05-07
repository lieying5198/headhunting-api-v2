#!/bin/bash
# 创建 GitHub 仓库并推送的脚本

REPO_NAME="headhunting-api"
GITHUB_USER="lieying5198"
DESCRIPTION="猎头招聘管理系统 API 服务"

echo "创建 GitHub 仓库: $GITHUB_USER/$REPO_NAME"

# 使用 GitHub CLI 如果可用，否则使用 curl
if command -v gh &> /dev/null; then
    # 使用 GitHub CLI
    gh repo create "$REPO_NAME" --public --description "$DESCRIPTION"
else
    # 使用 curl 和 GitHub API
    curl -s -X POST "https://api.github.com/user/repos" \
      -H "Authorization: token $(git config user.token 2>/dev/null || echo '')" \
      -d "{\"name\":\"$REPO_NAME\",\"description\":\"$DESCRIPTION\",\"public\":true}" \
      2>/dev/null

    if [ $? -eq 0 ]; then
        echo "仓库创建成功！"
    else
        echo "请先在 https://github.com/new 手动创建仓库"
    fi
fi

echo ""
echo "更新 git remote URL..."
git remote set-url origin "git@github.com:$GITHUB_USER/$REPO_NAME.git"

echo "推送代码到 GitHub..."
git push -u origin main

echo ""
echo "完成后访问: https://github.com/$GITHUB_USER/$REPO_NAME"
