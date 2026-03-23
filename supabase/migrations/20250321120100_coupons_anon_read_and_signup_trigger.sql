-- Requer tabela public.coupons já existente (seu projeto Nutri).
-- 1) App (anon) valida código na landing — apenas SELECT.

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'coupons'
  ) then
    execute 'drop policy if exists "coupons_anon_select_validate" on public.coupons';
    execute 'create policy "coupons_anon_select_validate" on public.coupons for select to anon using (true)';
  end if;
end $$;

-- 2) Após novo usuário em auth.users, incrementa uso do cupom informado no metadata (registration_coupon).

create or replace function public.handle_new_user_registration_coupon()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  c text;
begin
  c := upper(trim(coalesce(new.raw_user_meta_data->>'registration_coupon', '')));
  if c = '' then
    return new;
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'coupons'
  ) then
    update public.coupons
    set
      current_uses = coalesce(current_uses, 0) + 1,
      quantidade_disponivel = case
        when quantidade_disponivel is null then null
        else greatest(0, coalesce(quantidade_disponivel, 0) - 1)
      end
    where upper(trim(code)) = c
      and is_active = true;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_registration_coupon on auth.users;
create trigger on_auth_user_created_registration_coupon
  after insert on auth.users
  for each row
  execute function public.handle_new_user_registration_coupon();
