-- REQ-008 — Reunião e proposta

create table public.cardapio (
  padrao public.padrao not null,
  item text not null,
  rotulo text not null,
  descricao text not null,
  maximo integer check (maximo is null or maximo >= 0),
  ordem integer not null,
  primary key (padrao, item)
);

-- Quantidades dos contratos atuais do Club (cap. 8). A Direção confirma as finais (DP-0801).
insert into public.cardapio (padrao, item, rotulo, descricao, maximo, ordem) values
  ('bronze', 'telas', 'Telas do Club', 'Junto com outras marcas, sem tempo garantido', 1, 1),
  ('bronze', 'ativacao_1d', 'Ativações de 1 dia', 'Até 2 por ano', 2, 3),
  ('bronze', 'redes', 'Redes sociais', 'Poucas divulgações', null, 6),
  ('bronze', 'relatorio', 'Relatório', 'Resumo a cada 3 meses', 1, 11),
  ('prata', 'telas', 'Telas do Club', 'Tempo mínimo garantido por dia', 1, 1),
  ('prata', 'ativacao_1d', 'Ativações de 1 dia', 'Até 4 por ano', 4, 3),
  ('prata', 'ativacao_3d', 'Ativações de até 3 dias', 'Até 1 por ano', 1, 4),
  ('prata', 'redes', 'Redes sociais', 'Poucas divulgações', null, 6),
  ('prata', 'eventos', 'Eventos do Club', 'Convite com 30 dias de antecedência, com taxa de participação (R$ …)', 1, 7),
  ('prata', 'beneficio_colaboradores', 'Benefício para colaboradores', 'Desconto ou isenção da taxa de entrada, sujeito à análise do Club (nunca a mensalidade)', 1, 8),
  ('prata', 'exclusividade', 'Exclusividade na categoria', 'Opcional, só em área local, com valor e prazo (R$ …). Passa pela Direção', 1, 9),
  ('prata', 'relatorio', 'Relatório', 'Resumo a cada 3 meses', 1, 11),
  ('ouro', 'telas', 'Telas do Club', 'Tempo mínimo por dia e tela da sala de ciclismo nos dias de ativação', 1, 1),
  ('ouro', 'marca_site', 'Marca no site', 'No rodapé do site do Club', 1, 2),
  ('ouro', 'ativacao_1d', 'Ativações de 1 dia', 'Até 8 por ano', 8, 3),
  ('ouro', 'ativacao_3d', 'Ativações de até 3 dias', 'Até 2 por ano', 2, 4),
  ('ouro', 'ativacao_4d', 'Ativações grandes de até 4 dias', 'Até 2 por ano', 2, 5),
  ('ouro', 'redes', 'Redes sociais', '… publicações, definidas por tempo de contrato', null, 6),
  ('ouro', 'eventos', 'Eventos do Club', 'Convite com 30 dias de antecedência e espaço da marca sem taxa extra', 1, 7),
  ('ouro', 'beneficio_colaboradores', 'Benefício para colaboradores', 'Isenção da taxa de entrada, sujeito à análise do Club (nunca a mensalidade)', 1, 8),
  ('ouro', 'exclusividade', 'Exclusividade na categoria', 'Por área de atuação, só com contrato assinado', 1, 9),
  ('ouro', 'relatorio', 'Relatório', 'Todo mês até o dia 10 e balanço a cada 3 meses', 1, 11),
  ('master', 'telas', 'Telas do Club', 'Maior tempo por dia e prioridade de exibição', 1, 1),
  ('master', 'marca_site', 'Marca no site', 'Com maior destaque', 1, 2),
  ('master', 'ativacao_1d', 'Ativações', 'Calendário próprio, combinado com a Direção', null, 3),
  ('master', 'redes', 'Redes sociais', '… publicações, definidas por tempo de contrato', null, 6),
  ('master', 'eventos', 'Eventos do Club', 'Espaço de destaque sem taxa extra', 1, 7),
  ('master', 'beneficio_colaboradores', 'Benefício para colaboradores', 'Igual ao Ouro', 1, 8),
  ('master', 'exclusividade', 'Exclusividade na categoria', 'Por área de atuação', 1, 9),
  ('master', 'marca_recepcao', 'Marca na recepção', 'Espaço principal de marca na entrada do Club, exclusivo', 1, 10),
  ('master', 'relatorio', 'Relatório', 'Todo mês até o dia 10 e balanço a cada 3 meses', 1, 11);

alter table public.cardapio enable row level security;
create policy "ler cardápio" on public.cardapio for select to authenticated using (true);
create policy "editar cardápio" on public.cardapio for update to authenticated using (public.tenho_papel('direcao')) with check (public.tenho_papel('direcao'));
grant select on public.cardapio to authenticated;
grant update (descricao, maximo) on public.cardapio to authenticated;
grant all on public.cardapio to service_role;

