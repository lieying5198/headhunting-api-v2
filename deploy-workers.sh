#!/bin/bash
cd "C:/Users/lieying/WorkBuddy/2026-05-07-task-2"
echo "🚀 开始部署 Workers..."
echo "================================================"
npx wrangler deploy --env production
echo "================================================"
echo "部署完成!"
