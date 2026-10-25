-- REQ-005 — Primeira triagem

create table public.categorias (
  nome text primary key,
  situacao text not null check (situacao in ('aceita', 'nao_aceita', 'sensivel')),
  ordem integer not null
);
insert into public.categorias (nome, situacao, ordem) values
  ('tabaco e cigarro eletrônico', 'nao_aceita', 1),
  ('apostas e jogos de azar', 'nao_aceita', 2),
  ('conteúdo adulto', 'nao_aceita', 3),
  ('armas', 'nao_aceita', 4),
  ('partidos e campanhas políticas', 'nao_aceita', 5),
  ('marca contrária ao cuidado com o membro', 'nao_aceita', 6),
  ('concorrente direto do Club', 'nao_aceita', 7),
  ('bebidas alcoólicas', 'sensivel', 10),
  ('suplementos, medicamentos e procedimentos de saúde ou estética', 'sensivel', 11),
  ('crédito, investimentos e serviços financeiros', 'sensivel', 12),
  ('produtos para emagrecimento', 'sensivel', 13),
  ('saúde e bem-estar', 'aceita', 20),
  ('nutrição e alimentação', 'aceita', 21),
  ('beleza e estética', 'aceita', 22),
  ('moda e acessórios', 'aceita', 23),
  ('tecnologia', 'aceita', 24),
  ('mobilidade e automotivo', 'aceita', 25),
  ('imobiliário e construção', 'aceita', 26),
  ('cultura e experiências', 'aceita', 27),
  ('indústria', 'aceita', 28),
  ('outra categoria aceita', 'aceita', 29);

alter table public.categorias enable row level security;
create policy "ler categorias" on public.categorias for select to authenticated using (true);
create policy "editar categorias" on public.categorias for update to authenticated using (public.tenho_papel('direcao')) with check (public.tenho_papel('direcao'));
grant select on public.categorias to authenticated;
grant update (situacao) on public.categorias to authenticated;
grant all on public.categorias to service_role;

alter table public.empresas
  add column categoria text references public.categorias (nome) on update cascade,
  add column triagem1 jsonb not null default '{}',
  add column receita_situacao text check (receita_situacao in ('ativa', 'baixada', 'suspensa', 'inapta', 'nula')),
  add column receita_porte text check (receita_porte in ('ME', 'EPP', 'demais')),
  add column pedido_info_em date;

-- Itens da Triagem 1 (mesma lista de src/regras/triagem1.ts).
create function public.itens_triagem1() returns text[] language sql immutable as $$
  select array['formulario', 'cnpj', 'nome_cidade', 'site_instagram', 'portfolio', 'motivo', 'consentimento', 'categoria']
$$;

create function public.salvar_triagem1(empresa uuid, itens jsonb, categoria_escolhida text, situacao_receita text, porte_receita text)
returns void language plpgsql security definer set search_path = public as $$
declare
  atual public.etapa;
begin
  if not public.tenho_papel('primeira_pessoa', 'gerente') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  select etapa into atual from public.empresas where id = empresa;
  if atual not in ('recebida', 'triagem1') then
    raise exception 'A Triagem 1 só muda enquanto a empresa está em Recebida ou Triagem 1.';
  end if;
  if coalesce((itens->>'cnpj')::boolean, false) and coalesce(situacao_receita, '') <> 'ativa' then
    raise exception 'Empresa inativa';
  end if;
  update public.empresas set
    triagem1 = coalesce(itens, '{}'),
    categoria = nullif(categoria_escolhida, ''),
    receita_situacao = nullif(situacao_receita, ''),
    receita_porte = nullif(porte_receita, '')
  where id = empresa;
end $$;
revoke execute on function public.salvar_triagem1(uuid, jsonb, text, text, text) from anon;
grant execute on function public.salvar_triagem1(uuid, jsonb, text, text, text) to authenticated;

-- requisitos_etapa passa a despachar para requisitos_<etapa>(empresa), quando existir.
create or replace function public.requisitos_etapa(empresa uuid, para public.etapa) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  funcao regprocedure := to_regprocedure(format('public.requisitos_%s(uuid)', para));
  falta text;
begin
  if funcao is null then return null; end if;
  execute format('select %s($1)', funcao::regproc) into falta using empresa;
  return falta;
end $$;

create function public.requisitos_triagem2(empresa uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  e public.empresas;
  faltam text[];
  rotulos jsonb := '{"formulario":"formulário completo","cnpj":"CNPJ válido e ativo","nome_cidade":"nome e cidade conferem","site_instagram":"site ou Instagram conferido","portfolio":"portfólio abre","motivo":"motivo preenchido","consentimento":"consentimento marcado","categoria":"categoria aceita"}';
begin
  select * into e from public.empresas where id = empresa;
  select array_agg(rotulos->>i) into faltam
  from unnest(public.itens_triagem1()) i
  where coalesce((e.triagem1->>i)::boolean, false) is not true;
  if faltam is not null then
    return 'Conclua a lista da Triagem 1: ' || array_to_string(faltam, ', ') || '.';
  end if;
  if coalesce(e.receita_situacao, '') <> 'ativa' then return 'Empresa inativa'; end if;
  if exists (select 1 from public.categorias c where c.nome = e.categoria and c.situacao = 'nao_aceita') then
    return 'Categoria não aceita';
  end if;
  return null;
end $$;

-- Pedido de informação marca a data para contar os 7 dias.
create function public.marcar_pedido_info() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.modelo = 'PEDIDO_INFO' then
    update public.empresas set pedido_info_em = (new.em at time zone 'America/Sao_Paulo')::date where id = new.empresa_id;
  end if;
  return new;
end $$;
create trigger mensagens_pedido_info after insert on public.mensagens for each row execute function public.marcar_pedido_info();

