# 完成Neon数据库配置

## ✅ 已完成  

- [x] 更新 `.env.local` 文件,使用Neon连接字符串
- [x] 创建数据库初始化SQL脚本

## 📋 下一步操作

### 1. 在Neon控制台执行SQL

1. 访问 https://console.neon.tech
2. 选择你的项目: `ep-late-dew-a4n0meda`
3. 点击 **SQL Editor**
4. 复制并执行 `scripts/init-neon-db.sql` 中的SQL语句

或者直接复制以下SQL:

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

### 2. 重启开发服务器

```bash
# 在终端按 Ctrl+C 停止当前服务器
# 然后重新启动
pnpm dev
```

### 3. 验证

访问 http://localhost:3000 ,页面应该能正常加载,不再显示数据库错误。

---

**注意**: 如果遇到任何问题,请告诉我!
