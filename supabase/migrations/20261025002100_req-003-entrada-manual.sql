-- REQ-003 — Entrada manual e indicação

alter table public.empresas alter column razao_social drop not null;
alter table public.empresas add constraint indicacao_exige_nome
  check (origem not in ('indicacao_membro', 'indicacao_funcionario', 'indicacao_direcao') or coalesce(trim(indicado_por), '') <> '');
alter table public.empresas add constraint cnpj_com_digitos_validos check (public.cnpj_valido(cnpj));

-- O que a base já sabe sobre um CNPJ (para a tela avisar antes de cadastrar).
create function public.conferir_cnpj(cnpj_pedido text)
returns table (id uuid, marca text, etapa public.etapa, etapa_desde timestamptz, motivo_saida text, situacao text)
language sql stable security definer set search_path = public as $$
  select e.id, e.marca, e.etapa, e.etapa_desde, e.motivo_saida,
    case when e.etapa in ('ativa', 'renovacao') then 'ativa' else 'anterior' end
  from public.empresas e
  where e.cnpj = regexp_replace(coalesce(cnpj_pedido, ''), '\D', '', 'g')
    and public.tenho_papel('primeira_pessoa', 'gerente', 'direcao')
$$;
revoke execute on function public.conferir_cnpj(text) from anon;
grant execute on function public.conferir_cnpj(text) to authenticated;

-- Indicação: lembrete para a 1ª pessoa dar retorno a quem indicou (DP-0301).
create function public.lembrete_indicacao() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.origem in ('indicacao_membro', 'indicacao_funcionario', 'indicacao_direcao') then
    perform public.avisar_papel('primeira_pessoa', new.id, 'retorno_indicacao',
      'Avise ' || new.indicado_por || ' que o contato da ' || new.marca || ' foi recebido.');
  end if;
  return new;
end $$;
create trigger empresas_lembrete_indicacao after insert on public.empresas for each row execute function public.lembrete_indicacao();

-- enviar_ficha (REQ-002) com o aviso ao responsável quando o CNPJ é de parceira ativa.
create or replace function public.enviar_ficha(dados jsonb, arquivos jsonb default '[]')
returns void language plpgsql security definer set search_path = public as $$
declare
  cnpj_limpo text := regexp_replace(coalesce(dados->>'cnpj', ''), '\D', '', 'g');
  existente uuid;
  nova uuid;
  arq jsonb;
  obrigatorios text[] := array['cnpj', 'razao_social', 'marca', 'cidade', 'uf', 'segmento', 'tempo_atuacao',
    'faixa_faturamento', 'faixa_funcionarios', 'contato_nome', 'contato_cargo', 'contato_whatsapp', 'contato_email',
    'motivo_parceria', 'objetivo', 'publico'];
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
      quem_decide, busca, motivo_parceria, objetivo, publico, parcerias_anteriores, investimento_faixa, inicio_desejado,
      duracao, datas_interesse, origem, indicado_por, consentimento_em, criado_por)
    values (cnpj_limpo, trim(dados->>'razao_social'), trim(dados->>'marca'), trim(dados->>'cidade'), upper(dados->>'uf'),
      nullif(trim(dados->>'bairro'), ''), dados->>'segmento', nullif(trim(dados->>'site'), ''), nullif(trim(dados->>'instagram'), ''),
      dados->>'tempo_atuacao', dados->>'faixa_faturamento', dados->>'faixa_funcionarios', nullif(dados->>'unidades', '')::int,
      trim(dados->>'contato_nome'), trim(dados->>'contato_cargo'), trim(dados->>'contato_whatsapp'), trim(dados->>'contato_email'),
      nullif(dados->>'quem_decide', ''), array(select jsonb_array_elements_text(dados->'busca')), trim(dados->>'motivo_parceria'),
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
