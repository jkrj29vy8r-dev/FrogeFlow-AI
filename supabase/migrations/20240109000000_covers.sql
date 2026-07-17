CREATE TABLE IF NOT EXISTS covers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'ebook',
  content JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE covers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_covers" ON covers FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_covers_user_created ON covers(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_covers_project ON covers(project_id) WHERE project_id IS NOT NULL;
