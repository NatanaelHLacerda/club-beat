-- REQ-004 — Funil de parcerias

create type public.etapa as enum (
  'recebida', 'triagem1', 'triagem2', 'reuniao', 'proposta', 'direcao',
  'contrato', 'ativa', 'renovacao', 'encerrada', 'espera', 'recusada'
);
create type public.origem as enum (
  'site', 'indicacao_membro', 'indicacao_funcionario', 'indicacao_direcao', 'whatsapp', 'email', 'contato_direto'
);
create type public.porte as enum ('pequena', 'media1', 'media2', 'grande');
create type public.padrao as enum ('bronze', 'prata', 'ouro', 'master');

create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  -- Bloco 1 · Sobre a empresa
  cnpj text not null unique check (cnpj ~ '^[0-9]{14}$'),
  razao_social text not null,
  marca text not null,
  cidade text,
  uf text check (uf is null or uf ~ '^[A-Z]{2}$'),
  bairro text,
  segmento text not null,
  site text,
  instagram text,
  tempo_atuacao text,
  faixa_faturamento text,
  faixa_funcionarios text,
  unidades integer check (unidades is null or unidades >= 0),
  -- Bloco 2 · Responsável
  contato_nome text not null,
  contato_cargo text,
  contato_whatsapp text,
  contato_email text,
  quem_decide text,
  -- Bloco 3 · Sobre a parceria
  busca text[] not null default '{}',
  motivo_parceria text,
  objetivo text,
  publico text,
  parcerias_anteriores text,
  investimento_faixa text,
  inicio_desejado text,
  duracao text,
  datas_interesse text,
  -- Origem e consentimento
  origem public.origem not null,
  indicado_por text,
  consentimento_em timestamptz,
  -- Funil
  etapa public.etapa not null default 'recebida',
  etapa_desde timestamptz not null default now(),
  motivo_saida text,
  retomar_em date,
  gerente1_id uuid references public.perfis (id),
  gerente2_id uuid references public.perfis (id),
  responsavel_id uuid references public.perfis (id),
  -- Classificação (preenchida no REQ-006)
  porte public.porte,
  padrao_final public.padrao,
  exemplo boolean not null default false,
  criado_em timestamptz not null default now(),
  criado_por uuid references public.perfis (id) default auth.uid()
);
create index on public.empresas (etapa);
create index on public.empresas (criado_em desc);

create table public.historico (
  id bigint generated always as identity primary key,
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  tipo text not null check (tipo in ('etapa', 'nota', 'edicao', 'mensagem', 'sistema')),
  de_etapa public.etapa,
  para_etapa public.etapa,
  campos text[],
  texto text,
  autor_id uuid references public.perfis (id) default auth.uid(),
  em timestamptz not null default now()
);
create index on public.historico (empresa_id, em desc);

create table public.anexos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  tipo text not null check (tipo in ('portfolio', 'apresentacao', 'logotipo', 'aceite', 'minuta', 'contrato', 'entrega', 'outro')),
  caminho text not null unique,
  nome text not null,
  tamanho bigint not null check (tamanho >= 0),
  autor_id uuid references public.perfis (id) default auth.uid(),
  criado_em timestamptz not null default now()
);
create index on public.anexos (empresa_id);

-- Quem lê cada empresa: 1ª pessoa, Gerente e Direção tudo; os demais a partir da etapa em que são acionados.
create function public.pode_ler_empresa(e public.etapa) returns boolean
language sql stable security definer set search_path = public as $$
  select case public.meu_papel()
    when 'primeira_pessoa' then true
    when 'gerente' then true
    when 'direcao' then true
    when 'juridico' then e in ('contrato', 'ativa', 'renovacao', 'encerrada')
    when 'financeiro' then e in ('proposta', 'direcao', 'contrato', 'ativa', 'renovacao', 'encerrada')
    when 'operacoes' then e in ('proposta', 'direcao', 'contrato', 'ativa', 'renovacao', 'encerrada')
    else false
  end
$$;

create function public.pode_ler_empresa_id(empresa uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select public.pode_ler_empresa(etapa) from public.empresas where id = empresa), false)
$$;

alter table public.empresas enable row level security;
alter table public.historico enable row level security;
alter table public.anexos enable row level security;

create policy "ler empresas" on public.empresas for select to authenticated using (public.pode_ler_empresa(etapa));
create policy "criar empresas" on public.empresas for insert to authenticated
  with check (public.tenho_papel('primeira_pessoa', 'gerente') and etapa = 'recebida');
create policy "editar empresas" on public.empresas for update to authenticated
  using (public.tenho_papel('primeira_pessoa', 'gerente')) with check (public.tenho_papel('primeira_pessoa', 'gerente'));

create policy "ler histórico" on public.historico for select to authenticated using (public.pode_ler_empresa_id(empresa_id));
create policy "anotar" on public.historico for insert to authenticated
  with check (tipo = 'nota' and autor_id = auth.uid() and public.pode_ler_empresa_id(empresa_id));

