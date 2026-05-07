#!/bin/bash
# 猎头AI加油站 - 快速部署脚本
# 运行前请确保已配置好 GitHub SSH

echo "╔══════════════════════════════════════════════════════╗"
echo "║         🦁 猎头AI加油站 - 快速部署                  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# 检查 GitHub SSH
echo "📡 检查 GitHub SSH 连接..."
if ssh -T git@github.com 2>/dev/null; then
    echo "✅ SSH 已配置"
else
    echo "❌ SSH 未配置，请先配置 SSH 密钥"
    echo "   参考: https://github.com/settings/keys"
    exit 1
fi

# 添加远程仓库
echo ""
echo "🔗 配置远程仓库..."
if ! git remote | grep -q origin; then
    git remote add origin git@github.com:lieying5198/headhunting-power-station.git
fi

# 确保 .github/workflows 目录存在
mkdir -p .github/workflows

# 提交所有更改
echo ""
echo "📦 提交代码..."
git add .
git commit -m "feat: 猎头AI加油站 v1.0.0 - 正式发布" || echo "没有新文件需要提交"

# 推送到 GitHub
echo ""
echo "🚀 推送到 GitHub..."
git push -u origin master --force

echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ 部署完成！"
echo ""
echo "📋 下一步操作:"
echo "   1. 访问: https://github.com/lieying5198/headhunting-power-station"
echo "   2. 点击 Settings → Pages"
echo "   3. Source 选择 'master' 分支"
echo "   4. 等待 1-2 分钟，网站将上线到:"
echo "      https://lieying5198.github.io/headhunting-power-station"
echo ""
echo "💡 本地预览: 双击 preview.bat 或运行 python -m http.server 8080"
echo "═══════════════════════════════════════════════════════"
