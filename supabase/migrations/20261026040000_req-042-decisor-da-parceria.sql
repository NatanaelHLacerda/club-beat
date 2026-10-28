-- REQ-042 — Quem decide a parceria: dados do decisor (quando é outra pessoa) e herança para a Triagem 2.
-- A Triagem 2 lê esses campos da própria empresa: nada é digitado de novo.

alter table public.empresas
  add column decisor_nome text,
  add column decisor_email text,
  add column decisor_whatsapp text;

grant update (decisor_nome, decisor_email, decisor_whatsapp) on public.empresas to authenticated;

-- Regra do banco: "outra pessoa" pede nome, e-mail e WhatsApp. Vale na criação e quando esses campos mudam;
-- empresas antigas só são cobradas quando alguém mexe nesses dados (ou tenta ir para a Triagem 2).
create function public.exigir_decisor() returns trigger
language plpgsql set search_path = public as $$
begin
  if lower(coalesce(new.quem_decide, '')) <> 'outra pessoa' then
    new.decisor_nome := null; new.decisor_email := null; new.decisor_whatsapp := null;
    return new;
  end if;
  if tg_op = 'UPDATE' and (new.quem_decide, new.decisor_nome, new.decisor_email, new.decisor_whatsapp)
     is not distinct from (old.quem_decide, old.decisor_nome, old.decisor_email, old.decisor_whatsapp) then
    return new;
  end if;
  if coalesce(trim(new.decisor_nome), '') = '' or coalesce(trim(new.decisor_email), '') = ''
     or coalesce(trim(new.decisor_whatsapp), '') = '' then
    raise exception 'Se outra pessoa decide, informe nome, e-mail e WhatsApp dela.';
  end if;
  return new;
end $$;
create trigger empresas_exigir_decisor before insert or update on public.empresas for each row execute function public.exigir_decisor();

-- enviar_ficha (REQ-003) com decisor.
create or replace function public.enviar_ficha(dados jsonb, arquivos jsonb default '[]')
returns void language plpgsql security definer set search_path = public as $$
declare
  cnpj_limpo text := regexp_replace(coalesce(dados->>'cnpj', ''), '\D', '', 'g');
  existente uuid;
  nova uuid;
  arq jsonb;
  obrigatorios text[] := array['cnpj', 'razao_social', 'marca', 'cidade', 'uf', 'segmento', 'tempo_atuacao',
    'faixa_faturamento', 'faixa_funcionarios', 'contato_nome', 'contato_cargo', 'contato_whatsapp', 'contato_email',
    'motivo_parceria', 'objetivo', 'publico', 'quem_decide'];
  campo text;
