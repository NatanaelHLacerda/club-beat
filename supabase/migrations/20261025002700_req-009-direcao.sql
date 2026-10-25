-- REQ-009 — Porta da Direção

create table public.feriados (
  data date primary key,
  nome text not null
);
alter table public.feriados enable row level security;
create policy "ler feriados" on public.feriados for select to authenticated using (true);
create policy "gerir feriados" on public.feriados for all to authenticated
  using (public.tenho_papel('direcao', 'primeira_pessoa')) with check (public.tenho_papel('direcao', 'primeira_pessoa'));
grant select, insert, update, delete on public.feriados to authenticated;
grant all on public.feriados to service_role;

-- Feriados nacionais fixos de 2026 e 2027 (os móveis e municipais a 1ª pessoa cadastra).
insert into public.feriados (data, nome)
select make_date(a, m, d), n
from generate_series(2026, 2027) a,
  (values (1, 1, 'Confraternização Universal'), (4, 21, 'Tiradentes'), (5, 1, 'Dia do Trabalho'), (9, 7, 'Independência'),
          (10, 12, 'Nossa Senhora Aparecida'), (11, 2, 'Finados'), (11, 15, 'Proclamação da República'),
          (11, 20, 'Dia da Consciência Negra'), (12, 25, 'Natal')) f(m, d, n);

create function public.somar_dias_uteis(inicio date, n integer) returns date
language plpgsql stable security definer set search_path = public as $$
declare
  d date := inicio;
  contados integer := 0;
begin
  while contados < n loop
    d := d + 1;
    if extract(isodow from d) < 6 and not exists (select 1 from public.feriados f where f.data = d) then
      contados := contados + 1;
    end if;
  end loop;
  return d;
end $$;
grant execute on function public.somar_dias_uteis(date, integer) to authenticated;

alter table public.empresas
  add column direcao jsonb not null default '{}',
  add column fila_master boolean not null default false;

create function public.vaga_master_ocupada(exceto uuid default null) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.empresas where padrao_final = 'master' and etapa in ('contrato', 'ativa', 'renovacao')
                 and (exceto is null or id <> exceto))
$$;
grant execute on function public.vaga_master_ocupada(uuid) to authenticated;

create function public.levar_a_direcao(empresa uuid, recomendacao text)
returns void language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  motivos text[];
  prazo date;
begin
  if not public.tenho_papel('gerente') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  select * into e from public.empresas where id = empresa for update;
  if e.etapa <> 'proposta' then raise exception 'A empresa precisa estar em "Em proposta".'; end if;
  motivos := public.motivos_direcao(empresa);
  if cardinality(motivos) = 0 then raise exception 'Esta proposta não precisa da Direção: a Gerente fecha.'; end if;
  if coalesce(trim(recomendacao), '') = '' then raise exception 'Escreva a sua recomendação para a Direção.'; end if;
  prazo := public.somar_dias_uteis(current_date, 3);
  update public.empresas set etapa = 'direcao', etapa_desde = now(),
    direcao = jsonb_build_object('levada_em', now(), 'levada_por', auth.uid(), 'motivos', to_jsonb(motivos),
      'recomendacao', trim(recomendacao), 'prazo', prazo)
  where id = empresa;
  insert into public.historico (empresa_id, tipo, de_etapa, para_etapa, texto, autor_id)
  values (empresa, 'etapa', 'proposta', 'direcao', 'Levada à Direção: ' || array_to_string(motivos, ', ') || ' · resposta até ' || to_char(prazo, 'DD/MM'), auth.uid());
  perform public.avisar_papel('direcao', empresa, 'decisao', 'Decisão pedida: ' || e.marca || ' (' || array_to_string(motivos, ', ') || '). Resposta até ' || to_char(prazo, 'DD/MM') || '.');
end $$;

create function public.decidir_direcao(empresa uuid, decisao text, motivo text, como_master boolean default false,
  destino_recusa public.etapa default 'recusada', retomar date default null)
returns public.etapa language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  destino public.etapa;
  novo_padrao public.padrao;
  fila boolean := false;
begin
  if not public.tenho_papel('direcao') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  select * into e from public.empresas where id = empresa for update;
  if e.etapa <> 'direcao' then raise exception 'Este caso não está com a Direção.'; end if;
  if decisao not in ('aprovar', 'ajustar', 'recusar') then raise exception 'Escolha aprovar, ajustar ou recusar.'; end if;
  if coalesce(trim(motivo), '') = '' then raise exception 'Informe o motivo da decisão.'; end if;
  novo_padrao := e.padrao_final;

  if decisao = 'aprovar' then
    if como_master then
      if public.vaga_master_ocupada(empresa) then
        raise exception 'A vaga de Master está ocupada. Aprove como Ouro e coloque na fila do Master.';
      end if;
      novo_padrao := 'master';
    elsif e.candidata_master and public.vaga_master_ocupada(empresa) then
      novo_padrao := 'ouro'; fila := true;
    end if;
    destino := case when e.proposta->>'aceite_em' is not null then 'contrato' else 'proposta' end;
    update public.empresas set padrao_final = novo_padrao, fila_master = fila,
      proposta = proposta || jsonb_build_object('direcao_aprovada_em', now())
    where id = empresa;
  elsif decisao = 'ajustar' then
    destino := 'proposta';
    update public.empresas set proposta = proposta - 'enviada_em' - 'prazo_resposta' - 'aceite_em' where id = empresa;
  else
    if destino_recusa not in ('espera', 'recusada') then destino_recusa := 'recusada'; end if;
    if destino_recusa = 'espera' and retomar is null then raise exception 'Informe a data para retomar.'; end if;
    destino := destino_recusa;
  end if;

  update public.empresas set etapa = destino, etapa_desde = now(),
    motivo_saida = case when destino in ('espera', 'recusada') then 'Direção: ' || trim(motivo) else motivo_saida end,
    retomar_em = case when destino = 'espera' then retomar else retomar_em end,
    direcao = direcao || jsonb_build_object('decisao', decisao, 'motivo', trim(motivo), 'decidida_em', now(), 'decidida_por', auth.uid(),
      'como_master', novo_padrao = 'master', 'fila_master', fila)
  where id = empresa;
  insert into public.historico (empresa_id, tipo, de_etapa, para_etapa, texto, autor_id)
  values (empresa, 'etapa', 'direcao', destino,
    'Direção: ' || case decisao when 'aprovar' then 'aprovou' when 'ajustar' then 'pediu ajuste' else 'recusou' end || ' · ' || trim(motivo) ||
    case when novo_padrao = 'master' and e.padrao_final is distinct from 'master' then ' · padrão Master' when fila then ' · entra como Ouro na fila do Master' else '' end,
    auth.uid());
  perform public.avisar_usuario(coalesce(e.responsavel_id, e.gerente1_id), empresa, 'decisao_direcao',
    'Direção ' || case decisao when 'aprovar' then 'aprovou' when 'ajustar' then 'pediu ajuste em' else 'recusou' end || ' ' || e.marca || ': ' || trim(motivo));
  return destino;
end $$;

revoke execute on function public.levar_a_direcao(uuid, text), public.decidir_direcao(uuid, text, text, boolean, public.etapa, date) from anon;
grant execute on function public.levar_a_direcao(uuid, text), public.decidir_direcao(uuid, text, text, boolean, public.etapa, date) to authenticated;
