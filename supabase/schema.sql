create extension if not exists pgcrypto;

create table if not exists public.bucket_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  memo text,
  font_family text default 'sans',
  font_size integer default 34 check (font_size between 16 and 96),
  color text default '#2f2f35',
  sticker_color text default '#fff0a8',
  x double precision default 45,
  y double precision default 45,
  rotate double precision default 0,
  animation_speed double precision default 1,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bucket_items enable row level security;

drop policy if exists "bucket_items_select_own" on public.bucket_items;
create policy "bucket_items_select_own"
on public.bucket_items for select
using (auth.uid() = user_id);

drop policy if exists "bucket_items_insert_own" on public.bucket_items;
create policy "bucket_items_insert_own"
on public.bucket_items for insert
with check (auth.uid() = user_id);

drop policy if exists "bucket_items_update_own" on public.bucket_items;
create policy "bucket_items_update_own"
on public.bucket_items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "bucket_items_delete_own" on public.bucket_items;
create policy "bucket_items_delete_own"
on public.bucket_items for delete
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists bucket_items_set_updated_at on public.bucket_items;
create trigger bucket_items_set_updated_at
before update on public.bucket_items
for each row
execute function public.set_updated_at();

create index if not exists bucket_items_user_status_idx
on public.bucket_items (user_id, status, updated_at desc);
