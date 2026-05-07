#!/bin/bash
cd "C:/Users/lieying/WorkBuddy/2026-05-07-task-2"

echo "=== 检查远程仓库 ==="
git remote -v

echo ""
echo "=== 当前分支 ==="
git branch

echo ""
echo "=== 添加文件到暂存区 ==="
git add .

echo ""
echo "=== Git Status ==="
git status

echo ""
echo "=== Git Commit ==="
git commit -m "feat: 猎头AI加油站 v1.0.0"

echo ""
echo "=== Git Push ==="
git push -u origin master
