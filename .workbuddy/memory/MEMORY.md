# 项目记忆

## 猎头能量站项目 (2024-05-07)

### 项目概述
为IMA平台开发的"猎头能量站"Skill，提供会员管理、分销系统、猎头工具等功能。

### 技术架构
- **前端**: HTML/CSS/JS 静态网站 → GitHub Pages
- **后端**: Cloudflare Workers + D1 + KV
- **Skill**: Node.js 模块，适配IMA平台

### 项目结构
```
website/     - 前端网站（独立部署）
api/         - Workers API
handlers/    - Skill处理器
database/    - D1 Schema
```

### 关键文件
- `website/index.html` - 前端入口
- `api/index.js` - 后端API (完整用户系统)
- `database/schema.sql` - D1数据库设计
- `wrangler.toml` - Workers配置

### 免费资源清单
- GitHub Pages: 前端托管
- Cloudflare Workers: API服务
- Cloudflare D1: 数据库
- Cloudflare KV: 缓存/会话

### 功能已实现
- 用户注册/登录/微信登录
- 会员等级体系 (免费/月度/年费/永久)
- 积分系统 + 每日签到
- 三级分销佣金
- VIP购买
- 文章/课程系统

### 待接入
- 微信支付
- 支付宝
- 真实微信OAuth
- 文件存储(R2/七牛)

### API_BASE 配置
部署后需更新 `website/app.js` 中的 `API_BASE` 为实际Workers URL
