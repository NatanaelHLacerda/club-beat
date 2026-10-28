-- REQ-041 — Manutenção: faixas, notas e pontos da ficha de classificação deixam de ser fixos.
-- Valores de fábrica = regras do documento-base (cap. 7). Quem edita: Direção ou admin (mesma regra de `parametros`).
-- Classificações já concluídas guardam o padrão calculado na época; a mudança vale só para cálculos novos.

insert into public.parametros (chave, valor, descricao) values
  ('pontuacao_criterios', '[
    {"id":"porte","rotulo":"Porte","opcoes":[{"rotulo":"Pequena","pontos":1},{"rotulo":"Média I","pontos":2},{"rotulo":"Média II ou grande","pontos":3}]},
    {"id":"investimento","rotulo":"Investimento proposto","opcoes":[{"rotulo":"Faixa Bronze","pontos":1},{"rotulo":"Faixa Prata","pontos":2},{"rotulo":"Faixa Ouro","pontos":3}]},
    {"id":"duracao","rotulo":"Duração pretendida","opcoes":[{"rotulo":"Até 6 meses","pontos":1},{"rotulo":"12 meses","pontos":2},{"rotulo":"Mais de 12 meses","pontos":3}]},
    {"id":"marca","rotulo":"Força da marca","opcoes":[{"rotulo":"Conhecida no bairro ou na cidade","pontos":1},{"rotulo":"Conhecida na região","pontos":2},{"rotulo":"Conhecida em todo o país","pontos":3}]},
    {"id":"contrapartidas","rotulo":"Profundidade das contrapartidas","opcoes":[{"rotulo":"Telas e poucas ativações","pontos":1},{"rotulo":"Ativações e eventos do Club","pontos":2},{"rotulo":"Calendário próprio ou exclusividade","pontos":3}]}
  ]'::jsonb, 'Ficha de pontos: critérios, opções e pontos de cada opção.'),
  ('pontuacao_cortes', '{"minimo":5,"bronze_ate":7,"prata_ate":11}'::jsonb, 'Cortes de pontos: abaixo do mínimo sem padrão; até bronze_ate Bronze; até prata_ate Prata; acima Ouro.'),
  ('pontuacao_investimento', '{"bronze":{"de":null,"ate":null},"prata":{"de":null,"ate":null},"ouro":{"de":null}}'::jsonb, 'Faixas de investimento em centavos; vazio = a Direção ainda não definiu.')
on conflict (chave) do nothing;

-- Padrão pelos pontos agora lê os cortes configurados.
create or replace function public.padrao_por_pontos(soma int) returns public.padrao language sql stable
set search_path = public as $$
  with c as (select valor from public.parametros where chave = 'pontuacao_cortes')
  select case
    when soma < coalesce((select (valor->>'minimo')::int from c), 5) then null
    when soma <= coalesce((select (valor->>'bronze_ate')::int from c), 7) then 'bronze'::public.padrao
    when soma <= coalesce((select (valor->>'prata_ate')::int from c), 11) then 'prata'::public.padrao
    else 'ouro'::public.padrao end
$$;

-- Soma de pontos da ficha: a ficha guarda a opção (1 a 3); os pontos vêm da configuração.
create or replace function public.soma_pontos_ficha(ficha jsonb) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(coalesce((c->'opcoes'->((ficha->>(c->>'id'))::int - 1)->>'pontos')::int, 0)), 0)::int
  from jsonb_array_elements((select valor from public.parametros where chave = 'pontuacao_criterios')) c
$$;

