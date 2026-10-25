-- REQ-011 — Parcerias ativas e acompanhamento

alter table public.parcerias add column medidas_informadas_em date;

create function public.pode_ler_parceria(parceria uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select public.pode_ler_empresa_id(empresa_id) from public.parcerias where id = parceria), false)
$$;
grant execute on function public.pode_ler_parceria(uuid) to authenticated;

create table public.entregas (
  id uuid primary key default gen_random_uuid(),
  parceria_id uuid not null references public.parcerias (id) on delete cascade,
  item text not null,
  data date not null,
  descricao text,
  privacidade_ok boolean not null default false,
  nota_membros numeric(2, 1) check (nota_membros is null or nota_membros between 1 and 5),
  autor_id uuid references public.perfis (id) default auth.uid(),
  criado_em timestamptz not null default now(),
  constraint privacidade_nas_acoes check (item not in ('ativacao_1d', 'ativacao_3d', 'ativacao_4d', 'eventos') or privacidade_ok)
);
create index on public.entregas (parceria_id, data);

create table public.materiais (
  id uuid primary key default gen_random_uuid(),
  parceria_id uuid not null references public.parcerias (id) on delete cascade,
  descricao text not null,
  situacao text not null default 'aguardando' check (situacao in ('aguardando', 'aprovado', 'recusado')),
  motivo text,
  decidido_por uuid references public.perfis (id),
  decidido_em timestamptz,
  criado_em timestamptz not null default now(),
  check (situacao <> 'recusado' or coalesce(trim(motivo), '') <> '')
);

create table public.relatorios (
  id uuid primary key default gen_random_uuid(),
  parceria_id uuid not null references public.parcerias (id) on delete cascade,
  tipo text not null check (tipo in ('relatorio', 'balanco')),
  referencia date not null,
  resumo text not null,
  enviado_em timestamptz not null default now(),
  autor_id uuid references public.perfis (id) default auth.uid(),
  unique (parceria_id, tipo, referencia)
);

alter table public.anexos add column entrega_id uuid references public.entregas (id) on delete set null;

alter table public.entregas enable row level security;
alter table public.materiais enable row level security;
alter table public.relatorios enable row level security;

create policy "ler entregas" on public.entregas for select to authenticated using (public.pode_ler_parceria(parceria_id));
create policy "registrar entregas" on public.entregas for insert to authenticated
  with check (public.tenho_papel('primeira_pessoa', 'gerente', 'operacoes') and autor_id = auth.uid() and public.pode_ler_parceria(parceria_id));
create policy "ler materiais" on public.materiais for select to authenticated using (public.pode_ler_parceria(parceria_id));
create policy "registrar materiais" on public.materiais for insert to authenticated
  with check (public.tenho_papel('primeira_pessoa', 'gerente', 'operacoes') and situacao = 'aguardando' and public.pode_ler_parceria(parceria_id));
create policy "ler relatórios" on public.relatorios for select to authenticated using (public.pode_ler_parceria(parceria_id));
create policy "registrar relatórios" on public.relatorios for insert to authenticated
  with check (public.tenho_papel('primeira_pessoa', 'gerente') and autor_id = auth.uid() and public.pode_ler_parceria(parceria_id));

grant select, insert on public.entregas, public.materiais, public.relatorios to authenticated;
grant all on public.entregas, public.materiais, public.relatorios to service_role;

-- Aprovar ou recusar material: Gerentes, 1ª pessoa e Operações (Marketing aprova junto). O Club pode recusar o que não combina.
create function public.decidir_material(material uuid, aprovar boolean, motivo text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.tenho_papel('primeira_pessoa', 'gerente', 'operacoes', 'direcao') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  if not aprovar and coalesce(trim(motivo), '') = '' then raise exception 'Informe o motivo da recusa.'; end if;
  update public.materiais set situacao = case when aprovar then 'aprovado' else 'recusado' end, motivo = nullif(trim(motivo), ''),
    decidido_por = auth.uid(), decidido_em = now()
  where id = material;
end $$;

create function public.informar_medidas(parceria uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.tenho_papel('primeira_pessoa', 'gerente', 'operacoes') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  update public.parcerias set medidas_informadas_em = current_date where id = parceria;
end $$;
revoke execute on function public.decidir_material(uuid, boolean, text), public.informar_medidas(uuid) from anon;
grant execute on function public.decidir_material(uuid, boolean, text), public.informar_medidas(uuid) to authenticated;

-- Telas do Club: no máximo 8 marcas ao mesmo tempo (cap. 8).
create function public.limite_telas() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.situacao = 'vigente' and new.contrapartidas @> '[{"item":"telas"}]' and (
    select count(*) from public.parcerias p
    where p.situacao = 'vigente' and p.id <> new.id and p.contrapartidas @> '[{"item":"telas"}]'
      and p.inicio <= new.fim and p.fim >= new.inicio
  ) >= 8 then
    raise exception 'As telas já têm 8 marcas ao mesmo tempo.';
  end if;
  return new;
end $$;
create trigger parcerias_limite_telas before insert or update of situacao, contrapartidas, inicio, fim on public.parcerias
  for each row execute function public.limite_telas();
