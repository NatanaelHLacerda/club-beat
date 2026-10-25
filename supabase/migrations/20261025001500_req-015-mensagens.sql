-- REQ-015 — Mensagens-modelo (documento-base, anexo A)

create table public.modelos_mensagem (
  codigo text primary key,
  titulo text not null,
  texto text not null,
  automatico boolean not null default false,
  interno boolean not null default false,
  ordem integer not null,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid references public.perfis (id)
);

insert into public.modelos_mensagem (codigo, titulo, texto, automatico, interno, ordem) values
  ('A1', 'Confirmação automática ao receber o formulário',
   'Olá, [nome]! Recebemos o interesse da [empresa] em uma parceria com o Club. Nossa equipe vai analisar as informações e retornar em até 1 dia útil. Este envio ainda não é uma proposta. Obrigada pelo contato!', true, false, 1),
  ('PEDIDO_INFO', 'Pedido de informação (Triagem 1)',
   'Olá, [nome]! Obrigada pelo interesse da [empresa]. Para seguirmos com a análise, precisamos de: [itens]. Pode nos enviar em até 7 dias?', false, false, 2),
  ('A2', 'Aviso de que uma Gerente vai entrar em contato',
   'Olá, [nome]! Analisamos o material da [empresa] e gostamos do perfil. Quem vai falar com vocês é [Gerente], Gerente de Negócios do Club. Ela entrará em contato nos próximos dias para marcar uma conversa.', false, false, 3),
  ('A3', 'Convite para a reunião',
   'Olá, [nome]! Aqui é [Gerente], do Club. Gostaria de conhecer melhor a [empresa] e apresentar o nosso espaço. Teria disponibilidade para uma conversa presencial de cerca de uma hora, em [data] ou [data]?', false, false, 4),
  ('A4', 'Retorno com a proposta',
   'Olá, [nome]! Em continuidade à nossa conversa, preparamos a proposta da parceria com o Club. Ela está em anexo. Podemos conversar sobre os detalhes em [data]?', false, false, 5),
  ('A5', 'Recusa educada',
   'Olá, [nome]! Agradecemos o interesse da [empresa]. Neste momento, entendemos que a parceria não combina com o perfil dos nossos membros. Guardaremos o contato para futuras oportunidades.', false, false, 6),
  ('A6', 'Aviso à Gerente: renovação em 90 dias',
   'A parceria com a [empresa] ([padrão]) termina em [data]. Avalie: renovar, mudar de padrão ou encerrar? Resultados, entregas e opinião dos membros estão no CRM.', true, true, 7),
  ('A7', 'Convite de renovação',
   'Olá, [nome]! Nossa parceria chega ao fim em [data]. Gostaríamos de conversar sobre os resultados e sobre uma nova etapa, com novos benefícios. Podemos marcar uma conversa?', false, false, 8);

create table public.mensagens (
  id bigint generated always as identity primary key,
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  modelo text references public.modelos_mensagem (codigo),
  canal text not null check (canal in ('email', 'whatsapp', 'interno')),
  destinatario text,
  texto text not null,
  situacao text not null check (situacao in ('aguardando_envio', 'copiada', 'registrada')),
  autor_id uuid references public.perfis (id),
  em timestamptz not null default now()
);
create index on public.mensagens (empresa_id, em desc);

alter table public.modelos_mensagem enable row level security;
alter table public.mensagens enable row level security;

create policy "ler modelos" on public.modelos_mensagem for select to authenticated using (true);
create policy "editar modelos" on public.modelos_mensagem for update to authenticated
  using (public.sou_admin()) with check (public.sou_admin());
create policy "ler mensagens" on public.mensagens for select to authenticated using (public.pode_ler_empresa_id(empresa_id));

grant select on public.modelos_mensagem to authenticated;
grant update (titulo, texto) on public.modelos_mensagem to authenticated;
grant select on public.mensagens to authenticated;
grant all on public.modelos_mensagem, public.mensagens to service_role;

create function public.marcar_modelo_editado() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.atualizado_em := now();
  new.atualizado_por := auth.uid();
  return new;
end $$;
create trigger modelos_editado before update on public.modelos_mensagem for each row execute function public.marcar_modelo_editado();

