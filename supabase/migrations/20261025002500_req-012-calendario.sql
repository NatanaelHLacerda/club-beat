-- REQ-012 — Calendário anual de eventos

create extension if not exists pg_cron;

insert into public.parametros (chave, valor, descricao) values
  ('antecedencia_troca_dias', '30', 'Antecedência mínima para pedir troca de data do calendário (DP-1203).');

create table public.calendario_datas (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  tipo text not null check (tipo in ('A', 'B', 'C')),
  vespera_feriado boolean not null default false,
  aula text,
  horario text,
  media_alunos integer check (media_alunos is null or media_alunos >= 0),
  tema text,
  situacao text not null default 'livre' check (situacao in ('livre', 'reservada', 'confirmada')),
  empresa_id uuid references public.empresas (id) on delete set null,
  tipo_acao text check (tipo_acao in ('ativacao', 'evento', 'aula_fechada')),
  reservada_em timestamptz,
  reservada_ate date,
  reservada_por uuid references public.perfis (id),
  exemplo boolean not null default false,
  check ((situacao = 'livre') = (empresa_id is null))
);
create index on public.calendario_datas (data);
create index on public.calendario_datas (empresa_id);

create table public.janelas_escolha (
  ano integer not null,
  grupo text not null check (grupo in ('master_ouro', 'prata', 'bronze')),
  abre_em date not null,
  fecha_em date not null check (fecha_em >= abre_em),
  primary key (ano, grupo)
);

alter table public.calendario_datas enable row level security;
alter table public.janelas_escolha enable row level security;
create policy "ler calendário" on public.calendario_datas for select to authenticated using (public.meu_papel() is not null);
create policy "cadastrar datas" on public.calendario_datas for insert to authenticated
  with check (public.tenho_papel('direcao', 'primeira_pessoa') and situacao = 'livre');
create policy "editar datas" on public.calendario_datas for update to authenticated
  using (public.tenho_papel('direcao', 'primeira_pessoa')) with check (public.tenho_papel('direcao', 'primeira_pessoa'));
create policy "apagar datas livres" on public.calendario_datas for delete to authenticated
  using (public.tenho_papel('direcao', 'primeira_pessoa') and situacao = 'livre');
create policy "ler janelas" on public.janelas_escolha for select to authenticated using (true);
create policy "gerir janelas" on public.janelas_escolha for all to authenticated
  using (public.tenho_papel('direcao', 'primeira_pessoa')) with check (public.tenho_papel('direcao', 'primeira_pessoa'));

grant select, insert, delete on public.calendario_datas to authenticated;
grant update (data, tipo, vespera_feriado, aula, horario, media_alunos, tema) on public.calendario_datas to authenticated;
grant select, insert, update, delete on public.janelas_escolha to authenticated;
grant all on public.calendario_datas, public.janelas_escolha to service_role;

