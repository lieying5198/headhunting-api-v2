# ============================================
# 猎头能量站 - GitHub Actions 配置
# ============================================
# 
# 使用方法：
# 1. 在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加：
#    - Secret: CLOUDFLARE_API_TOKEN (Cloudflare API Token)
#    - Variable: CLOUDFLARE_SUBDOMAIN (如: lieying)
#
# 2. 获取方法：
#    - Cloudflare API Token: https://dash.cloudflare.com/profile/api-tokens
#      → Create Token → Edit Cloudflare Workers 模板
#
# ============================================

# 你的 Cloudflare 子域名 (不要加 .workers.dev)
CLOUDFLARE_SUBDOMAIN=lieying

# wrangler.toml 中的配置（已包含在项目中）
# D1: ffcc6eb7-8bc2-476c-8623-9fb3fe0ee417
# KV: 8840a80d33eb4d2f868f0d401ac4cff1
