-- Instagram comments cache table
CREATE TABLE IF NOT EXISTS ig_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID,
  ig_comment_id TEXT UNIQUE NOT NULL,
  post_ig_media_id TEXT NOT NULL,
  text TEXT,
  username TEXT,
  timestamp TIMESTAMPTZ,
  replied BOOLEAN DEFAULT FALSE,
  reply_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE ig_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_ig_comments" ON ig_comments
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ig_comments;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS ig_comments_user_id_idx ON ig_comments(user_id);
CREATE INDEX IF NOT EXISTS ig_comments_post_media_idx ON ig_comments(post_ig_media_id);
