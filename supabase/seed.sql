-- Dados de EXEMPLO para o banco local. Nenhum dado aqui é real.
-- Senha de todos os usuários de exemplo: clubbeat-exemplo

-- REQ-001 — usuários de exemplo
do $$
declare
  u record;
begin
  for u in
    select * from (values
      ('00000000-0000-4000-a000-000000000001'::uuid, 'Isabela (exemplo)',  'isabela@clubbeat.exemplo',    'primeira_pessoa'::public.papel, false),
      ('00000000-0000-4000-a000-000000000002'::uuid, 'Fernanda (exemplo)', 'fernanda@clubbeat.exemplo',   'gerente'::public.papel,         true),
      ('00000000-0000-4000-a000-000000000003'::uuid, 'Marcela (exemplo)',  'marcela@clubbeat.exemplo',    'gerente'::public.papel,         false),
      ('00000000-0000-4000-a000-000000000004'::uuid, 'Direção (exemplo)',  'direcao@clubbeat.exemplo',    'direcao'::public.papel,         false),
      ('00000000-0000-4000-a000-000000000005'::uuid, 'Jurídico (exemplo)', 'juridico@clubbeat.exemplo',   'juridico'::public.papel,        false),
      ('00000000-0000-4000-a000-000000000006'::uuid, 'Financeiro (exemplo)','financeiro@clubbeat.exemplo','financeiro'::public.papel,      false),
      ('00000000-0000-4000-a000-000000000007'::uuid, 'Operações (exemplo)','operacoes@clubbeat.exemplo',  'operacoes'::public.papel,       false)
    ) as t(id, nome, email, papel, admin)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
      crypt('clubbeat-exemplo', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('nome', u.nome), now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), u.id, u.id::text,
      jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
      'email', now(), now(), now());
    insert into public.perfis (id, nome, email, papel, admin) values (u.id, u.nome, u.email, u.papel, u.admin);
  end loop;
end $$;

-- REQ-004 — empresas de EXEMPLO espalhadas pelo funil (todas inventadas)
insert into public.empresas (cnpj, razao_social, marca, cidade, uf, segmento, site, instagram, tempo_atuacao,
  faixa_faturamento, faixa_funcionarios, contato_nome, contato_cargo, contato_whatsapp, contato_email, busca,
  motivo_parceria, objetivo, publico, origem, indicado_por, consentimento_em, etapa, etapa_desde,
  gerente1_id, responsavel_id, porte, padrao_final, exemplo, criado_em)