alter table public.empresas
  add column reuniao jsonb not null default '{}',
  add column formato text check (formato in ('continua', 'pontual', 'evento', 'aula_fechada')),
  add column tipo_parceria text check (tipo_parceria in ('patrocinio', 'industria', 'servico', 'troca')),
  add column proposta jsonb not null default '{}',
  add column operacoes jsonb not null default '{}';

create function public.salvar_reuniao(empresa uuid, dados jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.tenho_papel('gerente') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  if (select etapa from public.empresas where id = empresa) not in ('triagem2', 'reuniao', 'proposta') then
    raise exception 'A reunião é registrada entre a Triagem 2 e a proposta.';
  end if;
  update public.empresas set reuniao = coalesce(dados, '{}') where id = empresa;
end $$;

create function public.salvar_proposta(empresa uuid, dados jsonb, formato_novo text, tipo_novo text)
returns void language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  it jsonb;
  c public.cardapio;
begin
  if not public.tenho_papel('gerente') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  select * into e from public.empresas where id = empresa for update;
  if e.etapa not in ('reuniao', 'proposta', 'direcao') then raise exception 'A proposta é montada depois da reunião.'; end if;
  if e.proposta ? 'enviada_em' and e.proposta->>'enviada_em' is not null then
    raise exception 'A proposta já foi enviada. Registre o aceite ou trate a contraproposta.';
  end if;
  for it in select * from jsonb_array_elements(coalesce(dados->'itens', '[]')) loop
    select * into c from public.cardapio where padrao = coalesce(e.padrao_final, 'bronze') and item = it->>'item';
    if c.item is null then
      raise exception 'Fora do cardápio do padrão: %. Descreva em "fora do cardápio" para a Direção.', it->>'item';
    end if;
    if c.maximo is not null and coalesce((it->>'quantidade')::int, 0) > c.maximo then
      raise exception 'Acima do máximo do padrão: % até %.', c.rotulo, c.maximo;
    end if;
  end loop;
  update public.empresas set
    proposta = coalesce(dados, '{}') - 'enviada_em' - 'prazo_resposta' - 'aceite_em'
      || jsonb_build_object('direcao_aprovada_em', e.proposta->'direcao_aprovada_em'),
    formato = nullif(formato_novo, ''),
    tipo_parceria = nullif(tipo_novo, ''),
    -- Mudou a proposta: Operações confirma de novo.
    operacoes = case when e.proposta->'itens' is distinct from dados->'itens' then '{}'::jsonb else e.operacoes end
  where id = empresa;
end $$;

create function public.confirmar_operacoes(empresa uuid, dados jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.tenho_papel('operacoes') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  if (select etapa from public.empresas where id = empresa) not in ('proposta', 'direcao') then
    raise exception 'Operações confirma propostas em montagem.';
  end if;
  if coalesce((dados->>'capacidade')::boolean, false) is not true or coalesce((dados->>'equipe')::boolean, false) is not true
     or coalesce((dados->>'espaco_horario')::boolean, false) is not true then
    raise exception 'Confirme capacidade, equipe e espaço e horário.';
  end if;
  update public.empresas set operacoes = dados || jsonb_build_object('confirmada_em', now(), 'confirmada_por', auth.uid()) where id = empresa;
  insert into public.historico (empresa_id, tipo, texto, autor_id) values (empresa, 'sistema', 'Operações confirmou a viabilidade da proposta', auth.uid());
  perform public.avisar_usuario((select coalesce(responsavel_id, gerente1_id) from public.empresas where id = empresa), empresa,
    'operacoes', 'Operações confirmou a proposta de ' || (select marca from public.empresas where id = empresa) || '.');
end $$;

-- O que obriga a Direção (cap. 9). Lista vazia: a Gerente fecha sozinha.
create function public.motivos_direcao(empresa uuid) returns text[]
language plpgsql stable security definer set search_path = public as $$
declare
  e public.empresas;
  m text[] := '{}';
begin
  select * into e from public.empresas where id = empresa;
  if e.padrao_final in ('ouro', 'master') then m := m || 'padrão ' || public.rotulo_padrao(e.padrao_final); end if;
  if e.candidata_master then m := m || 'candidata a Master'::text; end if;
  if coalesce(trim(e.proposta->>'fora_do_cardapio'), '') <> '' then m := m || 'fora do cardápio'::text; end if;
  if coalesce(trim(e.proposta->>'exclusividade_categoria'), '') <> '' then m := m || 'exclusividade'::text; end if;
  if e.tipo_parceria = 'servico' then m := m || 'o Club paga (parceria de serviço)'::text; end if;
  if exists (select 1 from public.categorias c where c.nome = e.categoria and c.situacao = 'sensivel') then m := m || 'categoria sensível'::text; end if;
  if coalesce((e.proposta->>'nao_pode_perder')::boolean, false) then m := m || 'parceiro que não pode perder'::text; end if;
  return m;
end $$;
grant execute on function public.motivos_direcao(uuid) to authenticated;

create function public.enviar_proposta(empresa uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  motivos text[];
begin
  if not public.tenho_papel('gerente') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  select * into e from public.empresas where id = empresa for update;
  if e.etapa <> 'proposta' then raise exception 'A empresa precisa estar em "Em proposta".'; end if;
  if jsonb_array_length(coalesce(e.proposta->'itens', '[]')) = 0 then raise exception 'Escolha as contrapartidas da proposta.'; end if;
  if e.operacoes->>'confirmada_em' is null then raise exception 'Operações precisa confirmar a viabilidade antes do envio.'; end if;
  motivos := public.motivos_direcao(empresa);
  if cardinality(motivos) > 0 and e.proposta->>'direcao_aprovada_em' is null then
    raise exception 'Esta proposta precisa da Direção antes de sair: %.', array_to_string(motivos, ', ');
  end if;
  update public.empresas set proposta = proposta || jsonb_build_object('enviada_em', now(), 'prazo_resposta', current_date + 7)
  where id = empresa;
  insert into public.historico (empresa_id, tipo, texto, autor_id)
  values (empresa, 'sistema', 'Proposta enviada · resposta até ' || to_char(current_date + 7, 'DD/MM/YYYY'), auth.uid());
end $$;

create function public.registrar_aceite(empresa uuid) returns public.etapa
language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  motivos text[];
  destino public.etapa;
begin
  if not public.tenho_papel('gerente') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  select * into e from public.empresas where id = empresa for update;
  if e.etapa <> 'proposta' then raise exception 'A empresa precisa estar em "Em proposta".'; end if;
  if not exists (select 1 from public.anexos where empresa_id = empresa and tipo = 'aceite') then
    raise exception 'Anexe o aceite por escrito (e-mail basta).';
  end if;
  motivos := public.motivos_direcao(empresa);
  destino := case when cardinality(motivos) > 0 and e.proposta->>'direcao_aprovada_em' is null then 'direcao' else 'contrato' end;
  update public.empresas set etapa = destino, etapa_desde = now(), proposta = proposta || jsonb_build_object('aceite_em', now())
  where id = empresa;
  insert into public.historico (empresa_id, tipo, de_etapa, para_etapa, texto, autor_id)
  values (empresa, 'etapa', 'proposta', destino,
    'Aceite registrado' || case when destino = 'direcao' then ' · precisa da Direção: ' || array_to_string(motivos, ', ') else '' end, auth.uid());
  return destino;
end $$;

revoke execute on function public.salvar_reuniao(uuid, jsonb), public.salvar_proposta(uuid, jsonb, text, text),
  public.confirmar_operacoes(uuid, jsonb), public.enviar_proposta(uuid), public.registrar_aceite(uuid) from anon;
grant execute on function public.salvar_reuniao(uuid, jsonb), public.salvar_proposta(uuid, jsonb, text, text),
  public.confirmar_operacoes(uuid, jsonb), public.enviar_proposta(uuid), public.registrar_aceite(uuid) to authenticated;

create or replace function public.requisitos_reuniao(empresa uuid) returns text
language sql stable security definer set search_path = public as $$
  select case
    when e.triagem2_concluida_em is null then 'Conclua a Triagem 2 antes de marcar a reunião.'
    when e.gerente1_id is null then 'Passe a empresa à Gerente antes de marcar a reunião.'
    when coalesce(e.reuniao->>'quando', '') = '' or coalesce(trim(e.reuniao->>'local'), '') = '' then 'Informe a data e o local da reunião.'
  end
  from public.empresas e where e.id = empresa
$$;

create function public.requisitos_proposta(empresa uuid) returns text
language sql stable security definer set search_path = public as $$
  select case when coalesce((e.reuniao->>'realizada')::boolean, false) is not true
    then 'Registre a reunião como realizada antes da proposta.' end
  from public.empresas e where e.id = empresa
$$;

-- Reserva de data: sem proposta montada ainda (reunião) ou proposta com ativação ou evento.
create or replace function public.empresa_preve_acao(empresa uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select jsonb_array_length(coalesce(e.proposta->'itens', '[]')) = 0
    or exists (select 1 from jsonb_array_elements(e.proposta->'itens') i
               where i->>'item' in ('ativacao_1d', 'ativacao_3d', 'ativacao_4d', 'eventos') and coalesce((i->>'quantidade')::int, 1) > 0)
  from public.empresas e where e.id = empresa
$$;
