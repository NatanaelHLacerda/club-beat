-- REQ-002 — Formulário de parcerias (público)

-- Dígitos verificadores do CNPJ (mesma regra de src/regras/formato.ts).
create function public.cnpj_valido(v text) returns boolean language plpgsql immutable as $$
declare
  d text := regexp_replace(coalesce(v, ''), '\D', '', 'g');
  pesos1 int[] := array[5,4,3,2,9,8,7,6,5,4,3,2];
  pesos2 int[] := array[6,5,4,3,2,9,8,7,6,5,4,3,2];
  soma int; r int; dv1 int; dv2 int;
begin
  if length(d) <> 14 or d ~ '^(\d)\1{13}$' then return false; end if;
  soma := 0; for i in 1..12 loop soma := soma + substr(d, i, 1)::int * pesos1[i]; end loop;
  r := soma % 11; dv1 := case when r < 2 then 0 else 11 - r end;
  soma := 0; for i in 1..13 loop soma := soma + substr(d, i, 1)::int * pesos2[i]; end loop;
  r := soma % 11; dv2 := case when r < 2 then 0 else 11 - r end;
  return dv1 = substr(d, 13, 1)::int and dv2 = substr(d, 14, 1)::int;
end $$;

-- Parâmetros do Club (valores que a Direção ainda define ficam nulos).
create table public.parametros (
  chave text primary key,
  valor jsonb,
  descricao text not null
);
insert into public.parametros (chave, valor, descricao) values
  ('whatsapp_club', null, 'WhatsApp do Club mostrado ao fim do formulário (só dígitos, com DDD).'),
  ('prazo_guarda_meses', null, 'Prazo de guarda dos dados do formulário (DP-0203: definir com o Jurídico; até lá, sem apagar).');
alter table public.parametros enable row level security;
create policy "ler parâmetros" on public.parametros for select to authenticated using (true);
create policy "editar parâmetros" on public.parametros for update to authenticated using (public.tenho_papel('direcao') or public.sou_admin());
grant select on public.parametros to authenticated;
grant update (valor) on public.parametros to authenticated;
grant all on public.parametros to service_role;

create function public.parametro_publico(chave_pedida text) returns jsonb
language sql stable security definer set search_path = public as $$
  select valor from public.parametros where chave = chave_pedida and chave in ('whatsapp_club')
$$;
grant execute on function public.parametro_publico(text) to anon, authenticated;

-- Avisos para os usuários do CRM (a central completa vem no REQ-014).
create table public.avisos (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.perfis (id) on delete cascade,
  empresa_id uuid references public.empresas (id) on delete cascade,
  tipo text not null,
  texto text not null,
  lido_em timestamptz,
  em timestamptz not null default now()
);
create index on public.avisos (usuario_id, lido_em, em desc);
alter table public.avisos enable row level security;
create policy "ler meus avisos" on public.avisos for select to authenticated using (usuario_id = auth.uid());
create policy "marcar meus avisos" on public.avisos for update to authenticated using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
grant select on public.avisos to authenticated;
grant update (lido_em) on public.avisos to authenticated;
grant all on public.avisos to service_role;

create function public.avisar_usuario(usuario uuid, empresa uuid, tipo_aviso text, texto_aviso text)
returns void language sql security definer set search_path = public as $$
  insert into public.avisos (usuario_id, empresa_id, tipo, texto)
  select usuario, empresa, tipo_aviso, texto_aviso where usuario is not null
$$;

create function public.avisar_papel(alvo public.papel, empresa uuid, tipo_aviso text, texto_aviso text)
returns void language sql security definer set search_path = public as $$
  insert into public.avisos (usuario_id, empresa_id, tipo, texto)
  select id, empresa, tipo_aviso, texto_aviso from public.perfis where papel = alvo and ativo
$$;
revoke execute on function public.avisar_usuario(uuid, uuid, text, text), public.avisar_papel(public.papel, uuid, text, text) from anon, authenticated;

-- Anexos do formulário: tipos e tamanho no bucket; envio anônimo só na pasta formulario/.
update storage.buckets set allowed_mime_types = array[
  'application/pdf', 'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png', 'image/jpeg', 'image/svg+xml'
] where id = 'anexos';

create policy "enviar arquivos do formulário" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'anexos' and (storage.foldername(name))[1] = 'formulario');

drop policy "ler arquivos de anexos" on storage.objects;
create policy "ler arquivos de anexos" on storage.objects for select to authenticated
  using (bucket_id = 'anexos' and exists (
    select 1 from public.anexos a where a.caminho = storage.objects.name and public.pode_ler_empresa_id(a.empresa_id)
  ));

-- Envio da ficha pelo site. Valida tudo de novo no banco.
create function public.enviar_ficha(dados jsonb, arquivos jsonb default '[]')
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
grant execute on function public.enviar_ficha(jsonb, jsonb) to anon, authenticated;
