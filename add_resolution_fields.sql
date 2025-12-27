-- Add resolution_method enum type
CREATE TYPE resolution_method AS ENUM ('ONLINE', 'SITE_VISIT', 'REMOTE_ACCESS');

-- Add resolution tracking columns
ALTER TABLE support_logs ADD COLUMN resolution_notes TEXT;
ALTER TABLE support_logs ADD COLUMN resolution_method resolution_method;
