-- REQ-010 — Contrato e assinatura

create function public.cpf_valido(v text) returns boolean language plpgsql immutable as $$
declare
  d text := regexp_replace(coalesce(v, ''), '\D', '', 'g');
  soma int; r int;
begin
  if length(d) <> 11 or d ~ '^(\d)\1{10}$' then return false; end if;
  soma := 0; for i in 1..9 loop soma := soma + substr(d, i, 1)::int * (11 - i); end loop;
  r := (soma * 10) % 11; if r = 10 then r := 0; end if;
  if r <> substr(d, 10, 1)::int then return false; end if;
  soma := 0; for i in 1..10 loop soma := soma + substr(d, i, 1)::int * (12 - i); end loop;
  r := (soma * 10) % 11; if r = 10 then r := 0; end if;
  return r = substr(d, 11, 1)::int;
end $$;

-- O CPF de quem assina fica fora de empresas: só Jurídico, Gerente e Direção leem.
create table public.pacotes_contrato (
  empresa_id uuid primary key references public.empresas (id) on delete cascade,
  endereco text not null,
  signatario_nome text not null,
  signatario_cpf text not null check (public.cpf_valido(signatario_cpf)),
  email_assinatura text not null,
  enviado_em timestamptz not null default now(),
  enviado_por uuid references public.perfis (id)
);
alter table public.pacotes_contrato enable row level security;
create policy "ler pacote" on public.pacotes_contrato for select to authenticated
  using (public.tenho_papel('juridico', 'gerente', 'direcao') and public.pode_ler_empresa_id(empresa_id));
grant select on public.pacotes_contrato to authenticated;
grant all on public.pacotes_contrato to service_role;

alter table public.empresas add column contrato jsonb not null default '{}';

alter table public.parcerias
  add column padrao public.padrao,
  add column tipo_parceria text,
  add column valor_mensal_centavos bigint,
  add column troca boolean not null default false,
  add column contrapartidas jsonb not null default '[]',
  add column promessa_revisao text,
  add column responsavel_id uuid references public.perfis (id);

-- Itens da conferência do cap. 12 (mesma lista de src/regras/contrato.ts).
create function public.itens_conferencia_contrato() returns text[] language sql immutable as $$
  select array['partes', 'objeto', 'prazo', 'entregas', 'valor', 'datas', 'aprovacao_material', 'fornecedor_reserva',
    'exclusividade', 'nao_promete', 'privacidade', 'uso_marca', 'fim_antecipado', 'responsabilidade', 'beneficio_colaboradores', 'foro', 'tipo_minuta']
$$;

create function public.enviar_ao_juridico(empresa uuid, endereco text, nome text, cpf text, email text)
returns void language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  prazo date;
begin
  if not public.tenho_papel('gerente') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  select * into e from public.empresas where id = empresa for update;
  if e.etapa <> 'contrato' then raise exception 'A empresa precisa estar em "Em contrato".'; end if;
  if coalesce(trim(e.razao_social), '') = '' then raise exception 'Preencha a razão social da empresa no Resumo.'; end if;
  if coalesce(trim(endereco), '') = '' then raise exception 'Informe o endereço da empresa.'; end if;
  if coalesce(trim(nome), '') = '' then raise exception 'Informe o nome de quem assina.'; end if;
  if coalesce(trim(cpf), '') = '' then raise exception 'Informe o CPF de quem assina.'; end if;
  if not public.cpf_valido(cpf) then raise exception 'CPF inválido.'; end if;
  if coalesce(trim(email), '') = '' then raise exception 'Informe o e-mail para a assinatura digital.'; end if;
  insert into public.pacotes_contrato (empresa_id, endereco, signatario_nome, signatario_cpf, email_assinatura, enviado_por)
  values (empresa, trim(endereco), trim(nome), regexp_replace(cpf, '\D', '', 'g'), trim(email), auth.uid())
  on conflict (empresa_id) do update set endereco = excluded.endereco, signatario_nome = excluded.signatario_nome,
    signatario_cpf = excluded.signatario_cpf, email_assinatura = excluded.email_assinatura, enviado_em = now(), enviado_por = auth.uid();
  prazo := public.somar_dias_uteis(current_date, 5);
  update public.empresas set contrato = contrato || jsonb_build_object('enviado_juridico_em', now(), 'prazo_juridico', prazo) where id = empresa;
  insert into public.historico (empresa_id, tipo, texto, autor_id) values (empresa, 'sistema', 'Pacote enviado ao Jurídico · minuta até ' || to_char(prazo, 'DD/MM'), auth.uid());
  perform public.avisar_papel('juridico', empresa, 'contrato', 'Novo contrato para preparar: ' || e.marca || '. Minuta até ' || to_char(prazo, 'DD/MM') || '.');
