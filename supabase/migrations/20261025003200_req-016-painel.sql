-- REQ-016 — Painel de indicadores e resumo mensal

create table public.metas (
  indicador text primary key,
  valor numeric not null,
  atualizado_por uuid references public.perfis (id) default auth.uid(),
  atualizado_em timestamptz not null default now()
);
alter table public.metas enable row level security;
create policy "ler metas" on public.metas for select to authenticated using (true);
create policy "definir metas" on public.metas for all to authenticated using (public.tenho_papel('direcao')) with check (public.tenho_papel('direcao'));
grant select, insert, update, delete on public.metas to authenticated;
grant all on public.metas to service_role;

alter table public.relatorios add column nota_parceiro numeric(2, 1) check (nota_parceiro is null or nota_parceiro between 1 and 5);

-- Reclamações de membros: registro simples, sem identificar o membro.
create table public.reclamacoes (
  id uuid primary key default gen_random_uuid(),
  parceria_id uuid not null references public.parcerias (id) on delete cascade,
  data date not null default current_date,
  texto text not null,
  autor_id uuid references public.perfis (id) default auth.uid(),
  criado_em timestamptz not null default now()
);
alter table public.reclamacoes enable row level security;
create policy "ler reclamações" on public.reclamacoes for select to authenticated using (public.pode_ler_parceria(parceria_id));
create policy "registrar reclamações" on public.reclamacoes for insert to authenticated
  with check (public.tenho_papel('primeira_pessoa', 'gerente', 'operacoes') and autor_id = auth.uid() and public.pode_ler_parceria(parceria_id));
grant select, insert on public.reclamacoes to authenticated;
grant all on public.reclamacoes to service_role;

create function public.indicadores(mes date default date_trunc('month', public.hoje_sp())::date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  ini date := date_trunc('month', mes)::date;
  ate date := (date_trunc('month', mes) + interval '1 month')::date;
  r jsonb;
begin
  if public.meu_papel() is null then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;

  with chegadas as (
    select e.* from public.empresas e where public.data_sp(e.criado_em) >= ini and public.data_sp(e.criado_em) < ate
  ), resposta as (
    select c.id, min(h.em) as primeira from chegadas c
    join public.historico h on h.empresa_id = c.id and h.autor_id is not null and h.tipo in ('etapa', 'mensagem')
    group by c.id
  ), com_reuniao as (
    select distinct h.empresa_id from public.historico h where h.para_etapa = 'reuniao'
    union select id from public.empresas where reuniao->>'quando' is not null
  )
  select jsonb_build_object(
    'chegaram', (select count(*) from chegadas),
    'respondidas_2du', (select count(*) from chegadas c join resposta r on r.id = c.id
                        where public.data_sp(r.primeira) <= public.somar_dias_uteis(public.data_sp(c.criado_em), 2)),
    'chegaram_reuniao', (select count(*) from chegadas c where c.id in (select empresa_id from com_reuniao)),
    'reunioes', (select count(*) from public.empresas e where e.id in (select empresa_id from com_reuniao)
                 and public.data_sp(coalesce((e.reuniao->>'quando')::timestamptz, e.etapa_desde)) < ate),
    'viraram_contrato', (select count(*) from public.empresas e where e.id in (select empresa_id from com_reuniao) and e.proposta->>'aceite_em' is not null),
    'dias_ate_contrato', (select round(avg(public.data_sp((e.contrato->>'assinado_em')::timestamptz) - public.data_sp(e.criado_em)))
                          from public.empresas e where (e.contrato->>'assinado_em')::timestamptz >= ini and (e.contrato->>'assinado_em')::timestamptz < ate),
    'recusadas_nao_combina', (select count(*) from public.historico h where h.para_etapa = 'recusada'
                              and public.data_sp(h.em) >= ini and public.data_sp(h.em) < ate),
    'ativas_por_padrao', (select coalesce(jsonb_object_agg(padrao, n), '{}') from (
                            select coalesce(padrao::text, 'sem') as padrao, count(*) n from public.parcerias where situacao = 'vigente' group by 1) x),
    'receita_centavos', (select sum(valor_mensal_centavos) from public.parcerias where situacao = 'vigente' and not troca),
    'receita_sem_valor', (select count(*) from public.parcerias where situacao = 'vigente' and not troca and valor_mensal_centavos is null),
    'renovadas', (select count(*) from public.parcerias where renovacao->>'decidida_em' is not null and renovacao->>'caminho' <> 'encerrar'),
    'decididas_renovacao', (select count(*) from public.parcerias where renovacao->>'decidida_em' is not null),
    'datas_a_total', (select count(*) from public.calendario_datas where tipo = 'A' and data >= ini and data < ate),
    'datas_a_ocupadas', (select count(*) from public.calendario_datas where tipo = 'A' and situacao <> 'livre' and data >= ini and data < ate),
    'vencendo_sem_aviso', (select count(*) from public.parcerias where situacao = 'vigente' and fim - public.hoje_sp() <= 90 and renovacao->>'aviso90_em' is null and renovacao->>'decidida_em' is null),
    'nota_membros', (select round(avg(nota_membros), 1) from public.entregas where data >= ini and data < ate),
    'nota_parceiro', (select round(avg(nota_parceiro), 1) from public.relatorios where tipo = 'balanco' and enviado_em >= ini and enviado_em < ate),
    'reclamacoes_trimestre', (select count(*) from public.reclamacoes where data >= date_trunc('quarter', mes)::date and data < (date_trunc('quarter', mes) + interval '3 months')::date),
    'fechadas', (select coalesce(jsonb_agg(jsonb_build_object('marca', e.marca, 'padrao', p.padrao, 'valor_centavos', p.valor_mensal_centavos, 'troca', p.troca, 'inicio', p.inicio, 'fim', p.fim) order by p.criado_em), '[]')
                 from public.parcerias p join public.empresas e on e.id = p.empresa_id where p.criado_em >= ini and p.criado_em < ate)
  ) into r;
  return r;
end $$;
grant execute on function public.indicadores(date) to authenticated;

-- Resumo mensal à Direção (dia 1): parcerias fechadas no mês anterior, sem pedir aprovação.
create function public.rotina_resumo_mensal(hoje date default public.hoje_sp()) returns integer
language plpgsql security definer set search_path = public as $$
declare
  ini date := (date_trunc('month', hoje) - interval '1 month')::date;
  texto text;
  n int;
begin
  select count(*), string_agg(e.marca || ' (' || coalesce(public.rotulo_padrao(p.padrao), '—') || ', ' ||
      case when p.troca then 'troca de serviços' when p.valor_mensal_centavos is null then 'R$ …'
           else 'R$ ' || to_char(p.valor_mensal_centavos / 100.0, 'FM999G999G990D00') end || ')', '; ' order by p.criado_em)
  into n, texto
  from public.parcerias p join public.empresas e on e.id = p.empresa_id
  where p.criado_em >= ini and p.criado_em < (ini + interval '1 month');
  perform public.avisar_papel('direcao', null, 'resumo_mensal',
    'Resumo de ' || to_char(ini, 'MM/YYYY') || ': ' || n || ' parceria(s) fechada(s)' || coalesce(': ' || texto, '') || '.');
  return n;
end $$;
revoke execute on function public.rotina_resumo_mensal(date) from anon, authenticated;
select cron.schedule('resumo-mensal-direcao', '20 9 1 * *', 'select public.rotina_resumo_mensal()');
