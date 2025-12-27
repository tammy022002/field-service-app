-- ENUM TYPES (must exist before tables)

CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'ENGINEER'
);

CREATE TYPE status_type AS ENUM (
  'PENDING',
  'RESOLVED'
);

CREATE TYPE interaction_type AS ENUM (
  'CALL',
  'EMAIL',
  'MESSAGE'
);

CREATE TYPE direction_type AS ENUM (
  'INCOMING',
  'OUTGOING'
);

CREATE TYPE resolution_method AS ENUM (
  'ONLINE',
  'SITE_VISIT',
  'REMOTE_ACCESS'
);

