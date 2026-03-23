-- Estado do app (perfil + plano) por usuário autenticado
create table if not exists public.nutri_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  profile jsonb,
  diet_plan jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists nutri_profiles_updated_at_idx on public.nutri_profiles (updated_at desc);

alter table public.nutri_profiles enable row level security;

create policy "nutri_profiles_select_own"
  on public.nutri_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "nutri_profiles_insert_own"
  on public.nutri_profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "nutri_profiles_update_own"
  on public.nutri_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "nutri_profiles_delete_own"
  on public.nutri_profiles for delete
  to authenticated
  using (auth.uid() = id);
