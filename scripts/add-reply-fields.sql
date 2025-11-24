-- Add reply fields to donations table
-- This migration adds support for admin replies to donations

ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS reply_content TEXT,
ADD COLUMN IF NOT EXISTS reply_at TIMESTAMP NULL;

-- Add index for better query performance when filtering by replied/unreplied donations
CREATE INDEX IF NOT EXISTS idx_donations_reply_at ON donations(reply_at);