end $$;

create function public.conferir_contrato(empresa uuid, minuta_tipo text, conferencia jsonb, divergencia text, pronto boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  faltam text[];
begin
  if not public.tenho_papel('juridico') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  select * into e from public.empresas where id = empresa for update;
  if e.etapa <> 'contrato' then raise exception 'A empresa precisa estar em "Em contrato".'; end if;
  if e.contrato->>'enviado_juridico_em' is null then raise exception 'A Gerente ainda não enviou o pacote.'; end if;
  if minuta_tipo not in ('patrocinio', 'industria', 'servico', 'troca') then raise exception 'Escolha o tipo de minuta.'; end if;
  if pronto then
    select array_agg(i) into faltam from unnest(public.itens_conferencia_contrato()) i
    where coalesce((conferencia->>i)::boolean, false) is not true;
    if faltam is not null then raise exception 'Confira todos os itens da lista antes de marcar pronto para assinar.'; end if;
    if not exists (select 1 from public.anexos where empresa_id = empresa and tipo = 'minuta') then
      raise exception 'Anexe a minuta antes de marcar pronto.';
    end if;
    if coalesce(trim(divergencia), '') <> '' then raise exception 'Há divergência com a proposta: a Gerente resolve antes.'; end if;
  end if;
  update public.empresas set contrato = contrato || jsonb_build_object(
    'minuta_tipo', minuta_tipo, 'conferencia', coalesce(conferencia, '{}'), 'divergencia', nullif(trim(divergencia), ''),
    'pronto_em', case when pronto then to_jsonb(now()) else 'null'::jsonb end,
    'pronto_por', case when pronto then to_jsonb(auth.uid()) else 'null'::jsonb end,
    'prazo_assinatura', case when pronto then to_jsonb(public.somar_dias_uteis(current_date, 2)) else 'null'::jsonb end)
  where id = empresa;
  if coalesce(trim(divergencia), '') <> '' then
    perform public.avisar_usuario(coalesce(e.gerente2_id, e.responsavel_id, e.gerente1_id), empresa, 'divergencia',
      'O Jurídico encontrou diferença entre a minuta e a proposta de ' || e.marca || ': ' || trim(divergencia));
  end if;
  if pronto then
    insert into public.historico (empresa_id, tipo, texto, autor_id) values (empresa, 'sistema', 'Jurídico: contrato pronto para assinar', auth.uid());
    perform public.avisar_usuario(coalesce(e.gerente2_id, e.responsavel_id, e.gerente1_id), empresa, 'contrato',
      'Contrato de ' || e.marca || ' pronto para assinar. Assinatura em até 2 dias úteis.');
  end if;
end $$;

create function public.registrar_assinatura(empresa uuid, inicio date, fim date, testemunhas boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  datas text;
  entregas text;
  datas_confirmadas int;
begin
  if not public.tenho_papel('gerente') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  select * into e from public.empresas where id = empresa for update;
  if e.etapa <> 'contrato' then raise exception 'A empresa precisa estar em "Em contrato".'; end if;
  if e.contrato->>'pronto_em' is null then raise exception 'O contrato ainda não está pronto para assinar.'; end if;
  if not exists (select 1 from public.anexos where empresa_id = empresa and tipo = 'contrato') then raise exception 'Anexe o contrato assinado.'; end if;
  if inicio is null or fim is null or fim < inicio then raise exception 'Informe início e fim do contrato (o fim depois do início).'; end if;
  if not coalesce(testemunhas, false) then raise exception 'Marque a assinatura das duas testemunhas.'; end if;

  insert into public.parcerias (empresa_id, inicio, fim, padrao, tipo_parceria, valor_mensal_centavos, troca, contrapartidas,
    promessa_revisao, responsavel_id, exclusividade_categoria, exclusividade_inicio, exclusividade_fim)
  values (empresa, inicio, fim, e.padrao_final, e.tipo_parceria, nullif(e.proposta->>'valor_mensal_centavos', '')::bigint,
    coalesce((e.proposta->>'troca')::boolean, false), coalesce(e.proposta->'itens', '[]'), nullif(e.proposta->>'promessa_revisao', ''),
    coalesce(e.responsavel_id, e.gerente1_id),
    case when e.proposta->>'direcao_aprovada_em' is not null then nullif(e.proposta->>'exclusividade_categoria', '') end,
    case when e.proposta->>'direcao_aprovada_em' is not null and nullif(e.proposta->>'exclusividade_categoria', '') is not null then inicio end,
    case when e.proposta->>'direcao_aprovada_em' is not null and nullif(e.proposta->>'exclusividade_categoria', '') is not null then fim end);

  datas_confirmadas := public.confirmar_datas_da_empresa(empresa);
  update public.empresas set etapa = 'ativa', etapa_desde = now(),
    contrato = contrato || jsonb_build_object('assinado_em', now(), 'assinado_por', auth.uid())
  where id = empresa;
  insert into public.historico (empresa_id, tipo, de_etapa, para_etapa, texto, autor_id)
  values (empresa, 'etapa', 'contrato', 'ativa',
    'Contrato assinado · ' || to_char(inicio, 'DD/MM/YYYY') || ' a ' || to_char(fim, 'DD/MM/YYYY') || ' · ' || datas_confirmadas || ' datas confirmadas', auth.uid());

  select string_agg(to_char(data, 'DD/MM'), ', ' order by data) into datas from public.calendario_datas where empresa_id = empresa;
  select string_agg(coalesce(c.rotulo, i->>'item') || case when (i->>'quantidade')::int > 1 then ' × ' || (i->>'quantidade') else '' end, ', ')
  into entregas
  from jsonb_array_elements(coalesce(e.proposta->'itens', '[]')) i
  left join public.cardapio c on c.padrao = e.padrao_final and c.item = i->>'item';
  perform public.avisar_papel('financeiro', empresa, 'parceria_ativa',
    'Nova parceria ativa: ' || e.marca || ' (' || coalesce(public.rotulo_padrao(e.padrao_final), '—') || ') de ' || to_char(inicio, 'DD/MM/YYYY') || ' a ' || to_char(fim, 'DD/MM/YYYY') ||
    '. Cadastre datas de pagamento e notas fiscais.');
  perform public.avisar_papel('operacoes', empresa, 'parceria_ativa',
    'Nova parceria ativa: ' || e.marca || '. Entregas: ' || coalesce(entregas, '—') || '. Datas: ' || coalesce(datas, '—') || '.');
end $$;

revoke execute on function public.enviar_ao_juridico(uuid, text, text, text, text), public.conferir_contrato(uuid, text, jsonb, text, boolean),
  public.registrar_assinatura(uuid, date, date, boolean) from anon;
grant execute on function public.enviar_ao_juridico(uuid, text, text, text, text), public.conferir_contrato(uuid, text, jsonb, text, boolean),
  public.registrar_assinatura(uuid, date, date, boolean) to authenticated;

create function public.requisitos_contrato(empresa uuid) returns text
language sql stable security definer set search_path = public as $$
  select case when e.proposta->>'aceite_em' is null then 'Registre o aceite da proposta antes do contrato.' end
  from public.empresas e where e.id = empresa
$$;
