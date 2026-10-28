-- REQ-043 — Jurídico: pastas "Minutas Contratuais" (modelos para baixar e usar) e "Regras de Classificação (Diretrizes)".
-- Ler: Jurídico, Gerente e Direção. Enviar e apagar: Jurídico e Direção. Arquivos em bucket privado, entregues por URL assinada.

create table public.documentos_juridicos (
  id uuid primary key default gen_random_uuid(),
  pasta text not null check (pasta in ('minutas', 'diretrizes')),
  titulo text not null check (char_length(trim(titulo)) between 1 and 120),
  descricao text check (char_length(descricao) <= 500),
  caminho text not null unique,
  nome_arquivo text not null,
  tamanho bigint not null default 0,
  enviado_por uuid references auth.users (id) on delete set null,
  criado_em timestamptz not null default now()
);
create index on public.documentos_juridicos (pasta, criado_em desc);

alter table public.documentos_juridicos enable row level security;
create policy "ler documentos jurídicos" on public.documentos_juridicos for select to authenticated
  using (public.tenho_papel('juridico', 'gerente', 'direcao'));
create policy "enviar documentos jurídicos" on public.documentos_juridicos for insert to authenticated
  with check (public.tenho_papel('juridico', 'direcao') and enviado_por = auth.uid());
create policy "apagar documentos jurídicos" on public.documentos_juridicos for delete to authenticated
  using (public.tenho_papel('juridico', 'direcao'));
grant select, insert, delete on public.documentos_juridicos to authenticated;
grant all on public.documentos_juridicos to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('juridico', 'juridico', false, 20971520, array[
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text', 'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'
]);

create policy "ler arquivos jurídicos" on storage.objects for select to authenticated
  using (bucket_id = 'juridico' and public.tenho_papel('juridico', 'gerente', 'direcao'));
create policy "enviar arquivos jurídicos" on storage.objects for insert to authenticated
  with check (bucket_id = 'juridico' and public.tenho_papel('juridico', 'direcao'));
create policy "apagar arquivos jurídicos" on storage.objects for delete to authenticated
  using (bucket_id = 'juridico' and public.tenho_papel('juridico', 'direcao'));
