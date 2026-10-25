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
