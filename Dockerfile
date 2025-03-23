FROM node:20-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 设置环境变量
ENV NEXT_PUBLIC_API_BASE_URL=https://skdjangobackend-production.up.railway.app
ENV NEXT_PUBLIC_NODE_ENV=production
ENV NODE_ENV=production
# 运行构建
RUN npm run build

# 生产运行时
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=https://skdjangobackend-production.up.railway.app
ENV NEXT_PUBLIC_NODE_ENV=production
ENV PORT=3000

# 创建非 root 用户执行应用
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物和所需文件
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 切换到非 root 用户
USER nextjs

# 验证文件是否存在
RUN ls -la
RUN ls -la .next/static || echo "Static files not found"
RUN ls -la server.js || echo "Server file not found"

# 暴露端口
EXPOSE 3000

# 设置运行命令
CMD ["node", "server.js"] 