-- e-Sign Agreements table
-- Stores Aadhaar OTP-based e-sign requests and their results

create table if not exists esign_agreements (
  id               uuid primary key default gen_random_uuid(),
  order_id         text unique not null,           -- Cashfree VRS order ID
  user_id          uuid references auth.users(id) on delete set null,
  name             text not null,
  email            text not null,
  phone            text not null,
  status           text not null default 'PENDING', -- PENDING | SIGNED | FAILED | EXPIRED
  sign_url         text,                            -- Cashfree hosted signing URL
  signed_pdf_url   text,                            -- URL to signed PDF after completion
  pdf_doc_id       text,                            -- Cashfree VRS document ID
  signed_at        timestamptz,
  expires_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Index for fast lookup by order_id (webhook callback)
create index if not exists esign_agreements_order_id_idx on esign_agreements(order_id);
-- Index for user's agreements
create index if not exists esign_agreements_user_id_idx on esign_agreements(user_id);

-- Auto-update updated_at
create or replace function update_esign_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists esign_updated_at_trigger on esign_agreements;
create trigger esign_updated_at_trigger
  before update on esign_agreements
  for each row execute procedure update_esign_updated_at();

-- RLS: users can only read their own agreements
alter table esign_agreements enable row level security;

create policy "users_read_own_agreements"
  on esign_agreements for select
  using (auth.uid() = user_id);

-- Service role bypasses RLS (server always uses service role)