values
  ('11222333000181', 'Verde Vivo Alimentos Ltda (exemplo)', 'Rede Verde (exemplo)', 'Belo Horizonte', 'MG', 'nutrição e alimentação',
   'https://exemplo.invalid/verde', '@redeverde.exemplo', '3 a 10', 'R$ 4,8 mi a R$ 90 mi', '100 a 499', 'Paula Exemplo', 'Gerente de marketing',
   '(31) 90000-0001', 'paula@exemplo.invalid', '{ativações dentro do Club,eventos}', 'Queremos aproximar a marca de um público que cuida da saúde.',
   'criar relacionamento com público de alto padrão', 'Adultos ativos de alta renda', 'site', null, now() - interval '20 days',
   'proposta', now() - interval '3 days', '00000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000002', 'media1', 'prata', true, now() - interval '20 days'),
  ('22333444000181', 'Estética Bairro Ltda (exemplo)', 'Clínica Brisa (exemplo)', 'Belo Horizonte', 'MG', 'beleza e estética',
   null, '@clinicabrisa.exemplo', '1 a 3', 'R$ 360 mil a R$ 4,8 mi', '10 a 49', 'Rita Exemplo', 'Sócia',
   '(31) 90000-0002', 'rita@exemplo.invalid', '{telas do Club}', 'Ser vista pelos membros do Club.',
   'dar a conhecer a marca', 'Mulheres de 30 a 55 anos', 'indicacao_membro', 'Membro Exemplo', now() - interval '2 days',
   'triagem2', now() - interval '1 day', null, null, 'pequena', 'bronze', true, now() - interval '2 days'),
  ('33444555000181', 'Bebidas Nacionais SA (exemplo)', 'Fonte Clara (exemplo)', 'São Paulo', 'SP', 'nutrição e alimentação',
   'https://exemplo.invalid/fonte', '@fonteclara.exemplo', 'mais de 10', 'acima de R$ 300 mi', '500 ou mais', 'Marcos Exemplo', 'Diretor de marca',
   '(11) 90000-0003', 'marcos@exemplo.invalid', '{patrocínio,presença de marca}', 'Presença de marca em espaço premium.',
   'dar a conhecer a marca', 'Público A e B', 'site', null, now() - interval '9 days',
   'reuniao', now() - interval '5 days', '00000000-0000-4000-a000-000000000003', '00000000-0000-4000-a000-000000000003', 'grande', 'ouro', true, now() - interval '9 days'),
  ('44555666000181', 'Studio Movimento ME (exemplo)', 'Studio Movimento (exemplo)', 'Nova Lima', 'MG', 'saúde e bem-estar',
   null, '@studiomov.exemplo', 'menos de 1', 'até R$ 360 mil', 'até 9', 'Júlia Exemplo', 'Proprietária',
   '(31) 90000-0004', 'julia@exemplo.invalid', '{troca de serviços}', 'Trocar aulas por divulgação.',
   'oferecer uma experiência', 'Praticantes de pilates', 'whatsapp', null, now() - interval '1 day',
   'recebida', now() - interval '1 day', null, null, null, null, true, now() - interval '1 day'),
  ('55666777000181', 'Moda Serra Ltda (exemplo)', 'Serra Moda (exemplo)', 'Belo Horizonte', 'MG', 'moda e acessórios',
   'https://exemplo.invalid/serra', '@serramoda.exemplo', '3 a 10', 'R$ 4,8 mi a R$ 90 mi', '50 a 99', 'Caio Exemplo', 'Coordenador comercial',
   '(31) 90000-0005', 'caio@exemplo.invalid', '{eventos,conteúdo e redes sociais}', 'Lançar a coleção esportiva.',
   'lançar um produto', 'Adultos ativos', 'site', null, now() - interval '3 days',
   'triagem1', now() - interval '2 days', null, null, null, null, true, now() - interval '3 days'),
  ('66777888000181', 'Tech Saúde Ltda (exemplo)', 'Pulso App (exemplo)', 'Belo Horizonte', 'MG', 'tecnologia',
   'https://exemplo.invalid/pulso', '@pulsoapp.exemplo', '1 a 3', 'R$ 360 mil a R$ 4,8 mi', '10 a 49', 'Bruno Exemplo', 'CEO',
   '(31) 90000-0006', 'bruno@exemplo.invalid', '{telas do Club,ativações dentro do Club}', 'Apresentar o app de treino.',
   'gerar vendas ou contatos', 'Praticantes de esporte', 'site', null, now() - interval '40 days',
   'contrato', now() - interval '4 days', '00000000-0000-4000-a000-000000000003', '00000000-0000-4000-a000-000000000002', 'pequena', 'prata', true, now() - interval '40 days'),
  ('77888999000181', 'Cafés Especiais Ltda (exemplo)', 'Grão Nobre (exemplo)', 'Belo Horizonte', 'MG', 'nutrição e alimentação',
   null, '@graonobre.exemplo', '3 a 10', 'R$ 360 mil a R$ 4,8 mi', '10 a 49', 'Lia Exemplo', 'Sócia',
   '(31) 90000-0007', 'lia@exemplo.invalid', '{troca de serviços}', 'Servir café nos eventos.',
   'oferecer uma experiência', 'Membros do Club', 'indicacao_direcao', 'Direção', now() - interval '60 days',
   'espera', now() - interval '10 days', '00000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000002', 'pequena', 'bronze', true, now() - interval '60 days'),
  ('88999000000198', 'Apostas Online Ltda (exemplo)', 'Sorte Já (exemplo)', 'Rio de Janeiro', 'RJ', 'outro',
   null, '@sorteja.exemplo', '1 a 3', 'R$ 4,8 mi a R$ 90 mi', '50 a 99', 'Ivo Exemplo', 'Marketing',
   '(21) 90000-0008', 'ivo@exemplo.invalid', '{patrocínio}', 'Patrocinar o Club.',
   'dar a conhecer a marca', 'Adultos', 'site', null, now() - interval '15 days',
   'recusada', now() - interval '14 days', null, null, null, null, true, now() - interval '15 days');

update public.empresas set motivo_saida = 'Categoria não aceita: apostas' where cnpj = '88999000000198';
update public.empresas set motivo_saida = 'Sem acordo de datas neste semestre', retomar_em = current_date + 170 where cnpj = '77888999000181';

-- REQ-006 — parceira ativa de EXEMPLO com exclusividade em nutrição e alimentação
insert into public.empresas (cnpj, razao_social, marca, cidade, uf, segmento, categoria, instagram, contato_nome, contato_email,
  origem, etapa, etapa_desde, gerente1_id, responsavel_id, porte, padrao_final, exemplo, criado_em)
values ('12345678000195', 'Sabor Leve Alimentos Ltda (exemplo)', 'Sabor Leve (exemplo)', 'Belo Horizonte', 'MG', 'nutrição e alimentação',
  'nutrição e alimentação', '@saborleve.exemplo', 'Tina Exemplo', 'tina@exemplo.invalid', 'site', 'ativa', now() - interval '120 days',
  '00000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000002', 'media1', 'ouro', true, now() - interval '200 days');

