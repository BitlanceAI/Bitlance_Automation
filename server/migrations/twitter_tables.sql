-- ─────────────────────────────────────────────────────────────────────────────
-- Twitter integration tables
-- Run this in your Supabase SQL editor before using the Twitter feature.
-- ─────────────────────────────────────────────────────────────────────────────

-- NOTE: PKCE challenges are stored in server memory (no table needed).

-- Connected Twitter accounts
create table if not exists twitter_connections (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  workspace_id     uuid,
  twitter_user_id  text not null,
  username         text,
  name             text,
  profile_picture  text,
  access_token     text not null,
  refresh_token    text,
  token_expires_at timestamptz,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, twitter_user_id)
);

-- Published tweets log
create table if not exists twitter_posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  twitter_user_id text not null,
  tweet_id        text,
  text            text,
  created_at      timestamptz not null default now()
);

create index if not exists twitter_posts_user_id on twitter_posts(user_id, created_at desc);
