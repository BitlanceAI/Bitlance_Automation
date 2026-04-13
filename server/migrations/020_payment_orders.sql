-- Payment orders table for Cashfree PG
create table if not exists payment_orders (
    id              uuid primary key default gen_random_uuid(),
    order_id        text not null unique,
    verification_id text,
    user_id         uuid references auth.users(id) on delete set null,
    amount          numeric(10, 2) not null,
    currency        text not null default 'INR',
    status          text not null default 'CREATED',
    payment_session_id text,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- Index for quick lookups by order_id
create index if not exists idx_payment_orders_order_id on payment_orders(order_id);

-- Auto-update updated_at
create or replace function update_payment_orders_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_payment_orders_updated_at on payment_orders;
create trigger trg_payment_orders_updated_at
    before update on payment_orders
    for each row execute function update_payment_orders_updated_at();
