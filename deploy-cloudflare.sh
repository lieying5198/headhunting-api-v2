#!/bin/bash
# Cloudflare Workers 后端部署脚本
# 使用方法: bash deploy-cloudflare.sh

set -e

echo "=============================================="
echo "  猎头能量站 - Cloudflare Workers 部署脚本"
echo "=============================================="
echo ""

# 检查wrangler
echo "📦 检查 Wrangler CLI..."
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler 未安装，正在安装..."
    npm install -g wrangler
else
    echo "✅ Wrangler 已安装: $(wrangler --version)"
fi
echo ""

# 检查登录状态
echo "🔐 检查 Cloudflare 登录状态..."
WRANGLER_LOGGED_IN=$(wrangler whoami 2>/dev/null || echo "NOT_LOGGED_IN")
if [ "$WRANGLER_LOGGED_IN" = "NOT_LOGGED_IN" ]; then
    echo "⚠️  未登录 Cloudflare，正在打开登录页面..."
    wrangler login
    echo "✅ 登录成功！"
else
    echo "✅ 已登录 Cloudflare"
    echo "$WRANGLER_LOGGED_IN"
fi
echo ""

# 项目目录（支持 Git Bash 和 Unix 环境）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 创建D1数据库
echo "🗄️  创建 D1 数据库..."
echo "如果已存在数据库，请使用已存在的名称或先删除"
echo ""
D1_OUTPUT=$(wrangler d1 create headhunting-db 2>&1 || echo "")
if echo "$D1_OUTPUT" | grep -q "database_id"; then
    D1_ID=$(echo "$D1_OUTPUT" | grep -o '"database_id": "[^"]*"' | cut -d'"' -f4)
    echo "✅ D1 数据库创建成功！"
    echo "   Database ID: $D1_ID"
    
    # 更新 wrangler.toml
    echo ""
    echo "📝 更新 wrangler.toml..."
    sed -i.bak "s/database_id = \"your-database-id\"/database_id = \"$D1_ID\"/" wrangler.toml
    echo "✅ wrangler.toml 已更新"
else
    echo "⚠️  D1数据库可能已存在，请检查或手动获取ID"
    echo "   运行: wrangler d1 list 查看现有数据库"
fi
echo ""

# 创建KV命名空间
echo "💾 创建 KV 命名空间..."

# 先检查是否已存在
KV_LIST=$(wrangler kv:namespace list 2>&1 || echo "[]")
KV_EXISTS=$(echo "$KV_LIST" | grep -o '"title": "[^"]*"' | grep "HEADHUNTING_CACHE" || echo "")

if [ -n "$KV_EXISTS" ]; then
    echo "⚠️  KV 命名空间已存在，正在获取ID..."
    KV_ID=$(echo "$KV_LIST" | grep "HEADHUNTING_CACHE" | grep -o '"id": "[^"]*"' | cut -d'"' -f4 | head -1)
    echo "✅ 找到现有 KV 命名空间"
    echo "   KV ID: $KV_ID"
else
    echo "📝 创建新的 KV 命名空间..."
    KV_OUTPUT=$(wrangler kv:namespace create "HEADHUNTING_CACHE" 2>&1)
    
    if echo "$KV_OUTPUT" | grep -q '"id"'; then
        # wrangler 4.x 输出格式: {"id":"xxx","title":"xxx-HEADHUNTING_CACHE"}
        KV_ID=$(echo "$KV_OUTPUT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        echo "✅ KV 命名空间创建成功！"
        echo "   KV ID: $KV_ID"
    else
        echo "❌ KV 创建失败，输出："
        echo "$KV_OUTPUT"
        echo ""
        echo "请手动运行: wrangler kv:namespace create HEADHUNTING_CACHE"
        exit 1
    fi
fi

# 更新 wrangler.toml
if [ -n "$KV_ID" ]; then
    # 替换空的 id = "" 或已存在的 id
    sed -i.bak 's/id = ""/id = "'"$KV_ID"'"/' wrangler.toml
    # 如果上面没替换到（已经有ID），则强制替换整行
    sed -i.bak 's/^id = "[^"]*"/id = "'"$KV_ID"'"/' wrangler.toml
    echo "✅ wrangler.toml 已更新 (KV ID: $KV_ID)"
else
    echo "❌ 无法获取 KV ID"
    exit 1
fi
echo ""

# 执行数据库初始化
echo "🗃️  执行数据库初始化..."
echo "正在运行 schema.sql..."
wrangler d1 execute headhunting-db --file=./database/schema.sql --local=false
echo "✅ 数据库初始化完成！"
echo ""

# 部署
echo "🚀 开始部署 Workers..."
echo ""
wrangler deploy
echo ""

# 获取部署结果
echo ""
echo "=============================================="
echo "  部署完成！"
echo "=============================================="
echo ""
echo "📍 你的 API 地址可能是:"
echo "   https://headhunting-api.<你的Cloudflare用户名>.workers.dev"
echo ""
echo "请运行以下命令确认实际地址:"
echo "   wrangler deployments list"
echo ""
echo "然后将地址填入 website/app.js 第7行:"
echo "   const API_BASE = 'https://你的实际地址.workers.dev';"
echo ""
echo "=============================================="
