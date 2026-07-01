-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id                   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name            text,
  avatar_url           text,
  current_workspace_id uuid,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_self_read" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ============================================================
-- WORKSPACES
-- ============================================================
CREATE TABLE workspaces (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  slug            text UNIQUE NOT NULL,
  owner_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  plan            text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'agency')),
  ai_provider     text CHECK (ai_provider IN ('openai', 'anthropic', 'groq')),
  ai_api_key_enc  text,
  timezone        text NOT NULL DEFAULT 'UTC',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_owner_full" ON workspaces
  USING (owner_id = auth.uid());

CREATE POLICY "workspace_member_read" ON workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- WORKSPACE MEMBERS
-- ============================================================
CREATE TABLE workspace_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         text NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by   uuid REFERENCES auth.users(id),
  joined_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_read_own_workspace" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "admin_manage_members" ON workspace_members
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- SOCIAL ACCOUNTS
-- ============================================================
CREATE TABLE social_accounts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform          text NOT NULL CHECK (platform IN (
    'twitter', 'instagram', 'linkedin', 'facebook',
    'bluesky', 'mastodon', 'threads', 'tiktok', 'pinterest', 'youtube'
  )),
  platform_user_id  text NOT NULL,
  display_name      text NOT NULL,
  username          text,
  avatar_url        text,
  access_token_enc  text NOT NULL,
  refresh_token_enc text,
  token_expires_at  timestamptz,
  is_active         boolean NOT NULL DEFAULT true,
  last_synced_at    timestamptz,
  follower_count    int DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, platform, platform_user_id)
);

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_accounts_workspace_member" ON social_accounts
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by   uuid NOT NULL REFERENCES auth.users(id),
  status       text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_approval', 'approved', 'scheduled',
    'published', 'failed', 'cancelled'
  )),
  content      text,
  scheduled_at timestamptz,
  published_at timestamptz,
  campaign_id  uuid,
  ai_generated boolean NOT NULL DEFAULT false,
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_workspace_member" ON posts
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_posts_workspace_scheduled ON posts(workspace_id, scheduled_at)
  WHERE status IN ('scheduled', 'approved');

CREATE INDEX idx_posts_workspace_status ON posts(workspace_id, status);

-- ============================================================
-- POST CHANNELS
-- ============================================================
CREATE TABLE post_channels (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  social_account_id uuid NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  content_override  text,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'published', 'failed', 'skipped'
  )),
  platform_post_id  text,
  published_at      timestamptz,
  error_message     text,
  retry_count       int NOT NULL DEFAULT 0,
  UNIQUE(post_id, social_account_id)
);

ALTER TABLE post_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_channels_via_post" ON post_channels
  USING (
    post_id IN (
      SELECT id FROM posts WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- MEDIA ASSETS
-- ============================================================
CREATE TABLE media_assets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  uploaded_by  uuid NOT NULL REFERENCES auth.users(id),
  type         text NOT NULL CHECK (type IN ('image', 'video', 'gif')),
  filename     text NOT NULL,
  storage_path text NOT NULL,
  size_bytes   bigint NOT NULL,
  width        int,
  height       int,
  duration_sec numeric,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_assets_workspace_member" ON media_assets
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- POST MEDIA (many-to-many)
-- ============================================================
CREATE TABLE post_media (
  post_id        uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_asset_id uuid NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
  sort_order     int NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, media_asset_id)
);

ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_media_via_post" ON post_media
  USING (
    post_id IN (
      SELECT id FROM posts WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- ANALYTICS SNAPSHOTS (daily)
-- ============================================================
CREATE TABLE analytics_snapshots (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id uuid NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  snapshot_date     date NOT NULL,
  follower_count    int,
  post_count        int DEFAULT 0,
  total_impressions bigint DEFAULT 0,
  total_engagements bigint DEFAULT 0,
  total_reach       bigint DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(social_account_id, snapshot_date)
);

ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics_via_workspace" ON analytics_snapshots
  USING (
    social_account_id IN (
      SELECT id FROM social_accounts WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- POST ANALYTICS
-- ============================================================
CREATE TABLE post_analytics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_channel_id uuid NOT NULL REFERENCES post_channels(id) ON DELETE CASCADE,
  fetched_at      timestamptz NOT NULL DEFAULT now(),
  impressions     bigint DEFAULT 0,
  reach           bigint DEFAULT 0,
  likes           int DEFAULT 0,
  comments        int DEFAULT 0,
  shares          int DEFAULT 0,
  clicks          int DEFAULT 0,
  saves           int DEFAULT 0,
  video_views     int DEFAULT 0
);

ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_analytics_via_workspace" ON post_analytics
  USING (
    post_channel_id IN (
      SELECT pc.id FROM post_channels pc
      JOIN posts p ON p.id = pc.post_id
      WHERE p.workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- APPROVAL REQUESTS
-- ============================================================
CREATE TABLE approval_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users(id),
  reviewed_by  uuid REFERENCES auth.users(id),
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comment      text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  reviewed_at  timestamptz
);

ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_workspace_member" ON approval_requests
  USING (
    post_id IN (
      SELECT id FROM posts WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================
-- POST TEMPLATES
-- ============================================================
CREATE TABLE post_templates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by   uuid NOT NULL REFERENCES auth.users(id),
  name         text NOT NULL,
  content      text NOT NULL,
  platforms    text[] NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE post_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_workspace_member" ON post_templates
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- UPDATED_AT TRIGGER (all tables)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER social_accounts_updated_at BEFORE UPDATE ON social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE & WORKSPACE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  workspace_id uuid;
  workspace_slug text;
  user_name text;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  -- Create profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    user_name,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create default workspace
  workspace_slug := lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '-', 'g'))
    || '-' || substr(gen_random_uuid()::text, 1, 8);

  INSERT INTO public.workspaces (name, slug, owner_id, plan)
  VALUES (
    user_name || '''s Workspace',
    workspace_slug,
    NEW.id,
    'free'
  )
  RETURNING id INTO workspace_id;

  -- Add as admin member
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (workspace_id, NEW.id, 'admin');

  -- Set current workspace
  UPDATE public.profiles SET current_workspace_id = workspace_id WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
