-- Configuration table for dynamic site settings
-- Configuration table for dynamic site settings
-- FundStack - Site Configuration Schema

-- Create site_config table
CREATE TABLE IF NOT EXISTS site_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description VARCHAR(500),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_config_updated_at ON site_config(updated_at);

-- Insert default configuration values
INSERT INTO site_config (key, value, description) VALUES
  -- Site basic information
  ('site_title', '"温暖投喂小站"', '网站标题'),
  ('site_description', '"用一份贴心的投喂陪伴创作，快速、安全又安心。"', '网站描述'),
  ('site_heading', '"来一份暖心的投喂吧"', '页面主标题'),
  ('site_subheading', '"你的支持是我们继续创作的能量，谢谢每一位一路相伴的守护者！"', '页面副标题'),
  
  -- Creator information
  ('creator_name', '"小宇航员"', '创作者名称'),
  ('creator_role', '"站长 / 创作者"', '创作者角色'),
  ('creator_description', '"热爱分享的代码种田人，用键盘播种快乐，用故事陪伴每一个夜晚。"', '创作者描述'),
  ('creator_avatar', '"/placeholder-user.jpg"', '创作者头像路径'),
  ('payment_alipay_qr', '"/placeholder.svg"', '支付宝收款码路径'),
  ('payment_wechat_qr', '"/placeholder.svg"', '微信收款码路径'),
  
  -- Donation form configuration
  ('form_title', '"给创作者一口能量"', '投喂表单标题'),
  ('form_description', '"每一份投喂都是继续前进的动力，谢谢你的支持与陪伴"', '投喂表单描述'),
  ('form_amount_min', '0.01', '最小投喂金额'),
  ('form_amount_max', '99999.99', '最大投喂金额'),
  ('form_message_max_length', '500', '留言最大长度'),
  ('form_name_max_length', '50', '昵称最大长度'),
  
  -- Payment methods
  ('payment_methods', 
   '[
     {"value": "wechat", "label": "微信支付"},
     {"value": "alipay", "label": "支付宝"},
     {"value": "qq", "label": "QQ支付"},
     {"value": "other", "label": "其他"}
   ]', 
   '支付方式列表'),
  
  -- List display configuration
  ('list_home_limit', '5', '首页显示数量'),
  ('list_home_title', '"最新投喂（取最近 5 位）"', '首页列表标题'),
  
  -- Reasons section
  ('reasons_title', '"为什么要投喂？"', '投喂理由标题'),
  ('reasons_items',
   '[
     "和我们一起养肥内容创作",
     "帮助我们守护小站的服务器",
     "催生更多有趣的新功能",
     "加入投喂伙伴的行列"
   ]',
   '投喂理由列表'),
  
  -- Security section
  ('security_title', '"安全且贴心"', '安全说明标题'),
  ('security_description', '"你的支付信息会被安全处理，敏感数据绝不存储，只会记录必要的投喂信息用于确认。"', '安全说明描述'),
  
  -- Other text
  ('form_privacy_text', '"数据仅用于确认投喂，隐私我们会好好守护。"', '表单隐私说明'),
  ('payment_methods_button_text', '"查看收款方式"', '查看收款方式按钮文字'),
  ('payment_methods_button_text_close', '"收起收款方式"', '收起收款方式按钮文字'),
  ('payment_methods_description', '"打开喜欢的方式扫一扫："', '收款方式说明')

ON CONFLICT (key) DO NOTHING;
