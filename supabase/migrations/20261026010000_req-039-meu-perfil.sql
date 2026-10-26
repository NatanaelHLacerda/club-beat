-- REQ-039 — Meu perfil: cada pessoa muda o próprio nome. Nada de update livre em perfis.

create function public.atualizar_meu_nome(novo_nome text)
returns void language plpgsql security definer set search_path = public as $$
declare
  nome_limpo text := regexp_replace(trim(coalesce(novo_nome, '')), '\s+', ' ', 'g');
begin
  if auth.uid() is null then
    raise exception 'Entre no CRM para continuar.' using errcode = '42501';
  end if;
  if char_length(nome_limpo) < 2 or char_length(nome_limpo) > 80 then
    raise exception 'Informe um nome de 2 a 80 caracteres.';
  end if;
  update public.perfis set nome = nome_limpo where id = auth.uid() and ativo;
end $$;

revoke execute on function public.atualizar_meu_nome(text) from public, anon;
grant execute on function public.atualizar_meu_nome(text) to authenticated;
