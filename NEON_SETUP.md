# Neon数据库配置指南

## 步骤1: 获取Neon连接字符串

1. 访问 https://neon.tech
2. 登录或注册账号
3. 创建新项目或选择现有项目
4. 在项目仪表板中,找到 **Connection String**
5. 复制连接字符串,格式类似:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

## 步骤2: 更新本地环境变量

将连接字符串粘贴到 `.env.local` 文件中:

```bash
DATABASE_URL=你的Neon连接字符串
```

## 步骤3: 初始化数据库表

运行以下SQL创建必要的表(在Neon控制台的SQL Editor中执行):

```sql
-- 创建捐赠表
CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    user_url VARCHAR(500),
    user_message TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    user_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- 创建站点配置表
CREATE TABLE IF NOT EXISTS site_config (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_user_name ON donations(user_name);
```

## 步骤4: 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
pnpm dev
```

## 验证

访问 http://localhost:3000 ,捐赠列表应该能正常加载(虽然可能是空的)。

---

**需要帮助?** 如果你已经有了Neon连接字符串,请告诉我,我可以帮你更新`.env.local`文件。
