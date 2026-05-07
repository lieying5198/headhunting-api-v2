# 猎头全方位能力提升与精准交付赋能系统

## 📋 项目简介

这是一个基于 Cloudflare Workers 的猎头招聘 API 服务，提供候选人和职位管理功能。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 开发模式（热重载）
npm run dev

# 运行测试
npm test
```

### 部署

#### 部署到 Cloudflare Workers

```bash
# 使用 Wrangler 部署
npx wrangler deploy

# 或使用脚本
./deploy-workers.sh
```

#### 部署 API 服务

```bash
# 部署 API（Cloudflare Workers）
./deploy-api.sh

# 部署前端页面（GitHub Pages）
./deploy-gh-pages.sh
```

## 📁 项目结构

```
headhunting-api/
├── api/              # API 路由处理器
├── handlers/         # 请求处理器
├── database/         # 数据库相关
├── data/            # 数据文件
├── public/          # 前端页面
├── scripts/         # 工具脚本
├── deploy-*.sh      # 部署脚本
└── *.md            # 文档
```

## 🔧 环境变量

部署前需要配置以下环境变量：

- `KV_NAMESPACE_ID`: Cloudflare KV 命名空间 ID
- `API_TOKEN`: API 访问令牌

## 📝 许可证

MIT
