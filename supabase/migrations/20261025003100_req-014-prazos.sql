-- REQ-014 — Prazos e alertas

insert into public.parametros (chave, valor, descricao) values
  ('dias_escalar_direcao', '3', 'Dias úteis, depois do aviso à outra Gerente, até avisar a Direção (DP-1401).'),
  ('dias_empresa_parada', '5', 'Dias úteis na mesma etapa para a empresa aparecer como parada (DP-1402).');

alter table public.empresas add column alertas_enviados text[] not null default '{}';

create function public.hoje_sp() returns date language sql stable as $$
  select (now() at time zone 'America/Sao_Paulo')::date
$$;

create function public.data_sp(t timestamptz) returns date language sql stable as $$
  select (t at time zone 'America/Sao_Paulo')::date
$$;

-- Dias úteis no intervalo (inicio, fim].
create function public.dias_uteis_entre(inicio date, fim date) returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::int from generate_series(inicio + 1, fim, interval '1 day') d
  where extract(isodow from d) < 6 and not exists (select 1 from public.feriados f where f.data = d::date)
$$;

create function public.parametro_int(chave_pedida text, padrao integer) returns integer
language sql stable security definer set search_path = public as $$
  select coalesce((select (valor #>> '{}')::int from public.parametros where chave = chave_pedida), padrao)
$$;

create function public.contato_feito(e public.empresas) returns boolean
language sql stable security definer set search_path = public as $$
  select e.etapa not in ('triagem2') or exists (
    select 1 from public.mensagens m where m.empresa_id = e.id and m.autor_id = e.gerente1_id and m.em > e.passada_em)
$$;

-- Prazo atual de cada empresa em andamento (mesmo cálculo para a tela e para a rotina).
create function public.prazos_abertos(hoje date default public.hoje_sp())
returns table (empresa_id uuid, marca text, etapa public.etapa, descricao text, prazo date, responsavel_id uuid, papel_responsavel public.papel, situacao text)
language sql stable security definer set search_path = public as $$
  with p as (
    select e.id, e.marca, e.etapa,
      case
        when e.etapa in ('recebida', 'triagem1') then 'Triagem 1'
        when e.etapa = 'triagem2' and e.triagem2_concluida_em is null then 'Triagem 2'
        when e.etapa = 'triagem2' and e.passada_em is null then 'Passar à Gerente'
        when e.etapa = 'triagem2' and not public.contato_feito(e) then 'Contato da Gerente'
        when e.etapa = 'reuniao' and not coalesce((e.reuniao->>'realizada')::boolean, false) and e.reuniao->>'quando' is not null then 'Reunião'
        when e.etapa = 'proposta' and e.proposta->>'enviada_em' is null then 'Enviar a proposta'
        when e.etapa = 'proposta' and e.proposta->>'aceite_em' is null then 'Resposta da empresa'
        when e.etapa = 'direcao' then 'Decisão da Direção'
        when e.etapa = 'contrato' and e.contrato->>'enviado_juridico_em' is not null and e.contrato->>'pronto_em' is null then 'Minuta do Jurídico'
        when e.etapa = 'contrato' and e.contrato->>'pronto_em' is not null and e.contrato->>'assinado_em' is null then 'Assinatura'
      end as descricao,
      case
        when e.etapa in ('recebida', 'triagem1') then public.somar_dias_uteis(public.data_sp(e.etapa_desde), 1)
        when e.etapa = 'triagem2' and e.triagem2_concluida_em is null then public.somar_dias_uteis(public.data_sp(e.etapa_desde), 2)
        when e.etapa = 'triagem2' and e.passada_em is null then public.data_sp(e.triagem2_concluida_em)
        when e.etapa = 'triagem2' and not public.contato_feito(e) then public.somar_dias_uteis(public.data_sp(e.passada_em), 2)
        when e.etapa = 'reuniao' and not coalesce((e.reuniao->>'realizada')::boolean, false) and e.reuniao->>'quando' is not null then (e.reuniao->>'quando')::date
        when e.etapa = 'proposta' and e.proposta->>'enviada_em' is null then public.somar_dias_uteis(public.data_sp(e.etapa_desde), 2)
        when e.etapa = 'proposta' and e.proposta->>'aceite_em' is null then (e.proposta->>'prazo_resposta')::date
        when e.etapa = 'direcao' then (e.direcao->>'prazo')::date
        when e.etapa = 'contrato' and e.contrato->>'enviado_juridico_em' is not null and e.contrato->>'pronto_em' is null then (e.contrato->>'prazo_juridico')::date
        when e.etapa = 'contrato' and e.contrato->>'pronto_em' is not null and e.contrato->>'assinado_em' is null then (e.contrato->>'prazo_assinatura')::date
      end as prazo,
      case
        when e.etapa in ('recebida', 'triagem1') or (e.etapa = 'triagem2' and e.passada_em is null) then null
        when e.etapa = 'contrato' and e.contrato->>'pronto_em' is null then null
        when e.etapa = 'direcao' then null
        when e.etapa = 'contrato' then coalesce(e.gerente2_id, e.responsavel_id, e.gerente1_id)
        else coalesce(e.responsavel_id, e.gerente1_id)
      end as responsavel_id,
      case
        when e.etapa in ('recebida', 'triagem1') or (e.etapa = 'triagem2' and e.passada_em is null) then 'primeira_pessoa'::public.papel
        when e.etapa = 'direcao' then 'direcao'::public.papel
        when e.etapa = 'contrato' and e.contrato->>'pronto_em' is null then 'juridico'::public.papel
        else 'gerente'::public.papel
      end as papel_responsavel
    from public.empresas e
    where e.etapa in ('recebida', 'triagem1', 'triagem2', 'reuniao', 'proposta', 'direcao', 'contrato')
      and public.pode_ler_empresa(e.etapa)
  )
  select id, marca, etapa, descricao, prazo, responsavel_id, papel_responsavel,
    case when prazo < hoje then 'atrasado' when prazo = hoje then 'vence_hoje' else 'no_prazo' end
  from p where descricao is not null and prazo is not null
$$;
grant execute on function public.prazos_abertos(date) to authenticated;

create function public.alertar_uma_vez(empresa uuid, chave text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.empresas where id = empresa and chave = any (alertas_enviados)) then return false; end if;
  update public.empresas set alertas_enviados = alertas_enviados || chave where id = empresa;
  return true;
end $$;
revoke execute on function public.alertar_uma_vez(uuid, text) from anon, authenticated;

create function public.rotina_prazos(hoje date default public.hoje_sp()) returns integer
language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  p record;
  n integer := 0;
  escalar integer := public.parametro_int('dias_escalar_direcao', 3);
  parada integer := public.parametro_int('dias_empresa_parada', 5);
  du integer;
  ref date;
begin
  for e in select * from public.empresas loop
    -- Contato da Gerente: 2 d.u. sem contato → outra Gerente; mais N d.u. → Direção.
    if e.etapa = 'triagem2' and e.passada_em is not null and not public.contato_feito(e) then
      du := public.dias_uteis_entre(public.data_sp(e.passada_em), hoje);
      if du >= 2 and public.alertar_uma_vez(e.id, 'contato_outra_gerente') then
        perform public.avisar_usuario(g.id, e.id, 'prazo', 'Sem retorno à ' || e.marca || ' há ' || du || ' dias úteis (Gerente ' ||
          regexp_replace(coalesce((select nome from public.perfis where id = e.gerente1_id), '—'), '\s*\(exemplo\)$', '') || '). Você pode assumir o contato.')
        from public.perfis g where g.papel = 'gerente' and g.ativo and g.id <> e.gerente1_id;
        n := n + 1;
      end if;
      if du >= 2 + escalar and public.alertar_uma_vez(e.id, 'contato_direcao') then
        perform public.avisar_papel('direcao', e.id, 'prazo', 'A ' || e.marca || ' está sem retorno da Gerente há ' || du || ' dias úteis.');
        n := n + 1;
      end if;
    end if;

    -- Direção sem resposta no prazo: novo aviso e lembrete à Gerente para informar a empresa.
    if e.etapa = 'direcao' and (e.direcao->>'prazo')::date < hoje and public.alertar_uma_vez(e.id, 'direcao_vencida:' || (e.direcao->>'levada_em')) then
      perform public.avisar_papel('direcao', e.id, 'prazo', 'Prazo vencido: decisão sobre ' || e.marca || ' era até ' || to_char((e.direcao->>'prazo')::date, 'DD/MM') || '.');
      perform public.avisar_usuario(coalesce(e.responsavel_id, e.gerente1_id), e.id, 'prazo', 'A Direção ainda não respondeu sobre ' || e.marca || '. Informe a empresa do novo prazo.');
      n := n + 1;
    end if;

    -- Empresa parada na mesma etapa.
    if e.etapa in ('recebida', 'triagem1', 'triagem2', 'reuniao', 'proposta', 'direcao', 'contrato')
       and public.dias_uteis_entre(public.data_sp(e.etapa_desde), hoje) > parada
       and public.alertar_uma_vez(e.id, 'parada:' || e.etapa || ':' || public.data_sp(e.etapa_desde)) then
      perform public.avisar_papel('primeira_pessoa', e.id, 'parada', e.marca || ' está parada na mesma etapa há mais de ' || parada || ' dias úteis.');
      n := n + 1;
    end if;

    -- Véspera da reunião (REQ-008).
    if e.etapa = 'reuniao' and (e.reuniao->>'quando')::date = hoje + 1 and not coalesce((e.reuniao->>'realizada')::boolean, false)
       and public.alertar_uma_vez(e.id, 'vespera:' || (e.reuniao->>'quando')) then
      perform public.avisar_usuario(e.gerente1_id, e.id, 'reuniao', 'Confirme hoje a reunião de amanhã com ' || e.marca || '.');
      n := n + 1;
    end if;

    -- Em espera: chegou a data de retomar (DP-0402).
    if e.etapa = 'espera' and e.retomar_em <= hoje and public.alertar_uma_vez(e.id, 'retomar:' || e.retomar_em) then
      perform public.avisar_papel('primeira_pessoa', e.id, 'retomar', 'Hora de retomar o contato com ' || e.marca || ' (em espera desde ' || to_char(public.data_sp(e.etapa_desde), 'DD/MM/YYYY') || ').');
      n := n + 1;
    end if;
  end loop;

  -- Relatório mensal de Ouro e Master: depois do dia 10, o do mês anterior precisa estar enviado (REQ-011).
  if extract(day from hoje) > 10 then
    ref := (date_trunc('month', hoje) - interval '1 month')::date;
    for p in select pa.*, emp.marca from public.parcerias pa join public.empresas emp on emp.id = pa.empresa_id
             where pa.situacao = 'vigente' and pa.padrao in ('ouro', 'master') and date_trunc('month', pa.inicio)::date <= ref
               and not exists (select 1 from public.relatorios r where r.parceria_id = pa.id and r.tipo = 'relatorio' and r.referencia = ref) loop
      if public.alertar_uma_vez(p.empresa_id, 'relatorio:' || ref) then
        perform public.avisar_usuario(p.responsavel_id, p.empresa_id, 'relatorio', 'Relatório de ' || to_char(ref, 'MM/YYYY') || ' da ' || p.marca || ' atrasado (era até o dia 10).');
        n := n + 1;
      end if;
    end loop;
  end if;
  return n;
end $$;
revoke execute on function public.rotina_prazos(date) from anon, authenticated;
select cron.schedule('rotina-prazos', '10 9 * * *', 'select public.rotina_prazos()');
