# Railway 部署指南

本文档提供在 Railway 平台上部署 Next.js 前端应用的步骤。

## 前提条件

1. 您需要一个 Railway 账户
2. 安装 Railway CLI（可选）
3. 确保后端 API 已经部署在 `https://fuelassemblybackend-production.up.railway.app`

## 部署步骤

### 使用 Railway Dashboard 部署

1. 登录 Railway 控制台 (https://railway.app/)
2. 点击 "New Project" 按钮
3. 选择 "Deploy from GitHub repo"
4. 连接您的 GitHub 仓库并选择项目
5. 选择分支 (通常是 `main` 或 `master`)
6. 在"Settings"选项卡设置以下环境变量:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://fuelassemblybackend-production.up.railway.app`
   - `NEXT_PUBLIC_NODE_ENV` = `production`
   - `PORT` = `3000`
7. Railway 会自动检测 Next.js 项目并使用正确的构建命令

### 使用 Railway CLI 部署

1. 安装 Railway CLI: `npm install -g @railway/cli`
2. 登录 CLI: `railway login`
3. 初始化项目: `railway init`
4. 链接到现有项目: `railway link`
5. 部署应用: `npm run railway:deploy`

## 验证部署

部署完成后，您可以通过以下方式验证:

1. 访问 Railway 提供的域名 (fuelassemblyfrontend-production.up.railway.app)
2. 检查应用是否成功连接到后端 API
3. 验证登录功能是否正常工作

## 故障排除

如果遇到部署问题:

1. 查看 Railway 日志以获取错误详情
2. 确认环境变量设置正确
3. 验证 API 端点是否可访问
4. 检查 CORS 设置是否正确

## 自定义域名设置

如果您想使用自定义域名:

1. 在 Railway 项目设置中添加自定义域
2. 按照 Railway 提供的说明更新 DNS 记录
3. 等待 DNS 传播 (最多可能需要 48 小时) 