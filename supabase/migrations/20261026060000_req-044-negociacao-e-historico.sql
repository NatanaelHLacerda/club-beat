-- REQ-044 — Histórico de encerradas: toda empresa que vai para "Encerrada" guarda o motivo (como as recusadas já guardavam).
-- Negociação (abas) e a saída das arquivadas do funil são só de tela: não pedem mudança de banco.
--
-- Encerrada só entra pela aba Renovação (mover_etapa genérico passa a recusar esse destino) e exige motivo
-- digitado por quem encerra; o gatilho abaixo só cobre o caminho automático da rotina de renovação, que não
-- tem usuário para perguntar.

-- Mesma regra de bloqueio de `mover_etapa` (REQ-004), só acrescentando a recusa de "encerrada".
create or replace function public.mover_etapa(empresa uuid, para public.etapa, motivo text default null, retomar date default null)
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
  if para = 'encerrada' then
    raise exception 'O encerramento é registrado na aba Renovação, com o motivo — não por aqui.';
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
  values (empresa, 'etapa', atual, para, trim(motivo), auth.uid());
end $$;

-- Encerramento manual passa a exigir o motivo digitado por quem encerra (antes não pedia motivo nenhum).
drop function if exists public.encerrar_parceria(uuid, jsonb);
create function public.encerrar_parceria(parceria uuid, checklist jsonb, motivo text)
returns void language plpgsql security definer set search_path = public as $$
declare
  p public.parcerias;
  faltam int;
begin
  if not public.tenho_papel('gerente', 'direcao') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  if coalesce(trim(motivo), '') = '' then raise exception 'Informe o motivo do encerramento.'; end if;
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
  update public.empresas set etapa = 'encerrada', etapa_desde = now(), motivo_saida = trim(motivo) where id = p.empresa_id;
  insert into public.historico (empresa_id, tipo, de_etapa, para_etapa, texto, autor_id)
  values (p.empresa_id, 'etapa', 'renovacao', 'encerrada', trim(motivo), auth.uid());
end $$;
revoke all on function public.encerrar_parceria(uuid, jsonb, text) from anon;
grant execute on function public.encerrar_parceria(uuid, jsonb, text) to authenticated;

create function public.motivo_encerramento() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.etapa = 'encerrada' and old.etapa is distinct from 'encerrada' and coalesce(trim(new.motivo_saida), '') = '' then
    new.motivo_saida := case
      when exists (select 1 from public.parcerias p where p.empresa_id = new.id and p.renovacao->>'caminho' = 'encerrar' and p.renovacao->>'decidida_em' is not null)
        then 'Encerrada por decisão: não renovar'
      when exists (select 1 from public.parcerias p where p.empresa_id = new.id)
        then 'Contrato terminou sem renovação assinada'
      else 'Encerrada sem motivo informado' end;
  end if;
  return new;
end $$;
create trigger empresas_motivo_encerramento before update of etapa on public.empresas
  for each row execute function public.motivo_encerramento();

-- Quem já estava encerrada ganha o motivo pela mesma regra.
update public.empresas e set motivo_saida = case
  when exists (select 1 from public.parcerias p where p.empresa_id = e.id and p.renovacao->>'caminho' = 'encerrar' and p.renovacao->>'decidida_em' is not null)
    then 'Encerrada por decisão: não renovar'
  when exists (select 1 from public.parcerias p where p.empresa_id = e.id)
    then 'Contrato terminou sem renovação assinada'
  else 'Encerrada sem motivo informado' end
where e.etapa = 'encerrada' and coalesce(trim(e.motivo_saida), '') = '';
