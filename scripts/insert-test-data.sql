-- 插入测试捐赠数据
INSERT INTO donations (user_name, user_email, user_url, user_message, amount, payment_method, status, created_at, confirmed_at) VALUES
('张三', 'zhangsan@example.com', 'https://example.com', '感谢你的开源项目!', 50.00, 'wechat', 'confirmed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('李四', 'lisi@example.com', NULL, '加油!', 20.00, 'alipay', 'confirmed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('王五', NULL, 'https://blog.example.com', '很棒的项目', 100.00, 'qq', 'confirmed', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
('赵六', 'zhaoliu@example.com', NULL, NULL, 30.00, 'wechat', 'pending', NOW() - INTERVAL '1 hour', NULL),
('测试用户', 'test@example.com', NULL, '这是一条测试留言,用于验证系统功能。', 88.88, 'alipay', 'confirmed', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours');
