-- REQ-006 — Segunda triagem: classificação e padrão

-- Parcerias (mínima): o que o conflito de exclusividade precisa. REQ-010 e REQ-011 completam.
create table public.parcerias (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  situacao text not null default 'vigente' check (situacao in ('vigente', 'encerrada')),
  inicio date not null,
  fim date not null check (fim >= inicio),
  exclusividade_categoria text references public.categorias (nome) on update cascade,
  exclusividade_inicio date,
  exclusividade_fim date,
  nao_renovar boolean not null default false,
  criado_em timestamptz not null default now()
);
create index on public.parcerias (empresa_id);
create index on public.parcerias (exclusividade_categoria) where situacao = 'vigente';
alter table public.parcerias enable row level security;
create policy "ler parcerias" on public.parcerias for select to authenticated using (public.pode_ler_empresa_id(empresa_id));
grant select on public.parcerias to authenticated;
grant all on public.parcerias to service_role;

alter table public.empresas
  add column classificacao jsonb not null default '{}',
  add column estudo text,
  add column candidata_master boolean not null default false,
  add column triagem2_concluida_em timestamptz;

create function public.padrao_por_pontos(soma int) returns public.padrao language sql immutable as $$
  select case when soma between 5 and 7 then 'bronze'::public.padrao
              when soma between 8 and 11 then 'prata'::public.padrao
              when soma between 12 and 15 then 'ouro'::public.padrao end
$$;

create function public.menor_padrao(a public.padrao, b public.padrao) returns public.padrao language sql immutable as $$
  select case when a is null or b is null then null when a < b then a else b end
$$;

-- Parceiro vigente com exclusividade na categoria (exceto o que termina e não vai renovar).
create function public.conflito_categoria(categoria_pedida text, empresa uuid default null)
returns table (marca text, fim date)
language sql stable security definer set search_path = public as $$
  select e.marca, coalesce(p.exclusividade_fim, p.fim)
  from public.parcerias p join public.empresas e on e.id = p.empresa_id
  where p.situacao = 'vigente'
    and p.exclusividade_categoria = categoria_pedida
    and coalesce(p.exclusividade_fim, p.fim) >= current_date
    and not p.nao_renovar
    and (empresa is null or p.empresa_id <> empresa)
    and public.tenho_papel('primeira_pessoa', 'gerente', 'direcao')
  limit 1
$$;
grant execute on function public.conflito_categoria(text, uuid) to authenticated;

create function public.salvar_classificacao(empresa uuid, ficha jsonb, porte_calc public.porte, padrao_calc public.padrao,
  texto_estudo text, master boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.tenho_papel('primeira_pessoa', 'gerente') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  if (select etapa from public.empresas where id = empresa) <> 'triagem2' then
    raise exception 'A classificação só muda enquanto a empresa está em Triagem 2.';
  end if;
  update public.empresas set
    classificacao = coalesce(ficha, '{}'),
    porte = porte_calc,
    padrao_final = padrao_calc,
    estudo = nullif(trim(texto_estudo), ''),
    candidata_master = coalesce(master, false)
  where id = empresa;
end $$;

create function public.concluir_triagem2(empresa uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  a jsonb;
  p jsonb;
  soma int;
  por_pontos public.padrao;
  faixa public.padrao;
  conflito record;
begin
  if not public.tenho_papel('primeira_pessoa', 'gerente') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  select * into e from public.empresas where id = empresa for update;
  if e.etapa <> 'triagem2' then raise exception 'A empresa não está em Triagem 2.'; end if;
  a := coalesce(e.classificacao->'aderencia', '{}');
  if a->>'membro_primeiro' = 'nao' or (select count(*) from jsonb_each_text(a) where value = 'nao') >= 2 then
    raise exception 'Não combina com o membro: propor recusa com A5.';
  end if;
  if (select count(*) from jsonb_object_keys(a)) < 5 then raise exception 'Responda os cinco critérios de aderência.'; end if;
  if e.porte is null then raise exception 'Classifique o porte.'; end if;
  p := coalesce(e.classificacao->'pontos', '{}');
  if (select count(*) from jsonb_object_keys(p)) < 5 then raise exception 'Preencha os cinco critérios da ficha de pontos.'; end if;
  select sum(value::int) into soma from jsonb_each_text(p);
  por_pontos := public.padrao_por_pontos(soma);
  faixa := nullif(e.classificacao->>'faixa_investimento', '')::public.padrao;
  if faixa is null then raise exception 'Escolha a faixa de investimento.'; end if;
  if coalesce(trim(e.estudo), '') = '' then raise exception 'Escreva o estudo da empresa para concluir.'; end if;
  select * into conflito from public.conflito_categoria(e.categoria, e.id);
  if conflito.marca is not null then
    raise exception 'Conflito de exclusividade com % até %.', conflito.marca, to_char(conflito.fim, 'DD/MM/YYYY');
  end if;
  update public.empresas set
    padrao_final = public.menor_padrao(por_pontos, faixa),
    classificacao = classificacao || jsonb_build_object('padrao_pontos', por_pontos),
    triagem2_concluida_em = now()
  where id = empresa;
  insert into public.historico (empresa_id, tipo, texto, autor_id)
  values (empresa, 'sistema', 'Triagem 2 concluída: ' || soma || ' pontos · ' ||
    public.rotulo_padrao(public.menor_padrao(por_pontos, faixa)) ||
    case when e.candidata_master then ' · candidata a Master' else '' end, auth.uid());
end $$;
revoke execute on function public.salvar_classificacao(uuid, jsonb, public.porte, public.padrao, text, boolean), public.concluir_triagem2(uuid) from anon;
grant execute on function public.salvar_classificacao(uuid, jsonb, public.porte, public.padrao, text, boolean), public.concluir_triagem2(uuid) to authenticated;

-- Para marcar a reunião, a Triagem 2 precisa estar concluída.
create function public.requisitos_reuniao(empresa uuid) returns text
language sql stable security definer set search_path = public as $$
  select case when (select triagem2_concluida_em from public.empresas where id = empresa) is null
    then 'Conclua a Triagem 2 antes de marcar a reunião.' end
$$;
