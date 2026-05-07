# 🚀 部署指南

本文档详细说明如何部署 headhunting-api 到 Cloudflare Workers。

---

## 📋 部署方式总览

| 方式 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| **GitHub Actions CI/CD** | 生产环境 | 自动部署、可追溯 | 需要配置 GitHub Secrets |
| **本地部署** | 开发/测试 | 快速迭代 | 需要本地配置 |

---

## ☁️ 方式一：GitHub Actions CI/CD（推荐）

### 1️⃣ 创建 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Profile** → **API Tokens**
3. 点击 **Create Token**
4. 选择 **Edit Cloudflare Workers** 模板
5. 配置权限：
   - **Account** → Workers Scripts: **Edit**
   - **Zone** → Workers Routes: **Edit**
6. 设置 Account Resources 为你的账号
7. 点击 **Create Token**
8. **复制生成的 Token**（只显示一次！）

### 2️⃣ 配置 GitHub Secrets

1. 进入 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. Name: `CLOUDFLARE_API_TOKEN`
5. Secret: 粘贴你刚才创建的 Token
6. 点击 **Add secret**

### 3️⃣ 推送代码触发部署

```bash
git add .
git commit -m "feat: 部署到 Cloudflare Workers"
git push origin main
```

部署会自动触发，你可以在 GitHub 仓库的 **Actions** 页面查看部署进度。

---

## 💻 方式二：本地部署

### 1️⃣ 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2️⃣ 配置环境变量

```bash
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars` 文件：

```env
CLOUDFLARE_API_TOKEN=你的_API_Token
```

### 3️⃣ 部署

```bash
# 使用脚本（推荐）
./deploy.sh    # Linux/macOS
deploy.bat     # Windows

# 或直接使用 wrangler
npx wrangler deploy
```

---

## ✅ 验证部署

### 检查部署状态

```bash
# 查看部署列表
npx wrangler deployments list

# 查看当前活跃版本
npx wrangler whoami
```

### 测试 API

```bash
# 使用 curl 测试
curl https://headhunting-api.<your-subdomain>.workers.dev/

# 或访问 Workers Dashboard 查看日志
```

---

## 🔧 常见问题

### Q: 部署失败 "fetch failed"

**原因**: 本地网络/代理问题

**解决方案**:
- 使用 **GitHub Actions CI/CD** 方式部署
- 或配置代理: `set HTTPS_PROXY=http://127.0.0.1:7890`

### Q: API Token 无效

**检查步骤**:
1. 确认 Token 没有过期
2. 确认 Token 有 Workers 编辑权限
3. 确认 Token 属于正确的 Cloudflare 账号

### Q: D1 数据库访问失败

**原因**: D1 数据库 ID 或绑定配置错误

**解决方案**:
1. 检查 `wrangler.toml` 中的 D1 配置
2. 运行 `npx wrangler d1 list` 确认数据库存在
3. 如需更新数据库，运行 `npx wrangler d1 migrations apply`

### Q: KV 存储访问失败

**检查**:
```bash
npx wrangler kv:namespace list
```

确认 KV namespace ID 与 `wrangler.toml` 中配置一致。

---

## 📊 监控与日志

### 查看实时日志

```bash
npx wrangler tail
```

### Cloudflare Dashboard

- **Workers & Pages** → 你的 Worker → **日志**
- **D1** → 数据库 → **查询**
- **KV** → 命名空间 → **数据**

---

## 🔄 更新与回滚

### 更新部署

```bash
# 修改代码后重新部署
npx wrangler deploy
```

### 回滚到上一个版本

```bash
# 查看部署历史
npx wrangler deployments list

# 回滚
npx wrangler rollback --deployment-id=<id>
```

---

## 🌐 API 访问地址

部署成功后，你的 API 地址为：

```
https://headhunting-api.<你的子域名>.workers.dev
```

例如：`https://headhunting-api.lieying.workers.dev`

---

## 📞 获取帮助

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Community](https://community.cloudflare.com/)
