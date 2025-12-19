-- Optimization for Rate Limiting
-- This index allows efficient lookup of donations by IP within a time range
-- eliminating full table scans during the checkRateLimit query.

CREATE INDEX IF NOT EXISTS idx_donations_ip_created 
ON donations(user_ip, created_at DESC);

-- Analyze to update statistics immediately
ANALYZE donations;