create policy "ler anexos" on public.anexos for select to authenticated using (public.pode_ler_empresa_id(empresa_id));
create policy "anexar" on public.anexos for insert to authenticated
  with check (autor_id = auth.uid() and public.pode_ler_empresa_id(empresa_id));

grant select, insert on public.empresas to authenticated;
grant update (
  cnpj, razao_social, marca, cidade, uf, bairro, segmento, site, instagram, tempo_atuacao, faixa_faturamento,
  faixa_funcionarios, unidades, contato_nome, contato_cargo, contato_whatsapp, contato_email, quem_decide,
  busca, motivo_parceria, objetivo, publico, parcerias_anteriores, investimento_faixa, inicio_desejado, duracao,
  datas_interesse, origem, indicado_por
) on public.empresas to authenticated;
grant select, insert on public.historico to authenticated;
grant select, insert on public.anexos to authenticated;
grant all on public.empresas, public.historico, public.anexos to service_role;

-- O que cada etapa exige para receber o card. Os REQs seguintes recriam esta função acrescentando regras.
create function public.requisitos_etapa(empresa uuid, para public.etapa) returns text
language plpgsql stable security definer set search_path = public as $$
begin
  return null;
end $$;

create function public.mover_etapa(empresa uuid, para public.etapa, motivo text default null, retomar date default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  atual public.etapa;
  falta text;
begin
  if not public.tenho_papel('primeira_pessoa', 'gerente') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  select etapa into atual from public.empresas where id = empresa for update;
  if atual is null then raise exception 'Empresa não encontrada.'; end if;
  if atual = para then return; end if;
  if para = 'ativa' then
    raise exception 'A parceria só fica ativa ao registrar a assinatura do contrato.';
  end if;
  if para = 'direcao' then
    raise exception 'O caso vai para a Direção pela porta da Direção, na proposta.';
  end if;
  if para in ('espera', 'recusada') and atual in ('ativa', 'renovacao', 'encerrada') then
    raise exception 'Parceria ativa não sai do funil por aqui: use a renovação ou o encerramento.';
  end if;
  if para in ('espera', 'recusada') and coalesce(trim(motivo), '') = '' then
    raise exception 'Informe o motivo da saída.';
  end if;
  if para = 'espera' and retomar is null then
    raise exception 'Informe a data para retomar.';
  end if;
  falta := public.requisitos_etapa(empresa, para);
  if falta is not null then raise exception '%', falta; end if;

  update public.empresas set
    etapa = para,
    etapa_desde = now(),
    motivo_saida = case when para in ('espera', 'recusada') then trim(motivo) else null end,
    retomar_em = case when para = 'espera' then retomar else null end
  where id = empresa;

  insert into public.historico (empresa_id, tipo, de_etapa, para_etapa, texto, autor_id)
  values (empresa, 'etapa', atual, para,
    case when para = 'espera' then trim(motivo) || ' · retomar em ' || to_char(retomar, 'DD/MM/YYYY')
         when para = 'recusada' then trim(motivo) end,
    auth.uid());
end $$;
revoke execute on function public.mover_etapa(uuid, public.etapa, text, date) from anon;
grant execute on function public.mover_etapa(uuid, public.etapa, text, date) to authenticated;
grant execute on function public.pode_ler_empresa(public.etapa), public.pode_ler_empresa_id(uuid), public.requisitos_etapa(uuid, public.etapa) to authenticated;

-- Toda edição de dados da empresa vira um item da linha do tempo, com autor e campos alterados.
create function public.registrar_edicao() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  mudou text[];
begin
  select array_agg(n.key order by n.key) into mudou
  from jsonb_each(to_jsonb(new)) n
  join jsonb_each(to_jsonb(old)) o using (key)
  where n.value is distinct from o.value
    and n.key not in ('etapa', 'etapa_desde', 'motivo_saida', 'retomar_em');
  if mudou is not null then
    insert into public.historico (empresa_id, tipo, campos, autor_id) values (new.id, 'edicao', mudou, auth.uid());
  end if;
  return new;
end $$;
create trigger empresas_edicao after update on public.empresas for each row execute function public.registrar_edicao();

create function public.registrar_criacao() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.historico (empresa_id, tipo, para_etapa, texto, autor_id)
  values (new.id, 'sistema', new.etapa, 'Empresa recebida', auth.uid());
  return new;
end $$;
create trigger empresas_criacao after insert on public.empresas for each row execute function public.registrar_criacao();

-- Anexos: bucket privado, caminho empresa/<id>/<arquivo>.
insert into storage.buckets (id, name, public, file_size_limit) values ('anexos', 'anexos', false, 20971520);

create policy "ler arquivos de anexos" on storage.objects for select to authenticated
  using (bucket_id = 'anexos' and public.pode_ler_empresa_id((storage.foldername(name))[2]::uuid));
create policy "enviar arquivos de anexos" on storage.objects for insert to authenticated
  with check (bucket_id = 'anexos' and public.pode_ler_empresa_id((storage.foldername(name))[2]::uuid));