create or replace function public.salvar_config_pontuacao(p_criterios jsonb, p_cortes jsonb, p_investimento jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  ids text[] := array['porte','investimento','duracao','marca','contrapartidas'];
  c jsonb; o jsonb; i int; anterior int; maximo int := 0; menor_ant int;
  minimo int; b int; pr int;
  b_de bigint; b_ate bigint; p_de bigint; p_ate bigint; o_de bigint;
begin
  if not (public.tenho_papel('direcao') or public.sou_admin()) then
    raise exception 'Só a Direção ou o administrador muda a pontuação.' using errcode = '42501';
  end if;
  if jsonb_typeof(p_criterios) <> 'array' or jsonb_array_length(p_criterios) <> 5 then
    raise exception 'São cinco critérios na ficha de pontos.';
  end if;
  for c in select * from jsonb_array_elements(p_criterios) loop
    if not (c->>'id') = any(ids) then raise exception 'Critério desconhecido: %.', c->>'id'; end if;
    if coalesce(trim(c->>'rotulo'), '') = '' then raise exception 'Dê um nome a todos os critérios.'; end if;
    if jsonb_array_length(c->'opcoes') <> 3 then raise exception 'São três opções por critério.'; end if;
    anterior := 0;
    for i in 0..2 loop
      o := c->'opcoes'->i;
      if coalesce(trim(o->>'rotulo'), '') = '' then raise exception 'Descreva todas as opções.'; end if;
      if jsonb_typeof(o->'pontos') <> 'number' or (o->>'pontos') !~ '^\d+$' or (o->>'pontos')::int > 10 then
        raise exception 'Os pontos de cada opção vão de 0 a 10.';
      end if;
      if (o->>'pontos')::int < anterior then raise exception 'Cada opção vale o mesmo ou mais pontos que a anterior.'; end if;
      anterior := (o->>'pontos')::int;
    end loop;
    maximo := maximo + anterior;
  end loop;
  if (select count(distinct x->>'id') from jsonb_array_elements(p_criterios) x) <> 5 then
    raise exception 'Cada critério aparece uma vez.';
  end if;

  minimo := (p_cortes->>'minimo')::int; b := (p_cortes->>'bronze_ate')::int; pr := (p_cortes->>'prata_ate')::int;
  if minimo is null or b is null or pr is null or minimo < 0 or b < minimo or pr <= b or pr >= maximo then
    raise exception 'Cortes inválidos: mínimo ≤ fim do Bronze < fim da Prata < pontuação máxima (%).', maximo;
  end if;

  b_de := (p_investimento->'bronze'->>'de')::bigint; b_ate := (p_investimento->'bronze'->>'ate')::bigint;
  p_de := (p_investimento->'prata'->>'de')::bigint;  p_ate := (p_investimento->'prata'->>'ate')::bigint;
  o_de := (p_investimento->'ouro'->>'de')::bigint;
  if least(coalesce(b_de,0), coalesce(b_ate,0), coalesce(p_de,0), coalesce(p_ate,0), coalesce(o_de,0)) < 0
     or (b_de is not null and b_ate is not null and b_de > b_ate)
     or (p_de is not null and p_ate is not null and p_de > p_ate)
     or (b_ate is not null and p_de is not null and p_de <= b_ate)
     or (p_ate is not null and o_de is not null and o_de <= p_ate) then
    raise exception 'Faixas de investimento inválidas: valores positivos e em ordem crescente.';
  end if;

  update public.parametros set valor = p_criterios where chave = 'pontuacao_criterios';
  update public.parametros set valor = p_cortes where chave = 'pontuacao_cortes';
  update public.parametros set valor = p_investimento where chave = 'pontuacao_investimento';
end $$;
revoke execute on function public.salvar_config_pontuacao(jsonb, jsonb, jsonb), public.soma_pontos_ficha(jsonb) from anon;
grant execute on function public.salvar_config_pontuacao(jsonb, jsonb, jsonb), public.soma_pontos_ficha(jsonb) to authenticated;

-- Triagem 2 passa a somar pelos pontos configurados (resto igual à REQ-006).
create or replace function public.concluir_triagem2(empresa uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  a jsonb;
  p jsonb;
  soma int;
  por_pontos public.padrao;
  faixa public.padrao;
  conflito record;
begin
  if not public.tenho_papel('primeira_pessoa', 'gerente') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  select * into e from public.empresas where id = empresa for update;
  if e.etapa <> 'triagem2' then raise exception 'A empresa não está em Triagem 2.'; end if;
  a := coalesce(e.classificacao->'aderencia', '{}');
  if a->>'membro_primeiro' = 'nao' or (select count(*) from jsonb_each_text(a) where value = 'nao') >= 2 then
    raise exception 'Não combina com o membro: propor recusa com A5.';
  end if;
  if (select count(*) from jsonb_object_keys(a)) < 5 then raise exception 'Responda os cinco critérios de aderência.'; end if;
  if e.porte is null then raise exception 'Classifique o porte.'; end if;
  p := coalesce(e.classificacao->'pontos', '{}');
  if (select count(*) from jsonb_object_keys(p)) < 5 then raise exception 'Preencha os cinco critérios da ficha de pontos.'; end if;
  soma := public.soma_pontos_ficha(p);
  por_pontos := public.padrao_por_pontos(soma);
  faixa := nullif(e.classificacao->>'faixa_investimento', '')::public.padrao;
  if faixa is null then raise exception 'Escolha a faixa de investimento.'; end if;
  if coalesce(trim(e.estudo), '') = '' then raise exception 'Escreva o estudo da empresa para concluir.'; end if;
  select * into conflito from public.conflito_categoria(e.categoria, e.id);
  if conflito.marca is not null then
    raise exception 'Conflito de exclusividade com % até %.', conflito.marca, to_char(conflito.fim, 'DD/MM/YYYY');
  end if;
  update public.empresas set
    padrao_final = public.menor_padrao(por_pontos, faixa),
    classificacao = classificacao || jsonb_build_object('padrao_pontos', por_pontos, 'soma_pontos', soma),
    triagem2_concluida_em = now()
  where id = empresa;
  insert into public.historico (empresa_id, tipo, texto, autor_id)
  values (empresa, 'sistema', 'Triagem 2 concluída: ' || soma || ' pontos · ' ||
    public.rotulo_padrao(public.menor_padrao(por_pontos, faixa)) ||
    case when e.candidata_master then ' · candidata a Master' else '' end, auth.uid());
end $$;
