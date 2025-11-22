# Hexo-Donate - 完整安装配置指南

[English](SETUP_GUIDE.md) | [简体中文](SETUP_GUIDE_CN.md)

## 前置要求

- Node.js 18+ 
- PostgreSQL数据库（或Neon账户）
- npm/pnpm包管理器

## 步骤一：环境变量配置

### 1. 创建环境变量文件

在项目根目录创建`.env.local`文件：

```bash
cp .env.example .env.local
```

### 2. 配置必要的环境变量

编辑`.env.local`文件，填入以下内容：

```env
# 数据库配置（必需）
DATABASE_URL=postgresql://username:password@host:port/database

# 管理员设置（必需）
ADMIN_PASSWORD=your_very_secure_password_here
ADMIN_EMAIL=admin@yourdomain.com

# 邮件服务配置（可选，但推荐）
EMAIL_PROVIDER=resend  # 可选值: resend, sendgrid
EMAIL_API_KEY=your_email_api_key
EMAIL_FROM=noreply@yourdomain.com

# 站点URL配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3000/admin

# 安全设置
RATE_LIMIT_ENABLED=true
```

## 步骤二：数据库设置

### 选项A：使用Neon（推荐，免费层可用）

1. 访问 [neon.tech](https://neon.tech) 并注册账户
2. 创建新项目
3. 复制连接字符串（格式：`postgresql://...`）
4. 粘贴到`.env.local`的`DATABASE_URL`

### 选项B：使用本地PostgreSQL

1. 安装PostgreSQL
2. 创建新数据库：
   ```sql
   CREATE DATABASE hexo_donate;
   ```
3. 设置`DATABASE_URL=postgresql://localhost:5432/hexo_donate`

### 执行数据库迁移

使用以下任一方式执行SQL迁移脚本：

**方法1：Neon控制台**
1. 登录Neon控制台
2. 打开SQL编辑器
3. 复制粘贴`scripts/init-database.sql`的内容
4. 点击执行

**方法2：命令行**
```bash
psql $DATABASE_URL -f scripts/init-database.sql
```

**方法3：pgAdmin或其他数据库工具**
- 打开数据库连接
- 导入并执行`scripts/init-database.sql`

## 步骤三：安装依赖

```bash
# 使用pnpm（推荐）
pnpm install

# 或使用npm
npm install
```

## 步骤四：启动开发服务器

```bash
# 开发模式
pnpm dev

# 或
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## 步骤五：首次配置

### 1. 访问主页
打开 `http://localhost:3000` 查看赞助表单

### 2. 访问管理面板  
打开 `http://localhost:3000/admin`
- 用户名：`admin`
- 密码：使用`.env.local`中设置的`ADMIN_PASSWORD`

### 3. 配置站点设置
访问 `http://localhost:3000/admin/config`
- 自定义站点标题和描述
- 设置赞助金额范围
- 配置支付方式
- 自定义页面文本

### 4. 查看数据分析
访问 `http://localhost:3000/analytics` 查看统计数据

## 邮件服务配置

### 使用Resend（推荐）

1. **注册账户**
   - 访问 [resend.com](https://resend.com)
   - 创建免费账户

2. **添加域名**
   - 在控制面板添加您的域名
   - 按照指示添加DNS记录验证域名

3. **生成API密钥**
   - 在设置中生成API密钥
   - 复制密钥

4. **配置环境变量**
   ```env
   EMAIL_PROVIDER=resend
   EMAIL_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

### 使用SendGrid

1. **注册账户**
   - 访问 [sendgrid.com](https://sendgrid.com)
   - 创建账户

2. **验证发件人**
   - 在SendGrid控制面板验证发件人邮箱或域名

3. **生成API密钥**
   - 在Settings → API Keys创建新密钥
   - 选择"Full Access"权限

4. **配置环境变量**
   ```env
   EMAIL_PROVIDER=sendgrid
   EMAIL_API_KEY=SG.xxxxxxxxxxxxx
   EMAIL_FROM=noreply@yourdomain.com
   ```

### 测试邮件功能

1. 提交一个测试赞助
2. 检查控制台日志确认邮件发送尝试
3. 查看管理员邮箱确认收到通知
4. 在管理面板确认赞助
5. 检查赞助者邮箱确认收到确认邮件

## 部署到生产环境

### 部署到Vercel（推荐）

1. **准备代码**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **导入到Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击"Import Project"
   - 选择GitHub仓库

3. **配置环境变量**
   - 在Vercel项目设置中添加所有环境变量
   - 确保`NEXT_PUBLIC_*`变量使用生产URL

4. **部署**
   - Vercel会自动构建和部署
   - 访问提供的URL查看站点

### 构建验证

在部署前本地验证构建：

```bash
# 类型检查
pnpm lint

# 生产构建
pnpm build

# 启动生产服务器
pnpm start
```

## 常见问题解决

### 数据库连接错误

**问题**：无法连接到数据库

**解决方案**：
- 验证`DATABASE_URL`格式正确
- 检查数据库凭据
- 对于Neon，确保IP地址已加入白名单
- 测试连接：`psql $DATABASE_URL -c "SELECT 1;"`

### 管理员登录失败

**问题**：输入正确密码仍无法登录

**解决方案**：
- 检查`.env.local`中的`ADMIN_PASSWORD`
- 确保没有多余的空格或特殊字符
- 清除浏览器缓存和localStorage
- 重启开发服务器

### 邮件发送失败

**问题**：邮件未发送或报错

**解决方案**：
- 验证`EMAIL_API_KEY`有效
- 检查`EMAIL_FROM`格式（必须是`name@domain.com`）
- 确认域名已在邮件服务提供商处验证
- 查看控制台错误日志
- 检查垃圾邮件文件夹

### 端口已被占用

**问题**：`Error: Port 3000 is already in use`

**解决方案**：
```bash
# 使用不同端口
pnpm dev -- -p 3001

# 或终止占用进程
lsof -ti:3000 | xargs kill -9
```

### TypeScript类型错误

**问题**：构建时出现类型错误

**解决方案**：
```bash
# 清除缓存并重新安装
rm -rf .next node_modules
pnpm install

# 运行类型检查
pnpm lint
```

## API文档

详细的API端点说明请参见 [README.md](README.md#api-endpoints)。

## 移动端测试

测试移动端响应式设计：

1. **Chrome DevTools**
   - 按F12打开开发者工具
   - 点击设备工具栏图标（或Ctrl+Shift+M）
   - 选择不同设备尺寸测试

2. **测试设备**
   - iPhone SE (375x667)
   - iPhone 14 Pro (393x852)
   - iPad (768x1024)
   - Android各种尺寸

3. **检查项目**
   - 表单填写体验
   - 按钮触摸目标大小
   - 表格横向滚动
   - 统计卡片布局
   - 管理面板操作

## 安全建议

1. **生产环境**
   - 始终使用HTTPS
   - 设置强壮的`ADMIN_PASSWORD`（建议20+字符，包含数字、字母、符号）
   - 启用`RATE_LIMIT_ENABLED=true`

2. **环境变量**
   - 永远不要提交`.env.local`到版本控制
   - 为不同环境使用不同的凭据
   - 定期轮换API密钥

3. **数据库**
   - 定期备份数据
   - 限制数据库访问IP
   - 使用强壮的数据库密码

4. **依赖维护**
   ```bash
   # 检查安全漏洞
   pnpm audit
   
   # 更新依赖
   pnpm update
   ```

## 性能优化

- 数据库查询已使用索引优化
- 启用速率限制防止滥用
- 图片使用Next.js Image组件自动优化
- API响应缓存（在生产环境）

## 获取帮助

- **文档**: 查看 [README.md](README.md) 了解功能概览
- **问题**: 在[GitHub Issues](https://github.com/yourusername/hexo-donate-refactor/issues)提交问题
- **讨论**: 加入[GitHub Discussions](https://github.com/yourusername/hexo-donate-refactor/discussions)

## 下一步

1. 自定义邮件模板（`app/api/email/send/route.ts`）
2. 修改赞助表单样式（`components/donation-form.tsx`）
3. 添加更多支付方式（`lib/validation.ts`）
4. 实现Webhook集成自动确认支付
5. 为管理面板添加双因素认证

---

安装成功！开始接受赞助吧 ❤️
