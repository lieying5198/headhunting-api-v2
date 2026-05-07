#!/bin/bash
cd "$(dirname "$0")"

echo "=========================================="
echo "  部署 Cloudflare Workers"
echo "=========================================="
echo ""

# 执行 wrangler 部署
npx wrangler deploy --env production

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
