-- Permissões iguais no Supabase local e no hospedado.
-- O projeto hospedado concede tudo a anon e authenticated em cada tabela e função nova; o local não.
-- Esta migration zera esse acesso padrão e deixa só o que as migrations dos REQs declaram.

-- Tabelas: só os grants explícitos (as colunas liberadas para update voltam a valer).
revoke all on all tables in schema public from anon, authenticated;

grant select, insert on public.anexos to authenticated;
grant select on public.avisos to authenticated;
grant select, insert, delete on public.calendario_datas to authenticated;
grant select on public.cardapio to authenticated;
grant select on public.categorias to authenticated;
grant select, insert on public.empresas to authenticated;
grant select, insert on public.entregas to authenticated;
grant select, insert, update, delete on public.feriados to authenticated;
grant select, insert on public.historico to authenticated;
grant select, insert, update, delete on public.janelas_escolha to authenticated;
grant select, insert on public.materiais to authenticated;
grant select on public.mensagens to authenticated;
grant select, insert, update, delete on public.metas to authenticated;
grant select on public.modelos_mensagem to authenticated;
grant select on public.pacotes_contrato to authenticated;
grant select on public.parametros to authenticated;
grant select on public.parcerias to authenticated;
grant select on public.perfis to authenticated;
grant select, insert on public.reclamacoes to authenticated;
grant select, insert on public.relatorios to authenticated;

grant update (lido_em) on public.avisos to authenticated;
grant update (data, tipo, vespera_feriado, aula, horario, media_alunos, tema) on public.calendario_datas to authenticated;
grant update (descricao, maximo) on public.cardapio to authenticated;
grant update (situacao) on public.categorias to authenticated;
grant update (
  cnpj, razao_social, marca, cidade, uf, bairro, segmento, site, instagram, tempo_atuacao, faixa_faturamento,
  faixa_funcionarios, unidades, contato_nome, contato_cargo, contato_whatsapp, contato_email, quem_decide,
  busca, motivo_parceria, objetivo, publico, parcerias_anteriores, investimento_faixa, inicio_desejado, duracao,
  datas_interesse, origem, indicado_por
) on public.empresas to authenticated;
grant update (titulo, texto) on public.modelos_mensagem to authenticated;
grant update (valor) on public.parametros to authenticated;

revoke all on all sequences in schema public from anon, authenticated;
grant update on all sequences in schema public to authenticated;

-- Funções: o Postgres dá execute a PUBLIC (todo mundo, inclusive anon); os "revoke ... from anon" dos REQs não bastavam.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to authenticated, service_role;

-- Uso interno (rotinas do pg_cron e funções chamadas por outras funções): ninguém chama pela API.
revoke execute on function
  public.avisar_usuario(uuid, uuid, text, text),
  public.avisar_papel(public.papel, uuid, text, text),
  public.enviar_modelo_automatico(uuid, text, date, text),
  public.abrir_proposta_de_renovacao(public.parcerias, public.padrao),
  public.confirmar_datas_da_empresa(uuid),
  public.alertar_uma_vez(uuid, text),
  public.liberar_reservas_vencidas(date),
  public.rotina_renovacoes(date),
  public.rotina_prazos(date),
  public.rotina_resumo_mensal(date)
from authenticated;

-- Formulário público (REQ-002): o visitante sem login só envia a ficha e lê o WhatsApp do Club.
grant execute on function public.enviar_ficha(jsonb, jsonb), public.parametro_publico(text) to anon;

-- Tabelas e funções criadas daqui em diante nascem fechadas, como no local: cada REQ dá o seu grant.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from anon;
alter default privileges for role postgres revoke execute on functions from public;
alter default privileges for role postgres in schema public grant execute on functions to authenticated, service_role;

-- search_path fixo nas funções que não tinham (aviso do Supabase).
alter function public.cnpj_valido(text) set search_path = public;
alter function public.cpf_valido(text) set search_path = public;
alter function public.data_sp(timestamptz) set search_path = public;
alter function public.hoje_sp() set search_path = public;
alter function public.grupo_do_padrao(public.padrao, boolean) set search_path = public;
alter function public.itens_conferencia_contrato() set search_path = public;
alter function public.itens_triagem1() set search_path = public;
alter function public.menor_padrao(public.padrao, public.padrao) set search_path = public;
alter function public.padrao_por_pontos(integer) set search_path = public;
alter function public.rotulo_padrao(public.padrao) set search_path = public;
