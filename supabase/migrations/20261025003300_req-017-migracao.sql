-- REQ-017 — Migração dos parceiros atuais

-- Cada linha é tratada sozinha: uma falha não derruba as outras. Devolve o relatório por linha.
create function public.importar_parceiros(linhas jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  l jsonb;
  resultado jsonb := '[]';
  nova uuid;
  resp uuid;
  inicio date;
  fim date;
  etapa_final public.etapa;
  it jsonb;
  i int;
  cnpj_l text;
  par uuid;
begin
  if not public.tenho_papel('primeira_pessoa', 'gerente') then raise exception 'Você não tem acesso a esta área.' using errcode = '42501'; end if;
  for l in select * from jsonb_array_elements(coalesce(linhas, '[]')) loop
    begin
      cnpj_l := regexp_replace(coalesce(l->>'cnpj', ''), '\D', '', 'g');
      if cnpj_l = '' then raise exception 'CNPJ obrigatório'; end if;
      if not public.cnpj_valido(cnpj_l) then raise exception 'CNPJ inválido'; end if;
      if exists (select 1 from public.empresas where cnpj = cnpj_l) then raise exception 'Já existe no CRM'; end if;
      if coalesce(trim(l->>'marca'), '') = '' then raise exception 'Nome da marca obrigatório'; end if;
      inicio := nullif(l->>'inicio', '')::date;
      fim := nullif(l->>'fim', '')::date;
      if (inicio is null) <> (fim is null) or (fim < inicio) then raise exception 'Início e fim em dd/mm/aaaa ou aaaa-mm-dd, fim depois do início'; end if;
      if coalesce((l->>'contrato_assinado')::boolean, false) and inicio is null then raise exception 'Contrato assinado exige início e fim'; end if;
      select id into resp from public.perfis where lower(email) = lower(l->>'responsavel_email') and papel = 'gerente';

      etapa_final := case
        when not coalesce((l->>'contrato_assinado')::boolean, false) then 'contrato'
        when fim - public.hoje_sp() < 0 then 'encerrada'
        when fim - public.hoje_sp() <= 90 then 'renovacao'
        else 'ativa' end;

      insert into public.empresas (cnpj, razao_social, marca, segmento, categoria, contato_nome, contato_email, contato_whatsapp,
        origem, etapa, etapa_desde, gerente1_id, responsavel_id, padrao_final, tipo_parceria, triagem2_concluida_em, passada_em,
        proposta, criado_por)
      values (cnpj_l, nullif(trim(l->>'razao_social'), ''), trim(l->>'marca'), coalesce(nullif(l->>'segmento', ''), 'outro'),
        (select nome from public.categorias where nome = l->>'categoria'),
        coalesce(nullif(trim(l->>'contato_nome'), ''), 'A definir'), nullif(trim(l->>'contato_email'), ''), nullif(trim(l->>'contato_whatsapp'), ''),
        'contato_direto', etapa_final, now(), resp, resp, nullif(l->>'padrao', '')::public.padrao, nullif(l->>'tipo', ''), now(), now(),
        jsonb_build_object('itens', coalesce(l->'contrapartidas', '[]'), 'inicio', inicio,
          'valor_mensal_centavos', l->'valor_centavos', 'troca', coalesce((l->>'troca')::boolean, false),
          'exclusividade_categoria', nullif(l->>'exclusividade_categoria', ''),
          'aceite_em', now(), 'importado', true,
          'direcao_aprovada_em', case when nullif(l->>'exclusividade_categoria', '') is not null then now() end),
        auth.uid())
      returning id into nova;

      if etapa_final <> 'contrato' then
        insert into public.parcerias (empresa_id, situacao, inicio, fim, padrao, tipo_parceria, valor_mensal_centavos, troca, contrapartidas,
          responsavel_id, exclusividade_categoria, exclusividade_inicio, exclusividade_fim)
        values (nova, case when etapa_final = 'encerrada' then 'encerrada' else 'vigente' end, inicio, fim,
          nullif(l->>'padrao', '')::public.padrao, nullif(l->>'tipo', ''), (l->>'valor_centavos')::bigint,
          coalesce((l->>'troca')::boolean, false), coalesce(l->'contrapartidas', '[]'), resp,
          (select nome from public.categorias where nome = l->>'exclusividade_categoria'),
          case when nullif(l->>'exclusividade_categoria', '') is not null then inicio end,
          case when nullif(l->>'exclusividade_categoria', '') is not null then coalesce(nullif(l->>'exclusividade_fim', '')::date, fim) end)
        returning id into par;
        update public.empresas set contrato = jsonb_build_object('assinado_em', inicio, 'importado', true) where id = nova;
        for it in select * from jsonb_array_elements(coalesce(l->'entregas', '[]')) loop
          for i in 1..greatest(coalesce((it->>'quantidade')::int, 0), 0) loop
            insert into public.entregas (parceria_id, item, data, descricao, privacidade_ok, autor_id)
            values (par, it->>'item', inicio, 'Entrega anterior ao CRM (importada)', true, auth.uid());
          end loop;
        end loop;
      end if;

      insert into public.historico (empresa_id, tipo, texto, autor_id)
      values (nova, 'sistema', 'Importado da base atual de parceiros · linha ' || (l->>'linha') ||
        case when nullif(l->>'padrao', '') is null then ' · padrão a classificar' else '' end, auth.uid());
      resultado := resultado || jsonb_build_object('linha', l->'linha', 'ok', true, 'empresa_id', nova, 'etapa', etapa_final);
    exception when others then
      resultado := resultado || jsonb_build_object('linha', l->'linha', 'ok', false, 'motivo', sqlerrm);
    end;
  end loop;
  return resultado;
end $$;
revoke execute on function public.importar_parceiros(jsonb) from anon;
grant execute on function public.importar_parceiros(jsonb) to authenticated;