insert into public.parcerias (empresa_id, inicio, fim, exclusividade_categoria, exclusividade_inicio, exclusividade_fim)
select id, current_date - 120, current_date + 245, 'nutrição e alimentação', current_date - 120, current_date + 245
from public.empresas where cnpj = '12345678000195';

-- Empresas de exemplo que já passaram das triagens têm as triagens concluídas.
update public.empresas set
  triagem1 = '{"formulario":true,"cnpj":true,"nome_cidade":true,"site_instagram":true,"portfolio":true,"motivo":true,"consentimento":true,"categoria":true}',
  receita_situacao = 'ativa',
  categoria = coalesce(categoria, segmento),
  estudo = coalesce(estudo, 'Estudo de exemplo: marca com público parecido com o do Club, busca relacionamento de longo prazo e ações dentro do Club.'),
  triagem2_concluida_em = coalesce(triagem2_concluida_em, etapa_desde - interval '2 days')
where exemplo and etapa in ('reuniao', 'proposta', 'direcao', 'contrato', 'ativa', 'renovacao');

-- Empresas de exemplo já passadas à Gerente (revezamento coerente com o histórico).
update public.empresas set passada_em = triagem2_concluida_em + interval '1 hour', distribuicao = 'revezamento'
where exemplo and gerente1_id is not null and triagem2_concluida_em is not null;

-- REQ-012 — calendário de EXEMPLO (a Direção cadastra o real): sábados de manhã tipo A, quartas tipo B, sextas tipo C.
insert into public.calendario_datas (data, tipo, aula, horario, media_alunos, tema, exemplo)
select d::date,
  case extract(dow from d) when 6 then 'A' when 3 then 'B' else 'C' end,
  case extract(dow from d) when 6 then 'Funcional' when 3 then 'Ciclismo' else 'Pilates' end,
  case extract(dow from d) when 6 then '09:00' when 3 then '07:00' else '18:30' end,
  case extract(dow from d) when 6 then 42 when 3 then 28 else 18 end,
  null, true
from generate_series(current_date + 3, current_date + 120, interval '1 day') d
where extract(dow from d) in (3, 5, 6);

update public.calendario_datas set vespera_feriado = true, tema = 'Véspera de feriado (exemplo)'
where data = (select min(data) from public.calendario_datas where tipo = 'C' and data > current_date + 20);

insert into public.janelas_escolha (ano, grupo, abre_em, fecha_em)
select a, g.grupo, current_date + g.ini, current_date + g.fim
from generate_series(extract(year from current_date)::int, extract(year from current_date)::int + 1) a,
  (values ('master_ouro', -5, 10), ('prata', 11, 25), ('bronze', 26, 90)) g(grupo, ini, fim);

-- Reserva da Rede Verde (Em proposta) e data confirmada da Sabor Leve (Ativa).
update public.calendario_datas set situacao = 'reservada', tipo_acao = 'ativacao', reservada_em = now() - interval '2 days',
  reservada_ate = current_date + 5, reservada_por = '00000000-0000-4000-a000-000000000002',
  empresa_id = (select id from public.empresas where cnpj = '11222333000181')
where data = (select min(data) from public.calendario_datas where tipo = 'C' and not vespera_feriado and data > current_date + 30);
update public.calendario_datas set situacao = 'confirmada', tipo_acao = 'ativacao',
  empresa_id = (select id from public.empresas where cnpj = '12345678000195')
where data = (select min(data) from public.calendario_datas where tipo = 'A' and data > current_date + 6);

-- REQ-008 — reunião realizada e proposta de EXEMPLO da Rede Verde (Prata, Em proposta), aguardando Operações.
update public.empresas set
  reuniao = jsonb_build_object('quando', to_char(now() - interval '6 days', 'YYYY-MM-DD"T"10:00'), 'local', 'Club (presencial)', 'presencial', true,
    'realizada', true, 'objetivo', 'Relacionamento com público de alta renda', 'sucesso', 'Vendas do novo lanche saudável no Club',
    'pedidos_extra', 'Exclusividade em alimentação'),
  formato = 'continua', tipo_parceria = 'patrocinio',
  proposta = '{"itens":[{"item":"telas","quantidade":1},{"item":"ativacao_1d","quantidade":4},{"item":"eventos","quantidade":1}],"prazo_meses":12,"promessa_revisao":"Rever exclusividade ao fim do contrato, com a aceitação dos membros"}'
where cnpj = '11222333000181';
update public.empresas set reuniao = jsonb_build_object('quando', to_char(now() + interval '2 days', 'YYYY-MM-DD"T"15:00'), 'local', 'Club (presencial)', 'presencial', true)
where cnpj like '33444555%';