-- O REQ-008 completa: a proposta precisa prever a ação.
create function public.empresa_preve_acao(empresa uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select true
$$;

create function public.grupo_do_padrao(p public.padrao, candidata boolean) returns text language sql immutable as $$
  select case when candidata or p in ('master', 'ouro') then 'master_ouro' when p = 'prata' then 'prata' else 'bronze' end
$$;

create function public.reservar_data(data_id uuid, empresa uuid, acao text)
returns void language plpgsql security definer set search_path = public as $$
declare
  d public.calendario_datas;
  e public.empresas;
  meu_grupo text;
  janela public.janelas_escolha;
  aberto text;
  mes_ini date;
  tipos_mes text[];
  dias_mes int;
begin
  if not public.tenho_papel('gerente', 'primeira_pessoa', 'direcao') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  select * into d from public.calendario_datas where id = data_id for update;
  if d.id is null then raise exception 'Data não encontrada.'; end if;
  if d.situacao <> 'livre' then raise exception 'Esta data já está reservada ou confirmada.'; end if;
  if d.data < current_date then raise exception 'Esta data já passou.'; end if;
  select * into e from public.empresas where id = empresa;
  if e.etapa not in ('reuniao', 'proposta', 'direcao', 'contrato', 'ativa', 'renovacao') then
    raise exception 'A empresa precisa estar em conversa (reunião, proposta, Direção ou contrato) para reservar.';
  end if;
  if not public.empresa_preve_acao(empresa) then raise exception 'A proposta desta empresa não prevê ações no calendário.'; end if;
  if acao not in ('ativacao', 'evento', 'aula_fechada') then raise exception 'Escolha o tipo de ação.'; end if;
  if d.vespera_feriado and coalesce(e.padrao_final::text, '') not in ('bronze', 'prata') then
    raise exception 'Véspera de feriado: só empresas Bronze e Prata.';
  end if;
  if d.tipo = 'A' then
    meu_grupo := public.grupo_do_padrao(e.padrao_final, e.candidata_master);
    select * into janela from public.janelas_escolha j
      where j.ano = extract(year from d.data) and j.grupo = meu_grupo;
    if janela.ano is not null and current_date < janela.abre_em then
      select case j.grupo when 'master_ouro' then 'Master e Ouro' when 'prata' then 'Prata' else 'Bronze' end into aberto
      from public.janelas_escolha j where j.ano = janela.ano and current_date between j.abre_em and j.fecha_em limit 1;
      raise exception 'Datas A: agora escolhem %. A janela de % abre em %.',
        coalesce(aberto, 'ninguém'), case meu_grupo when 'master_ouro' then 'Master e Ouro' when 'prata' then 'Prata' else 'Bronze' end,
        to_char(janela.abre_em, 'DD/MM');
    end if;
  end if;
  mes_ini := date_trunc('month', d.data)::date;
  select array_agg(distinct tipo_acao), count(*) into tipos_mes, dias_mes
  from public.calendario_datas
  where situacao <> 'livre' and data >= mes_ini and data < (mes_ini + interval '1 month');
  if tipos_mes is not null and not (acao = any (tipos_mes)) then raise exception 'Este mês já tem outro tipo de ação.'; end if;
  if dias_mes >= 4 then raise exception 'Este mês já tem 4 dias de ação.'; end if;

  update public.calendario_datas set situacao = 'reservada', empresa_id = empresa, tipo_acao = acao,
    reservada_em = now(), reservada_ate = current_date + 7, reservada_por = auth.uid()
  where id = data_id;
  insert into public.historico (empresa_id, tipo, texto, autor_id)
  values (empresa, 'sistema', 'Data reservada no calendário: ' || to_char(d.data, 'DD/MM/YYYY') || ' (tipo ' || d.tipo || ') até ' || to_char(current_date + 7, 'DD/MM'), auth.uid());
end $$;

create function public.liberar_data(data_id uuid, motivo text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  d public.calendario_datas;
begin
  if not public.tenho_papel('gerente', 'primeira_pessoa', 'direcao') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  select * into d from public.calendario_datas where id = data_id for update;
  if d.situacao = 'confirmada' then raise exception 'Data confirmada só muda por troca pedida por escrito.'; end if;
  update public.calendario_datas set situacao = 'livre', empresa_id = null, tipo_acao = null, reservada_em = null, reservada_ate = null, reservada_por = null
  where id = data_id;
  if d.empresa_id is not null then
    insert into public.historico (empresa_id, tipo, texto, autor_id)
    values (d.empresa_id, 'sistema', 'Reserva liberada: ' || to_char(d.data, 'DD/MM/YYYY') || coalesce(' · ' || motivo, ''), auth.uid());
  end if;
end $$;

-- Chamada na assinatura do contrato (REQ-010).
create function public.confirmar_datas_da_empresa(empresa uuid) returns integer
language plpgsql security definer set search_path = public as $$
declare
  n integer;
begin
  update public.calendario_datas set situacao = 'confirmada', reservada_ate = null where empresa_id = empresa and situacao = 'reservada';
  get diagnostics n = row_count;
  return n;
end $$;
revoke execute on function public.confirmar_datas_da_empresa(uuid) from anon, authenticated;

create function public.trocar_data(data_antiga uuid, data_nova uuid, pedido text)
returns void language plpgsql security definer set search_path = public as $$
declare
  a public.calendario_datas;
  n public.calendario_datas;
  minimo int := coalesce((select (valor #>> '{}')::int from public.parametros where chave = 'antecedencia_troca_dias'), 30);
begin
  if not public.tenho_papel('gerente', 'primeira_pessoa', 'direcao') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  select * into a from public.calendario_datas where id = data_antiga for update;
  select * into n from public.calendario_datas where id = data_nova for update;
  if a.empresa_id is null then raise exception 'A data atual não tem empresa.'; end if;
  if coalesce(trim(pedido), '') = '' or a.data - current_date < minimo then
    raise exception 'Peça a troca por escrito com pelo menos % dias de antecedência.', minimo;
  end if;
  if n.situacao <> 'livre' then raise exception 'Esta data já está reservada ou confirmada.'; end if;
  update public.calendario_datas set situacao = a.situacao, empresa_id = a.empresa_id, tipo_acao = a.tipo_acao,
    reservada_em = a.reservada_em, reservada_ate = a.reservada_ate, reservada_por = a.reservada_por where id = data_nova;
  update public.calendario_datas set situacao = 'livre', empresa_id = null, tipo_acao = null, reservada_em = null, reservada_ate = null, reservada_por = null
  where id = data_antiga;
  insert into public.historico (empresa_id, tipo, texto, autor_id)
  values (a.empresa_id, 'sistema', 'Troca de data: ' || to_char(a.data, 'DD/MM/YYYY') || ' → ' || to_char(n.data, 'DD/MM/YYYY') || ' · ' || trim(pedido), auth.uid());
end $$;

-- Reservas vencidas voltam a Livre e quem reservou é avisado. Roda todo dia às 6h de Brasília (9h UTC, pg_cron).
create function public.liberar_reservas_vencidas(hoje date default current_date) returns integer
language plpgsql security definer set search_path = public as $$
declare
  d record;
  n integer := 0;
begin
  for d in select c.*, e.marca from public.calendario_datas c join public.empresas e on e.id = c.empresa_id
           where c.situacao = 'reservada' and c.reservada_ate <= hoje loop
    update public.calendario_datas set situacao = 'livre', empresa_id = null, tipo_acao = null, reservada_em = null, reservada_ate = null, reservada_por = null
    where id = d.id;
    insert into public.historico (empresa_id, tipo, texto)
    values (d.empresa_id, 'sistema', 'Reserva de ' || to_char(d.data, 'DD/MM/YYYY') || ' venceu sem assinatura e voltou ao calendário');
    perform public.avisar_usuario(coalesce(d.reservada_por, (select responsavel_id from public.empresas where id = d.empresa_id)),
      d.empresa_id, 'reserva_vencida', 'A reserva de ' || to_char(d.data, 'DD/MM/YYYY') || ' para ' || d.marca || ' venceu sem assinatura e voltou a ficar livre.');
    n := n + 1;
  end loop;
  return n;
end $$;
revoke execute on function public.liberar_reservas_vencidas(date) from anon, authenticated;

revoke execute on function public.reservar_data(uuid, uuid, text), public.liberar_data(uuid, text), public.trocar_data(uuid, uuid, text) from anon;
grant execute on function public.reservar_data(uuid, uuid, text), public.liberar_data(uuid, text), public.trocar_data(uuid, uuid, text) to authenticated;

select cron.schedule('liberar-reservas-vencidas', '0 9 * * *', 'select public.liberar_reservas_vencidas()');
