#!/bin/bash
# 快速修复 KV ID 的脚本

echo "🔍 检查现有 KV 命名空间..."
KV_LIST=$(wrangler kv:namespace list 2>&1)

if echo "$KV_LIST" | grep -q "HEADHUNTING"; then
    echo "✅ 找到现有 KV 命名空间："
    echo "$KV_LIST" | grep "HEADHUNTING" -A 1
    
    # 尝试提取 ID
    KV_ID=$(echo "$KV_LIST" | grep -A 1 "HEADHUNTING" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
    
    if [ -n "$KV_ID" ]; then
        echo ""
        echo "📝 KV ID: $KV_ID"
        echo "📝 正在更新 wrangler.toml..."
        
        # 备份
        cp wrangler.toml wrangler.toml.bak2
        
        # 替换 id = "" 或 id = "xxx"
        sed -i 's/^id = "[^"]*"/id = "'"$KV_ID"'"/' wrangler.toml
        
        echo "✅ wrangler.toml 已更新！"
        echo ""
        echo "当前配置："
        grep -A 2 "kv_namespaces" wrangler.toml
    else
        echo "❌ 无法解析 KV ID，请手动查看："
        echo "$KV_LIST"
    fi
else
    echo "⚠️  未找到 KV 命名空间，将创建新的..."
    wrangler kv:namespace create "HEADHUNTING_CACHE"
fi