begin
  -- Iscas anti-robô: campo escondido preenchido ou envio rápido demais.
  if coalesce(dados->>'site_empresa_confirmacao', '') <> '' or coalesce((dados->>'segundos')::int, 0) < 5 then
    raise exception 'Não foi possível enviar agora. Tente de novo em instantes.';
  end if;
  foreach campo in array obrigatorios loop
    if coalesce(trim(dados->>campo), '') = '' then raise exception 'Preencha este campo: %', campo; end if;
  end loop;
  if not public.cnpj_valido(cnpj_limpo) then raise exception 'CNPJ inválido'; end if;
  -- REQ-042: se quem decide é outra pessoa, nome, e-mail e WhatsApp dela são obrigatórios.
  if lower(trim(dados->>'quem_decide')) = 'outra pessoa' then
    foreach campo in array array['decisor_nome', 'decisor_email', 'decisor_whatsapp'] loop
      if coalesce(trim(dados->>campo), '') = '' then raise exception 'Preencha este campo: %', campo; end if;
    end loop;
    if trim(dados->>'decisor_email') !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then raise exception 'E-mail do decisor inválido.'; end if;
  end if;
  if coalesce(trim(dados->>'site'), '') = '' and coalesce(trim(dados->>'instagram'), '') = '' then
    raise exception 'Informe o site ou o Instagram.';
  end if;
  if jsonb_array_length(coalesce(dados->'busca', '[]')) = 0 then raise exception 'Preencha este campo: busca'; end if;
  if char_length(dados->>'motivo_parceria') > 800 then raise exception 'O motivo pode ter até 800 caracteres.'; end if;
  if coalesce((dados->>'aceite_nao_proposta')::boolean, false) is not true then
    raise exception 'Marque que o envio não é uma proposta.';
  end if;
  if coalesce((dados->>'consentimento')::boolean, false) is not true then
    raise exception 'Marque o consentimento de privacidade para enviar.';
  end if;

  select id into existente from public.empresas where cnpj = cnpj_limpo;
  if existente is not null then
    insert into public.historico (empresa_id, tipo, texto)
    values (existente, 'sistema', 'Nova ficha recebida pelo site de ' || (dados->>'contato_nome') || ' (' || (dados->>'contato_email') || ')');
    perform public.avisar_papel('primeira_pessoa', existente, 'ficha_repetida',
      'Nova ficha pelo site de uma empresa que já está no CRM: ' || (select marca from public.empresas where id = existente));
    -- REQ-003: parceira ativa vira conversa de renovação com o responsável.
    perform public.avisar_usuario(e.resp, existente, 'parceira_ativa',
      'Parceira ativa enviou nova ficha pelo site: ' || e.marca || '. Trate como renovação.')
    from (select coalesce(responsavel_id, gerente1_id) as resp, marca from public.empresas
          where id = existente and etapa in ('ativa', 'renovacao')) e;
    nova := existente;
  else
    insert into public.empresas (cnpj, razao_social, marca, cidade, uf, bairro, segmento, site, instagram, tempo_atuacao,
      faixa_faturamento, faixa_funcionarios, unidades, contato_nome, contato_cargo, contato_whatsapp, contato_email,
      quem_decide, decisor_nome, decisor_email, decisor_whatsapp, busca, motivo_parceria, objetivo, publico, parcerias_anteriores, investimento_faixa, inicio_desejado,
      duracao, datas_interesse, origem, indicado_por, consentimento_em, criado_por)
    values (cnpj_limpo, trim(dados->>'razao_social'), trim(dados->>'marca'), trim(dados->>'cidade'), upper(dados->>'uf'),
      nullif(trim(dados->>'bairro'), ''), dados->>'segmento', nullif(trim(dados->>'site'), ''), nullif(trim(dados->>'instagram'), ''),
      dados->>'tempo_atuacao', dados->>'faixa_faturamento', dados->>'faixa_funcionarios', nullif(dados->>'unidades', '')::int,
      trim(dados->>'contato_nome'), trim(dados->>'contato_cargo'), trim(dados->>'contato_whatsapp'), trim(dados->>'contato_email'),
      nullif(lower(trim(dados->>'quem_decide')), ''),
      case when lower(trim(dados->>'quem_decide')) = 'outra pessoa' then nullif(trim(dados->>'decisor_nome'), '') end,
      case when lower(trim(dados->>'quem_decide')) = 'outra pessoa' then nullif(trim(dados->>'decisor_email'), '') end,
      case when lower(trim(dados->>'quem_decide')) = 'outra pessoa' then nullif(trim(dados->>'decisor_whatsapp'), '') end,
      array(select jsonb_array_elements_text(dados->'busca')), trim(dados->>'motivo_parceria'),
      dados->>'objetivo', trim(dados->>'publico'), nullif(trim(dados->>'parcerias_anteriores'), ''),
      nullif(dados->>'investimento_faixa', ''), nullif(trim(dados->>'inicio_desejado'), ''), nullif(dados->>'duracao', ''),
      nullif(trim(dados->>'datas_interesse'), ''), 'site', nullif(trim(dados->>'indicado_por'), ''), now(), null)
    returning id into nova;
    perform public.enviar_modelo_automatico(nova, 'A1');
    perform public.avisar_papel('primeira_pessoa', nova, 'nova_ficha', 'Nova ficha pelo site: ' || trim(dados->>'marca'));
  end if;

  for arq in select * from jsonb_array_elements(coalesce(arquivos, '[]')) loop
    if (arq->>'caminho') like 'formulario/%' and exists (select 1 from storage.objects where bucket_id = 'anexos' and name = arq->>'caminho') then
      insert into public.anexos (empresa_id, tipo, caminho, nome, tamanho, autor_id)
      values (nova, coalesce(arq->>'tipo', 'outro'), arq->>'caminho', arq->>'nome', coalesce((arq->>'tamanho')::bigint, 0), null)
      on conflict (caminho) do nothing;
    end if;
  end loop;
end $$;

-- Triagem 1 → 2: decisor completo é requisito.
create or replace function public.requisitos_triagem2(empresa uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  e public.empresas;
  faltam text[];
  rotulos jsonb := '{"formulario":"formulário completo","cnpj":"CNPJ válido e ativo","nome_cidade":"nome e cidade conferem","site_instagram":"site ou Instagram conferido","portfolio":"portfólio abre","motivo":"motivo preenchido","consentimento":"consentimento marcado","categoria":"categoria aceita"}';
begin
  select * into e from public.empresas where id = empresa;
  if lower(coalesce(e.quem_decide, '')) = 'outra pessoa'
     and (coalesce(trim(e.decisor_nome), '') = '' or coalesce(trim(e.decisor_email), '') = '' or coalesce(trim(e.decisor_whatsapp), '') = '') then
    return 'Cadastre o decisor (nome, e-mail e WhatsApp) na ficha antes da Triagem 2.';
  end if;
  select array_agg(rotulos->>i) into faltam
  from unnest(public.itens_triagem1()) i
  where coalesce((e.triagem1->>i)::boolean, false) is not true;
  if faltam is not null then
    return 'Conclua a lista da Triagem 1: ' || array_to_string(faltam, ', ') || '.';
  end if;
  if coalesce(e.receita_situacao, '') <> 'ativa' then return 'Empresa inativa'; end if;
  if exists (select 1 from public.categorias c where c.nome = e.categoria and c.situacao = 'nao_aceita') then
    return 'Categoria não aceita';
  end if;
  return null;
end $$;
