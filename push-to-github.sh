#!/bin/bash
cd "C:/Users/lieying/WorkBuddy/2026-05-07-task-2"

# 检查当前分支
echo "=== 当前分支 ==="
git branch --show-current

# 检查远程仓库
echo ""
echo "=== 远程仓库 ==="
git remote -v

# 查看是否有待提交内容
echo ""
echo "=== 待提交内容 ==="
git status --short

# 添加所有文件
git add .

# 提交（如果有待提交内容）
if [ -n "$(git status --short)" ]; then
    echo ""
    echo "=== 提交代码 ==="
    git commit -m "feat: 猎头AI加油站 v1.0.0"
else
    echo ""
    echo "没有新的提交内容"
fi

# 检查远程是否有 main 分支
echo ""
echo "=== 远程分支 ==="
git branch -r

# 推送 - 优先推送 master，如果远程是 main 则用 main
echo ""
echo "=== 推送代码 ==="
if git ls-remote --heads origin main | grep -q "main"; then
    echo "远程有 main 分支，使用 main"
    git push -u origin HEAD:main
else
    echo "远程没有 main 分支，使用 master"
    git push -u origin master
fi

echo ""
echo "=== 完成 ==="
