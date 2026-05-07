#!/bin/bash
# Git SSH 推送脚本

echo "=== Git SSH Push Script ==="
echo ""

cd "C:\Users\lieying\WorkBuddy\2026-05-07-task-2"

echo "1. Current remote configuration:"
git remote -v
echo ""

echo "2. Switching to SSH URL..."
git remote set-url origin git@github.com:lieying5198/headhunting-power-station.git
echo ""

echo "3. New remote configuration:"
git remote -v
echo ""

echo "4. Pushing to remote..."
git push -u origin master

echo ""
echo "=== Done ==="
