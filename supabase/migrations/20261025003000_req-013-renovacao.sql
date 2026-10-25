-- REQ-013 — Renovação ou encerramento

alter table public.parcerias add column renovacao jsonb not null default '{}';

-- Rotina diária: 90 dias → Em renovação + A6; lembretes aos 60 e 30 dias; parceria vencida sem renovação é encerrada.
create function public.rotina_renovacoes(hoje date default current_date) returns integer
language plpgsql security definer set search_path = public as $$
declare
  p record;
  faltam integer;
  n integer := 0;
  gerente uuid;
  email_gerente text;
begin
  for p in
    select pa.*, e.marca, e.etapa, e.responsavel_id as resp_empresa, e.gerente1_id
    from public.parcerias pa join public.empresas e on e.id = pa.empresa_id
    where pa.situacao = 'vigente'
  loop
    faltam := p.fim - hoje;
    gerente := coalesce(p.responsavel_id, p.resp_empresa, p.gerente1_id);

    if faltam < 0 then
      update public.parcerias set situacao = 'encerrada', exclusividade_fim = least(coalesce(exclusividade_fim, p.fim), p.fim) where id = p.id;
      if not exists (select 1 from public.parcerias o where o.empresa_id = p.empresa_id and o.situacao = 'vigente' and o.id <> p.id)
         and p.etapa in ('ativa', 'renovacao') then
        update public.empresas set etapa = 'encerrada', etapa_desde = now() where id = p.empresa_id;
        insert into public.historico (empresa_id, tipo, de_etapa, para_etapa, texto) values (p.empresa_id, 'etapa', p.etapa, 'encerrada', 'Contrato terminou sem renovação assinada');
      end if;
      n := n + 1;
      continue;
    end if;
    if p.renovacao->>'decidida_em' is not null then continue; end if;

    if faltam <= 90 and p.renovacao->>'aviso90_em' is null then
      if p.etapa = 'ativa' then
        update public.empresas set etapa = 'renovacao', etapa_desde = now() where id = p.empresa_id;
        insert into public.historico (empresa_id, tipo, de_etapa, para_etapa, texto) values (p.empresa_id, 'etapa', 'ativa', 'renovacao', 'Contrato termina em ' || to_char(p.fim, 'DD/MM/YYYY'));
      end if;
      select email into email_gerente from public.perfis where id = gerente;
      perform public.enviar_modelo_automatico(p.empresa_id, 'A6', p.fim, email_gerente);
      perform public.avisar_usuario(gerente, p.empresa_id, 'renovacao', 'A parceria com ' || p.marca || ' termina em ' || to_char(p.fim, 'DD/MM/YYYY') || '. Avalie: renovar, mudar de padrão ou encerrar.');
      update public.parcerias set renovacao = renovacao || jsonb_build_object('aviso90_em', hoje) where id = p.id;
      n := n + 1;
    elsif faltam <= 60 and p.renovacao->>'aviso60_em' is null and p.renovacao->>'aviso90_em' is not null then
      perform public.avisar_usuario(gerente, p.empresa_id, 'renovacao', 'Lembrete: a parceria com ' || p.marca || ' termina em ' || faltam || ' dias e ainda não tem decisão.');
      update public.parcerias set renovacao = renovacao || jsonb_build_object('aviso60_em', hoje) where id = p.id;
      n := n + 1;
    elsif faltam <= 30 and p.renovacao->>'aviso30_em' is null and p.renovacao->>'aviso60_em' is not null then
      perform public.avisar_usuario(gerente, p.empresa_id, 'renovacao', 'Último lembrete: a parceria com ' || p.marca || ' termina em ' || faltam || ' dias e ainda não tem decisão.');
      update public.parcerias set renovacao = renovacao || jsonb_build_object('aviso30_em', hoje) where id = p.id;
      n := n + 1;
    end if;
  end loop;
  return n;
end $$;
revoke execute on function public.rotina_renovacoes(date) from anon, authenticated;
select cron.schedule('rotina-renovacoes', '5 9 * * *', 'select public.rotina_renovacoes()');

-- Abre a nova proposta da renovação, reaproveitando os dados da empresa.
create function public.abrir_proposta_de_renovacao(p public.parcerias, novo_padrao public.padrao) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.empresas set etapa = 'proposta', etapa_desde = now(),
    padrao_final = coalesce(novo_padrao, padrao_final),
    proposta = jsonb_build_object('itens', p.contrapartidas, 'promessa_revisao', p.promessa_revisao, 'renovacao_de', p.id),
    operacoes = '{}', contrato = '{}', direcao = '{}'
  where id = p.empresa_id;
  insert into public.historico (empresa_id, tipo, de_etapa, para_etapa, texto)
  values (p.empresa_id, 'etapa', 'renovacao', 'proposta', 'Renovação: nova proposta aberta (o contrato atual segue até ' || to_char(p.fim, 'DD/MM/YYYY') || ')');
