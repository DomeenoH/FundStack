#!/bin/bash

# 数据库迁移脚本
# 用于执行 add-reply-fields.sql 迁移

set -e

echo "🔄 开始执行数据库迁移..."

# 检查 DATABASE_URL 环境变量
if [ -z "$DATABASE_URL" ]; then
  echo "❌ 错误: DATABASE_URL 环境变量未设置"
  echo "请在 .env 文件中设置 DATABASE_URL"
  exit 1
fi

# 加载 .env 文件（如果存在）
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "📝 执行迁移: add-reply-fields.sql"

# 执行迁移脚本
psql "$DATABASE_URL" -f scripts/add-reply-fields.sql

echo "✅ 迁移完成！"
echo ""
echo "已添加以下字段到 donations 表："
echo "  - reply_content (TEXT)"
echo "  - reply_at (TIMESTAMP)"
