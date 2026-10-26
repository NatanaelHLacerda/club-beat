-- REQ-040 — Foto de perfil: bucket privado, cada pessoa só mexe na própria pasta; a equipe logada vê as fotos.

alter table public.perfis add column foto_caminho text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-perfil', 'fotos-perfil', false, 1048576, array['image/jpeg']);

create policy "ver fotos da equipe" on storage.objects for select to authenticated
  using (bucket_id = 'fotos-perfil');
create policy "enviar a própria foto" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "trocar a própria foto" on storage.objects for update to authenticated
  using (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "apagar a própria foto" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = auth.uid()::text);

-- Aponta (ou tira, com null) a foto atual da própria pessoa. Só aceita arquivo que já está na pasta dela.
create function public.definir_minha_foto(caminho text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'Entre no CRM para continuar.' using errcode = '42501';
  end if;
  if caminho is not null and (
    split_part(caminho, '/', 1) <> auth.uid()::text
    or not exists (select 1 from storage.objects o where o.bucket_id = 'fotos-perfil' and o.name = caminho)
  ) then
    raise exception 'Foto inválida.' using errcode = '42501';
  end if;
  update public.perfis set foto_caminho = caminho where id = auth.uid() and ativo;
end $$;

revoke execute on function public.definir_minha_foto(text) from public, anon;
grant execute on function public.definir_minha_foto(text) to authenticated;
