# 数据库迁移说明

## 添加回复字段迁移 (add-reply-fields.sql)

此迁移添加了管理员回复功能所需的字段：
- `reply_content`: 存储管理员的回复内容
- `reply_at`: 记录回复的时间

### 运行方式

#### 使用 Neon Console (推荐)
1. 登录 [Neon Console](https://console.neon.tech/)
2. 选择你的项目
3. 进入 SQL Editor
4. 复制并执行 `scripts/add-reply-fields.sql` 中的内容

#### 使用 psql
```bash
psql $DATABASE_URL -f scripts/add-reply-fields.sql
```

### 注意事项
- 此迁移使用 `ADD COLUMN IF NOT EXISTS`，可以安全地重复执行
- 如果你是新建数据库，建议直接使用 `scripts/init-database.sql`，它已经包含了这些字段