create function public.rotulo_padrao(p public.padrao) returns text language sql immutable as $$
  select case p when 'bronze' then 'Bronze' when 'prata' then 'Prata' when 'ouro' then 'Ouro' when 'master' then 'Master' end
$$;

-- Preenche no banco os campos que os dados da empresa conhecem. [data] usa data_ref quando informada.
create function public.preencher_modelo(empresa uuid, codigo_modelo text, data_ref date default null) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  e public.empresas;
  t text;
  gerente text;
begin
  select * into e from public.empresas where id = empresa;
  select texto into t from public.modelos_mensagem where codigo = codigo_modelo;
  if e.id is null or t is null then return null; end if;
  select nome into gerente from public.perfis where id = coalesce(e.responsavel_id, e.gerente1_id);
  t := replace(t, '[nome]', coalesce(split_part(e.contato_nome, ' ', 1), '[nome]'));
  t := replace(t, '[empresa]', e.marca);
  if gerente is not null then t := replace(t, '[Gerente]', regexp_replace(gerente, '\s*\(exemplo\)$', '')); end if;
  if e.padrao_final is not null then t := replace(t, '[padrão]', public.rotulo_padrao(e.padrao_final)); end if;
  if data_ref is not null then t := replace(t, '[data]', to_char(data_ref, 'DD/MM/YYYY')); end if;
  return t;
end $$;

create function public.registrar_mensagem(empresa uuid, modelo text, canal text, texto text)
returns bigint language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  novo bigint;
begin
  if not public.tenho_papel('primeira_pessoa', 'gerente', 'direcao') then
    raise exception 'Você não tem acesso a esta área.' using errcode = '42501';
  end if;
  select * into e from public.empresas where id = empresa;
  if e.id is null then raise exception 'Empresa não encontrada.'; end if;
  if coalesce(trim(texto), '') = '' then raise exception 'Escreva a mensagem antes de enviar.'; end if;
  if texto ~ '\[(nome|empresa|Gerente|data|padrão|itens)\]' then
    raise exception 'Complete os campos entre colchetes antes de enviar.';
  end if;
  if e.etapa in ('recebida', 'triagem1', 'triagem2', 'reuniao') and texto ~ 'R\$' then
    raise exception 'Antes da proposta, as mensagens não citam valores.';
  end if;
  insert into public.mensagens (empresa_id, modelo, canal, destinatario, texto, situacao, autor_id)
  values (empresa, modelo, canal,
    case canal when 'email' then e.contato_email when 'whatsapp' then e.contato_whatsapp end,
    texto, case canal when 'email' then 'aguardando_envio' else 'copiada' end, auth.uid())
  returning id into novo;
  insert into public.historico (empresa_id, tipo, texto, autor_id)
  values (empresa, 'mensagem',
    coalesce(modelo || ' · ', '') || case canal when 'email' then 'e-mail na caixa de saída' else 'copiada para o WhatsApp' end,
    auth.uid());
  return novo;
end $$;

-- Mensagens automáticas (A1 no formulário, A6 na renovação). Sem autor: quem envia é o sistema.
create function public.enviar_modelo_automatico(empresa uuid, codigo_modelo text, data_ref date default null, destino text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  e public.empresas;
  m public.modelos_mensagem;
  texto text;
begin
  select * into e from public.empresas where id = empresa;
  select * into m from public.modelos_mensagem where codigo = codigo_modelo;
  if e.id is null or m.codigo is null then return; end if;
  texto := public.preencher_modelo(empresa, codigo_modelo, data_ref);
  insert into public.mensagens (empresa_id, modelo, canal, destinatario, texto, situacao)
  values (empresa, codigo_modelo, case when m.interno then 'interno' else 'email' end,
    coalesce(destino, e.contato_email), texto, case when m.interno then 'registrada' else 'aguardando_envio' end);
  insert into public.historico (empresa_id, tipo, texto)
  values (empresa, 'mensagem', codigo_modelo || ' · enviada automaticamente' || case when m.interno then '' else ' (caixa de saída)' end);
end $$;

revoke execute on function public.registrar_mensagem(uuid, text, text, text) from anon;
revoke execute on function public.enviar_modelo_automatico(uuid, text, date, text) from anon, authenticated;
grant execute on function public.registrar_mensagem(uuid, text, text, text), public.preencher_modelo(uuid, text, date) to authenticated;
