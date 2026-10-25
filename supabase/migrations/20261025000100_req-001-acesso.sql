-- REQ-001 — Acesso e papéis

create type public.papel as enum (
  'primeira_pessoa', 'gerente', 'direcao', 'juridico', 'financeiro', 'operacoes'
);

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null unique,
  papel public.papel not null,
  admin boolean not null default false,
  disponivel boolean not null default true,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

create policy "perfis visíveis para autenticados"
  on public.perfis for select to authenticated using (true);

create function public.meu_papel() returns public.papel
language sql stable security definer set search_path = public as $$
  select papel from public.perfis where id = auth.uid() and ativo
$$;

create function public.sou_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select admin from public.perfis where id = auth.uid() and ativo), false)
$$;

create function public.tenho_papel(variadic papeis public.papel[]) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.meu_papel() = any (papeis), false)
$$;

create function public.definir_papel(usuario uuid, novo_papel public.papel, novo_admin boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.sou_admin() then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  update public.perfis set papel = novo_papel, admin = novo_admin where id = usuario;
end $$;

create function public.definir_disponibilidade(usuario uuid, valor boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if usuario <> auth.uid() and not public.sou_admin() then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  update public.perfis set disponivel = valor where id = usuario;
end $$;

revoke execute on function public.definir_papel(uuid, public.papel, boolean) from anon;
revoke execute on function public.definir_disponibilidade(uuid, boolean) from anon;

-- Esta versão do Supabase não concede acesso por padrão: cada tabela recebe grant explícito.
grant select on public.perfis to authenticated;
grant execute on function public.meu_papel(), public.sou_admin(), public.tenho_papel(public.papel[]) to authenticated;
grant execute on function public.definir_papel(uuid, public.papel, boolean), public.definir_disponibilidade(uuid, boolean) to authenticated;
grant all on public.perfis to service_role;
