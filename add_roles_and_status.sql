-- Add new user roles
ALTER TYPE user_role ADD VALUE 'SUPPORT';
ALTER TYPE user_role ADD VALUE 'MANAGER';
ALTER TYPE user_role ADD VALUE 'TECHNICIAN';

-- Add CANCELLED status
ALTER TYPE status_type ADD VALUE 'CANCELLED';

-- Add resolved_by tracking column
ALTER TABLE support_logs ADD COLUMN resolved_by_id UUID REFERENCES users(id);
