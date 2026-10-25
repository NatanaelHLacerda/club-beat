-- REQ-007 — Distribuição entre Gerentes e passagem de bastão

alter table public.empresas
  add column passada_em timestamptz,
  add column distribuicao text check (distribuicao in ('revezamento', 'manual')),
  add column passagem jsonb not null default '{}';

-- Próxima Gerente no revezamento: a seguinte (por nome) à que recebeu a última passagem por revezamento.
create function public.sugerir_gerente() returns uuid
language plpgsql stable security definer set search_path = public as $$
declare
  gerentes uuid[];
  ultima uuid;
  pos int;
begin
  select array_agg(id order by nome, id) into gerentes from public.perfis where papel = 'gerente' and ativo and disponivel;
  if gerentes is null then return null; end if;
  select gerente1_id into ultima from public.empresas
  where distribuicao = 'revezamento' and passada_em is not null order by passada_em desc limit 1;
  pos := array_position(gerentes, ultima);
  if pos is null then return gerentes[1]; end if;
  return gerentes[(pos % array_length(gerentes, 1)) + 1];
end $$;
grant execute on function public.sugerir_gerente() to authenticated;

create function public.passar_a_gerente(empresa uuid, gerente uuid, motivo text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  sugerida uuid;
  nome_gerente text;
begin
  if not public.tenho_papel('primeira_pessoa', 'gerente') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtext('revezamento'));
  select * into e from public.empresas where id = empresa for update;
  if e.triagem2_concluida_em is null then raise exception 'Conclua a Triagem 2 antes de passar à Gerente.'; end if;
  if e.passada_em is not null then raise exception 'Esta empresa já foi passada à Gerente.'; end if;
  sugerida := public.sugerir_gerente();
  if gerente is null then gerente := sugerida; end if;
  if gerente is null then raise exception 'Nenhuma Gerente disponível.'; end if;
  if not exists (select 1 from public.perfis where id = gerente and papel = 'gerente' and ativo) then
    raise exception 'Escolha uma Gerente de Negócios ativa.';
  end if;
  if gerente is distinct from sugerida and coalesce(trim(motivo), '') = '' then
    raise exception 'Informe o motivo da troca.';
  end if;
  update public.empresas set
    gerente1_id = gerente, responsavel_id = gerente, passada_em = now(),
    distribuicao = case when gerente = sugerida then 'revezamento' else 'manual' end
  where id = empresa;
  select regexp_replace(nome, '\s*\(exemplo\)$', '') into nome_gerente from public.perfis where id = gerente;
  insert into public.historico (empresa_id, tipo, texto, autor_id)
  values (empresa, 'sistema', 'Passada à Gerente ' || nome_gerente ||
    case when gerente = sugerida then ' (revezamento)' else ' · troca: ' || trim(motivo) end, auth.uid());
  perform public.enviar_modelo_automatico(empresa, 'A2');
  perform public.avisar_usuario(gerente, empresa, 'nova_empresa',
    'Nova empresa para você: ' || e.marca || coalesce(' (' || public.rotulo_padrao(e.padrao_final) || ')', '') ||
    '. Contato em até 2 dias úteis.');
end $$;

create function public.definir_gerente2(empresa uuid, gerente uuid, ficha jsonb, responsavel uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  faltam text[];
begin
  if not public.tenho_papel('primeira_pessoa', 'gerente') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  select * into e from public.empresas where id = empresa for update;
  if e.gerente1_id is null then raise exception 'Passe a empresa à Gerente 1 primeiro.'; end if;
  if not exists (select 1 from public.perfis where id = gerente and papel = 'gerente' and ativo) then
    raise exception 'Escolha uma Gerente de Negócios ativa.';
  end if;
  if responsavel not in (e.gerente1_id, gerente) then raise exception 'O responsável final é uma das duas Gerentes.'; end if;
  if gerente <> e.gerente1_id then
    select array_agg(c) into faltam
    from unnest(array['busca', 'apresentado', 'pediu_mais', 'prometido_rever', 'datas_interesse', 'precisa_direcao', 'prazo_retorno']) c
    where coalesce(trim(ficha->>c), '') = '';
    if faltam is not null then raise exception 'Preencha a ficha de passagem antes de definir a Gerente 2.'; end if;
  end if;
  update public.empresas set gerente2_id = gerente, responsavel_id = responsavel, passagem = coalesce(ficha, '{}') where id = empresa;
  if gerente <> e.gerente1_id then
    perform public.avisar_usuario(gerente, empresa, 'passagem', 'Você finaliza a parceria com ' || e.marca || '. A ficha de passagem está na empresa.');
  end if;
end $$;

revoke execute on function public.passar_a_gerente(uuid, uuid, text), public.definir_gerente2(uuid, uuid, jsonb, uuid) from anon;
grant execute on function public.passar_a_gerente(uuid, uuid, text), public.definir_gerente2(uuid, uuid, jsonb, uuid) to authenticated;

create or replace function public.requisitos_reuniao(empresa uuid) returns text
language sql stable security definer set search_path = public as $$
  select case
    when e.triagem2_concluida_em is null then 'Conclua a Triagem 2 antes de marcar a reunião.'
    when e.gerente1_id is null then 'Passe a empresa à Gerente antes de marcar a reunião.'
  end
  from public.empresas e where e.id = empresa
$$;
