-- Convert from MySQL to PostgreSQL syntax for Neon
-- Hexo-Donate v2.0 Database Schema (PostgreSQL version)

-- Create ENUM types
CREATE TYPE donation_status AS ENUM ('pending', 'confirmed', 'rejected');
CREATE TYPE payment_method_enum AS ENUM ('wechat', 'alipay', 'qq', 'other');

-- Main donations table
CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(50) NOT NULL,
  user_email VARCHAR(100),
  user_url VARCHAR(255),
  user_message VARCHAR(500),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0 AND amount <= 99999.99),
  payment_method payment_method_enum NOT NULL,
  status donation_status DEFAULT 'pending',
  user_ip VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP NULL,
  admin_notes VARCHAR(500),
  reply_content TEXT,
  reply_at TIMESTAMP NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_donations_user_ip ON donations(user_ip);
CREATE INDEX IF NOT EXISTS idx_donations_payment_method ON donations(payment_method);
CREATE INDEX IF NOT EXISTS idx_donations_reply_at ON donations(reply_at);

-- Stats table (optional, can be computed on demand)
CREATE TABLE IF NOT EXISTS donation_stats (
  id SERIAL PRIMARY KEY,
  total_donors INT DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  confirmed_amount DECIMAL(12, 2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default stats row
INSERT INTO donation_stats (total_donors, total_amount, confirmed_amount)
VALUES (0, 0, 0)
ON CONFLICT (id) DO NOTHING;
