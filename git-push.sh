#!/bin/bash
cd "C:/Users/lieying/WorkBuddy/2026-05-07-task-2"

# 添加所有文件到暂存区
git add .

# 检查暂存状态
echo "=== Git Status ==="
git status

# 提交
echo ""
echo "=== Git Commit ==="
git commit -m "feat: 猎头AI加油站 v1.0.0"

# 推送到远程仓库
echo ""
echo "=== Git Push ==="
git push -u origin main
