# Hexo-Donate v2.0 - 现代赞助系统  

  [English](README.md) | [简体中文](README_CN.md)  
  
一个使用现代网页技术、安全最佳实践和增强用户体验对 Hexo-Donate 项目的完全重写。

## 特性

✨ **核心特性**
- 现代、响应式的赞助表单，带实时验证
- 通过输入清理实现安全的数据处理
- 支持多种支付方式 (微信, 支付宝, QQ)
- 实时赞助统计与分析
- 自动电子邮件通知
- 用于管理赞助的管理员仪表盘
- 速率限制以防止滥用

🔒 **安全性**
- 使用 TypeScript 保证类型安全
- 输入验证与清理
- SQL 注入防护
- XSS 防护
- CORS 安全
- 基于 IP 地址的速率限制
- 安全的管理员认证

🎨 **用户体验**
- 使用 Tailwind CSS 的现代、简洁的用户界面
- 移动端响应式设计
- 实时表单验证
- 错误处理和用户反馈
- 加载状态和过渡效果
- 无障碍设计模式

📊 **分析**
- 实时赞助统计
- 赞助者数量与总金额追踪
- 支付方式分解
- 平均赞助金额计算
- 带有完整赞助管理功能的管理员仪表盘

## 技术栈

- **前端:** React, TypeScript, Tailwind CSS, Shadcn UI
- **后端:** Next.js API 路由, TypeScript
- **数据库:** PostgreSQL (Neon)
- **邮件:** 电子邮件 API 集成 (Resend/SendGrid)
- **部署:** Vercel

## 设置

### 环境变量

```env
DATABASE_URL=your_database_url
ADMIN_PASSWORD=your_secure_password
ADMIN_EMAIL=admin@example.com
RATE_LIMIT_ENABLED=true
````

### 数据库设置

运行 SQL 迁移脚本：

```bash
# 执行 scripts/init-database.sql
```

### 安装

```bash
npm install
npm run dev
```

## 项目结构

```
app/
├── page.tsx               # 主赞助页面
├── list/page.tsx          # 公开赞助列表
├── admin/page.tsx         # 管理员仪表盘
└── api/
    ├── donations/
    │   ├── route.ts       # 赞助的增删改查 (CRUD)
    │   └── list/route.ts  # 公开赞助列表
    ├── admin/
    │   ├── auth.ts        # 管理员认证
    │   └── donations/route.ts
    └── email/
        └── send/route.ts  # 邮件发送

components/
├── donation-form.tsx      # 主表单组件
├── donation-list.tsx      # 赞助展示
└── admin-stats.tsx        # 统计展示

lib/
├── db.ts                  # 数据库函数
├── validation.ts          # 表单验证
├── email.ts               # 邮件模板
└── auth.ts                # 管理员认证工具
```

## API 端点

### 公开端点

  - `POST /api/donations` - 提交新赞助
  - `GET /api/donations` - 获取赞助统计
  - `GET /api/donations/list` - 获取已确认的赞助

### 管理员端点

  - `GET /api/admin/donations` - 获取所有赞助 (需认证)
  - `PUT /api/admin/donations` - 确认一笔赞助 (需认证)
  - `POST /api/email/send` - 发送邮件

## 相较 v1.0 的改进

| 特性 | v1.0 | v2.0 |
|---------|------|------|
| 前端框架 | 原生 JS | React + TypeScript |
| 类型安全 | 无 | 完全 TypeScript |
| 输入验证 | 基础 | 全面 |
| 安全性 | 易受攻击 | 最佳实践 |
| 管理面板 | 仅数据库 | 完整 Web 界面 |
| 邮件集成 | 简单 | 基于模板 |
| 分析 | 基础 | 全面 |
| 速率限制 | 基础 IP 检查 | 高级 |
| 错误处理 | 最少 | 健壮 |
| 移动端设计 | 基础 | 完全响应式 |
| 代码组织 | 混乱 | 模块化 |

## 开发

```bash
# 开发服务器
npm run dev

# 构建
npm run build

# 类型检查
npm run type-check

# 代码检查 (Linting)
npm run lint
```

## 部署

部署到 Vercel：

```bash
git push origin main
```

或手动部署：

```bash
npm run build
npm start
```

## 安全注意事项

1.  生产环境始终使用 HTTPS
2.  设置强壮的 ADMIN\_PASSWORD
3.  正确配置 CORS
4.  启用速率限制
5.  使用环境变量存储敏感数据
6.  推荐定期进行安全审计

## 未来增强功能

  - [ ] 微信支付/支付宝 SDK 集成
  - [ ] 自动支付验证
  - [ ] Webhook 支持支付确认
  - [ ] 更多邮件模板
  - [ ] 短信通知
  - [ ] 赞助等级/奖励系统
  - [ ] 赞助收据生成
  - [ ] 高级分析仪表盘
  - [ ] 导出赞助数据
  - [ ] 多语言支持

## 许可证

MIT

## 鸣谢

基于 xingjiahui 的原始 [Hexo-Donate](https://github.com/xingjiahui/Hexo-Donate)

## 支持

如有问题、功能请求或贡献，请在 GitHub 上提交 issue。
