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

-- 插入默认配置(可选)
INSERT INTO site_config (key, value, description) VALUES
    ('creator_name', '"站长"', '创建者名称'),
    ('creator_role', '"开发者"', '创建者角色'),
    ('creator_description', '"感谢你的支持"', '创建者描述'),
    ('payment_methods', '["alipay", "wechat", "qq"]', '支付方式列表')
ON CONFLICT (key) DO NOTHING;
