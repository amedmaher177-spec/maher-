BEGIN;
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL CHECK (length(password_hash) > 0),
  role text NOT NULL DEFAULT 'student',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uidx ON users (lower(email));
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student','staff','admin'));
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS items (id uuid PRIMARY KEY DEFAULT gen_random_uuid());
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS report_type text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS item_date date,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'items_user_id_fkey') THEN
    ALTER TABLE items ADD CONSTRAINT items_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'items_report_type_check') THEN
    ALTER TABLE items ADD CONSTRAINT items_report_type_check CHECK (report_type IN ('lost','found')) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'items_status_check') THEN
    ALTER TABLE items ADD CONSTRAINT items_status_check CHECK (status IN ('active','matched','recovered','closed')) NOT VALID;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proof_description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','recovered')),
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
CREATE TABLE IF NOT EXISTS ai_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  found_item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  confidence_score numeric(5,2) NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested','confirmed','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (lost_item_id <> found_item_id),
  UNIQUE (lost_item_id, found_item_id)
);
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items (user_id);
CREATE INDEX IF NOT EXISTS items_type_category_idx ON items (report_type, category);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items (created_at DESC);
CREATE INDEX IF NOT EXISTS claims_user_id_idx ON claims (user_id);
CREATE INDEX IF NOT EXISTS claims_item_id_idx ON claims (item_id);
CREATE INDEX IF NOT EXISTS claims_status_idx ON claims (status);
CREATE INDEX IF NOT EXISTS ai_matches_found_idx ON ai_matches (found_item_id);
-- Recommended: block Supabase's public API from reading your tables (your server bypasses RLS).
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_matches ENABLE ROW LEVEL SECURITY;
COMMIT;
