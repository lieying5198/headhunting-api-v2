#!/bin/bash
# 快速部署脚本 - 仅部署不创建资源

cd "C:/Users/lieying/WorkBuddy/2026-05-07-task-2"

echo "========================================"
echo "  快速部署 API 到 Cloudflare Workers"
echo "========================================"

echo ""
echo "📦 正在部署..."
npx wrangler deploy

echo ""
echo "========================================"
echo "  部署完成！"
echo "========================================"
echo ""
echo "🌐 API 地址: https://headhunting-api.lieying5198.workers.dev"
echo ""
echo "测试端点:"
echo "  - 健康检查: https://headhunting-api.lieying5198.workers.dev/api/health"
echo "  - 统计数据: https://headhunting-api.lieying5198.workers.dev/api/public/stats"
echo "  - 首页数据: https://headhunting-api.lieying5198.workers.dev/api/public/home"
echo ""
