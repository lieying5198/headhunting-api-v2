#!/bin/bash
# Cloudflare Workers 快速部署脚本

echo "====================================="
echo "🚀 Cloudflare Workers 部署脚本"
echo "====================================="

# 检查 .dev.vars 是否存在
if [ ! -f .dev.vars ]; then
    echo ""
    echo "⚠️ .dev.vars 文件不存在，正在创建..."
    if [ -f .dev.vars.example ]; then
        cp .dev.vars.example .dev.vars
        echo "✅ 已创建 .dev.vars 文件"
        echo ""
        echo "📝 请编辑 .dev.vars 文件，填入你的 CLOUDFLARE_API_TOKEN"
        echo "   然后重新运行此脚本"
        exit 1
    else
        echo "❌ .dev.vars.example 也不存在！"
        exit 1
    fi
fi

# 检查 API Token 是否已配置
if grep -q "your_api_token_here" .dev.vars 2>/dev/null; then
    echo ""
    echo "⚠️ 请先编辑 .dev.vars，填入真实的 CLOUDFLARE_API_TOKEN"
    exit 1
fi

echo ""
echo "📦 安装依赖..."
npm install

echo ""
echo "🚀 开始部署..."
npx wrangler deploy

echo ""
echo "====================================="
echo "✅ 部署完成！"
echo "====================================="
echo ""
echo "🌐 访问你的 API："
echo "   https://headhunting-api.your-subdomain.workers.dev"
echo ""
echo "📊 查看部署状态："
echo "   npx wrangler deployments list"