end $$;
revoke execute on function public.abrir_proposta_de_renovacao(public.parcerias, public.padrao) from anon, authenticated;

create function public.decidir_renovacao(parceria uuid, caminho text, avaliacao jsonb, novo_padrao public.padrao default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  p public.parcerias;
  e public.empresas;
begin
  if not public.tenho_papel('gerente', 'direcao') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  if caminho not in ('renovar_igual', 'renovar_mais', 'mudar_padrao', 'encerrar') then raise exception 'Escolha o caminho.'; end if;
  if caminho = 'mudar_padrao' and novo_padrao is null then raise exception 'Escolha o novo padrão.'; end if;
  select * into p from public.parcerias where id = parceria for update;
  select * into e from public.empresas where id = p.empresa_id;
  if p.situacao <> 'vigente' then raise exception 'Esta parceria já terminou.'; end if;

  update public.parcerias set renovacao = renovacao || jsonb_build_object('avaliacao', coalesce(avaliacao, '{}'), 'caminho', caminho,
    'novo_padrao', novo_padrao) where id = parceria;

  -- Ouro e Master: a Direção decide.
  if (p.padrao in ('ouro', 'master') or novo_padrao in ('ouro', 'master')) and not public.tenho_papel('direcao') then
    update public.parcerias set renovacao = renovacao || jsonb_build_object('aguardando_direcao', true, 'proposta_por', auth.uid()) where id = parceria;
    insert into public.historico (empresa_id, tipo, texto, autor_id) values (p.empresa_id, 'sistema', 'Renovação proposta à Direção: ' || replace(caminho, '_', ' '), auth.uid());
    perform public.avisar_papel('direcao', p.empresa_id, 'renovacao', 'Decisão de renovação: ' || e.marca || ' (' || public.rotulo_padrao(p.padrao) || '), proposta: ' || replace(caminho, '_', ' ') || '.');
    return 'direcao';
  end if;

  update public.parcerias set renovacao = renovacao || jsonb_build_object('aguardando_direcao', false, 'decidida_em', now(), 'decidida_por', auth.uid())
  where id = parceria;
  if caminho = 'encerrar' then
    insert into public.historico (empresa_id, tipo, texto, autor_id) values (p.empresa_id, 'sistema', 'Decisão: encerrar ao fim do contrato', auth.uid());
    update public.parcerias set nao_renovar = true where id = parceria;
  else
    perform public.abrir_proposta_de_renovacao(p, case when caminho = 'mudar_padrao' then novo_padrao end);
  end if;
  return caminho;
end $$;

create function public.encerrar_parceria(parceria uuid, checklist jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  p public.parcerias;
  faltam int;
begin
  if not public.tenho_papel('gerente', 'direcao') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  select * into p from public.parcerias where id = parceria for update;
  if p.situacao <> 'vigente' then raise exception 'Esta parceria já terminou.'; end if;
  if p.renovacao->>'caminho' is distinct from 'encerrar' or p.renovacao->>'decidida_em' is null then
    raise exception 'Registre a decisão de encerrar antes.';
  end if;
  select count(*) into faltam from unnest(array['relatorio_final', 'agradecimento', 'marca_site', 'marca_telas']) i
  where coalesce((checklist->>i)::boolean, false) is not true;
  if faltam > 0 then raise exception 'Marque todos os itens do encerramento.'; end if;
  update public.parcerias set situacao = 'encerrada', nao_renovar = true,
    exclusividade_fim = case when exclusividade_categoria is not null then least(coalesce(exclusividade_fim, current_date), current_date) end,
    renovacao = renovacao || jsonb_build_object('encerramento', checklist, 'encerrada_em', now())
  where id = parceria;
  update public.empresas set etapa = 'encerrada', etapa_desde = now() where id = p.empresa_id;
  insert into public.historico (empresa_id, tipo, de_etapa, para_etapa, texto, autor_id)
  values (p.empresa_id, 'etapa', 'renovacao', 'encerrada', 'Parceria encerrada: relatório final enviado, marca retirada, exclusividade liberada', auth.uid());
end $$;

revoke execute on function public.decidir_renovacao(uuid, text, jsonb, public.padrao), public.encerrar_parceria(uuid, jsonb) from anon;
grant execute on function public.decidir_renovacao(uuid, text, jsonb, public.padrao), public.encerrar_parceria(uuid, jsonb) to authenticated;
