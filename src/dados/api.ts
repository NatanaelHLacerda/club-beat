// Único ponto de acesso a dados. As telas importam daqui, nunca do cliente Supabase.
import { supabase } from './supabase'
import type { Conferencia } from '../regras/entrada'
import type { Ficha } from '../regras/formulario'
import type { MarcasTriagem1 } from '../regras/triagem1'
import type { FichaPassagem } from '../regras/passagem'
import type { Janela, TipoAcao } from '../regras/calendario'
import type { ConfirmacaoOperacoes, ItemCardapio, Proposta, Reuniao } from '../regras/proposta'
import type { Decisao } from '../regras/direcao'
import type { Conferencia as ConferenciaContrato, Pacote, TipoMinuta } from '../regras/contrato'
import type { Anexo, Aviso, CamposEditaveis, DataDoCalendario, Categoria, Conflito, FichaClassificacao, Padrao, Porte, Empresa, Etapa, FiltrosEmpresas, ItemHistorico, Mensagem, ModeloMensagem, Papel, Perfil, TipoAnexo } from './tipos'

export class ErroApi extends Error {}

function falhou(error: { message: string; code?: string } | null, padrao: string): never | void {
  if (error) throw new ErroApi(traduzir(error) ?? padrao)
}

function traduzir({ message, code }: { message: string; code?: string }): string | null {
  // Regras do banco (raise exception) chegam com o código P0001 e o texto já em português.
  if (code === 'P0001') return message
  if (code === '42501' || /permission denied/i.test(message)) return 'Você não tem acesso a esta área.'
  return null
}

// ── Sessão (REQ-001) ──────────────────────────────────────────────

export async function entrar(email: string, senha: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw new ErroApi('E-mail ou senha incorretos.')
}

export async function sair() {
  await supabase.auth.signOut()
}

export async function pedirNovaSenha(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/redefinir-senha`,
  })
  falhou(error, 'Não foi possível enviar o link agora. Tente de novo em alguns minutos.')
}

export async function definirNovaSenha(senha: string) {
  const { error } = await supabase.auth.updateUser({ password: senha })
  falhou(error, 'Não foi possível trocar a senha. Peça um novo link.')
}

export function aoMudarSessao(callback: (logado: boolean) => void) {
  const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => callback(Boolean(sessao)))
  return () => data.subscription.unsubscribe()
}

export async function perfilAtual(): Promise<Perfil | null> {
  const { data: sessao } = await supabase.auth.getSession()
  const id = sessao.session?.user.id
  if (!id) return null
  const { data, error } = await supabase.from('perfis').select('*').eq('id', id).maybeSingle()
  falhou(error, 'Não foi possível carregar o seu perfil.')
  return (data as Perfil | null) ?? null
}

// ── Usuários (REQ-001) ────────────────────────────────────────────

export async function listarUsuarios(): Promise<Perfil[]> {
  const { data, error } = await supabase.from('perfis').select('*').order('nome')
  falhou(error, 'Não foi possível carregar os usuários.')
  return (data ?? []) as Perfil[]
}

export async function criarUsuario(dados: { email: string; nome: string; papel: Papel; senha: string }) {
  const { data, error } = await supabase.functions.invoke('usuarios', { body: dados })
  if (error) {
    const corpo = await (error as { context?: Response }).context?.json?.().catch(() => null)
    throw new ErroApi(corpo?.erro ?? 'Não foi possível criar o usuário.')
  }
  return data as { id: string }
}

export async function alterarPapel(usuario: string, papel: Papel, admin: boolean) {
  const { error } = await supabase.rpc('definir_papel', { usuario, novo_papel: papel, novo_admin: admin })
  falhou(error, 'Não foi possível alterar o papel.')
}

export async function alterarDisponibilidade(usuario: string, valor: boolean) {
  const { error } = await supabase.rpc('definir_disponibilidade', { usuario, valor })
  falhou(error, 'Não foi possível alterar a disponibilidade.')
}

// ── Empresas e funil (REQ-004) ────────────────────────────────────

export async function listarEmpresas(filtros: FiltrosEmpresas = {}): Promise<Empresa[]> {
  let q = supabase.from('empresas').select('*').order('criado_em', { ascending: false })
  if (filtros.padrao) q = q.eq('padrao_final', filtros.padrao)
  if (filtros.porte) q = q.eq('porte', filtros.porte)
  if (filtros.segmento) q = q.eq('segmento', filtros.segmento)
  if (filtros.origem) q = q.eq('origem', filtros.origem)
  if (filtros.gerente) q = q.or(`gerente1_id.eq.${filtros.gerente},gerente2_id.eq.${filtros.gerente},responsavel_id.eq.${filtros.gerente}`)
  const termo = filtros.busca?.trim()
  if (termo) {
    const digitos = termo.replace(/\D/g, '')
    const seguro = termo.replace(/[%,()*]/g, ' ')
    q = q.or([`marca.ilike.%${seguro}%`, `razao_social.ilike.%${seguro}%`, ...(digitos.length >= 3 ? [`cnpj.like.%${digitos}%`] : [])].join(','))
  }
  const { data, error } = await q
  falhou(error, 'Não foi possível carregar as empresas.')
  return (data ?? []) as Empresa[]
}

export async function obterEmpresa(id: string): Promise<Empresa | null> {
  const { data, error } = await supabase.from('empresas').select('*').eq('id', id).maybeSingle()
  falhou(error, 'Não foi possível carregar a empresa.')
  return (data as Empresa | null) ?? null
}

export async function atualizarEmpresa(id: string, campos: Partial<CamposEditaveis>) {
  const { error } = await supabase.from('empresas').update(campos).eq('id', id)
  falhou(error, 'Não foi possível salvar as alterações.')
}

export async function moverEtapa(id: string, para: Etapa, motivo?: string, retomar?: string) {
  const { error } = await supabase.rpc('mover_etapa', { empresa: id, para, motivo: motivo || null, retomar: retomar || null })
  falhou(error, 'Não foi possível mudar a etapa.')
}

export async function listarHistorico(empresa: string): Promise<ItemHistorico[]> {
  const { data, error } = await supabase.from('historico').select('*').eq('empresa_id', empresa).order('em', { ascending: false }).order('id', { ascending: false })
  falhou(error, 'Não foi possível carregar a linha do tempo.')
  return (data ?? []) as ItemHistorico[]
}

export async function adicionarNota(empresa: string, texto: string) {
  const { data: sessao } = await supabase.auth.getSession()
  const { error } = await supabase.from('historico').insert({ empresa_id: empresa, tipo: 'nota', texto, autor_id: sessao.session?.user.id })
  falhou(error, 'Não foi possível salvar a nota.')
}

export async function listarAnexos(empresa: string): Promise<Anexo[]> {
  const { data, error } = await supabase.from('anexos').select('*').eq('empresa_id', empresa).order('criado_em', { ascending: false })
  falhou(error, 'Não foi possível carregar os anexos.')
  return (data ?? []) as Anexo[]
}

export const limiteAnexo = 20 * 1024 * 1024

export async function enviarAnexo(empresa: string, tipo: TipoAnexo, arquivo: File) {
  if (arquivo.size > limiteAnexo) throw new ErroApi('Arquivo acima de 20 MB.')
  const caminho = `empresa/${empresa}/${crypto.randomUUID()}-${arquivo.name.replace(/[^\w.-]+/g, '_')}`
  const { error: erroArquivo } = await supabase.storage.from('anexos').upload(caminho, arquivo)
  falhou(erroArquivo, 'Não foi possível enviar o arquivo.')
  const { data: sessao } = await supabase.auth.getSession()
  const { error } = await supabase.from('anexos').insert({ empresa_id: empresa, tipo, caminho, nome: arquivo.name, tamanho: arquivo.size, autor_id: sessao.session?.user.id })
  falhou(error, 'Não foi possível registrar o anexo.')
}

export async function urlAnexo(caminho: string): Promise<string> {
  const { data, error } = await supabase.storage.from('anexos').createSignedUrl(caminho, 300)
  falhou(error, 'Não foi possível abrir o arquivo.')
  return data!.signedUrl
}

// ── Mensagens (REQ-015) ───────────────────────────────────────────

export async function listarModelos(): Promise<ModeloMensagem[]> {
  const { data, error } = await supabase.from('modelos_mensagem').select('*').order('ordem')
  falhou(error, 'Não foi possível carregar os modelos.')
  return (data ?? []) as ModeloMensagem[]
}

export async function salvarModelo(codigo: string, titulo: string, texto: string) {
  const { error } = await supabase.from('modelos_mensagem').update({ titulo, texto }).eq('codigo', codigo)
  falhou(error, 'Não foi possível salvar o modelo.')
}

export async function listarMensagens(empresa: string): Promise<Mensagem[]> {
  const { data, error } = await supabase.from('mensagens').select('*').eq('empresa_id', empresa).order('em', { ascending: false })
  falhou(error, 'Não foi possível carregar as mensagens.')
  return (data ?? []) as Mensagem[]
}

export async function registrarMensagem(empresa: string, modelo: string | null, canal: 'email' | 'whatsapp', texto: string) {
  const { error } = await supabase.rpc('registrar_mensagem', { empresa, modelo, canal, texto })
  falhou(error, 'Não foi possível registrar a mensagem.')
}

// ── Formulário público e avisos (REQ-002) ─────────────────────────

export type ArquivoFicha = { arquivo: File; tipo: TipoAnexo }

export async function enviarFicha(ficha: Ficha, arquivos: ArquivoFicha[], segundos: number, isca: string) {
  const envio = crypto.randomUUID()
  const enviados: { caminho: string; nome: string; tamanho: number; tipo: TipoAnexo }[] = []
  for (const { arquivo, tipo } of arquivos) {
    if (arquivo.size > limiteAnexo) throw new ErroApi('Arquivo acima de 20 MB')
    const caminho = `formulario/${envio}/${crypto.randomUUID()}-${arquivo.name.replace(/[^\w.-]+/g, '_')}`
    const { error } = await supabase.storage.from('anexos').upload(caminho, arquivo)
    if (error) throw new ErroApi(/mime|type/i.test(error.message) ? 'Tipo de arquivo não aceito. Use PDF, PPT, PPTX, PNG, JPG ou SVG.' : 'Não foi possível enviar o arquivo. Tente de novo.')
    enviados.push({ caminho, nome: arquivo.name, tamanho: arquivo.size, tipo })
  }
  const dados = { ...ficha, cnpj: ficha.cnpj.replace(/\D/g, ''), segundos, site_empresa_confirmacao: isca }
  const { error } = await supabase.rpc('enviar_ficha', { dados, arquivos: enviados })
  falhou(error, 'Não foi possível enviar a ficha agora. Tente de novo em instantes.')
}

export async function whatsappDoClub(): Promise<string | null> {
  const { data } = await supabase.rpc('parametro_publico', { chave_pedida: 'whatsapp_club' })
  return typeof data === 'string' && data ? data : null
}

export async function listarAvisos(): Promise<Aviso[]> {
  const { data, error } = await supabase.from('avisos').select('*').order('lido_em', { ascending: true, nullsFirst: true }).order('em', { ascending: false }).limit(200)
  falhou(error, 'Não foi possível carregar os avisos.')
  return (data ?? []) as Aviso[]
}

export async function contarAvisosNaoLidos(): Promise<number> {
  const { count, error } = await supabase.from('avisos').select('id', { count: 'exact', head: true }).is('lido_em', null)
  falhou(error, 'Não foi possível contar os avisos.')
  return count ?? 0
}

export async function marcarAvisoLido(id: number) {
  const { error } = await supabase.from('avisos').update({ lido_em: new Date().toISOString() }).eq('id', id)
  falhou(error, 'Não foi possível marcar o aviso.')
}

// ── Entrada manual (REQ-003) ──────────────────────────────────────

export async function conferirCnpj(cnpj: string): Promise<Conferencia | null> {
  const { data, error } = await supabase.rpc('conferir_cnpj', { cnpj_pedido: cnpj })
  falhou(error, 'Não foi possível conferir o CNPJ.')
  return ((data as Conferencia[] | null) ?? [])[0] ?? null
}

export async function cadastrarEmpresa(campos: Partial<CamposEditaveis>): Promise<string> {
  const { data, error } = await supabase.from('empresas').insert({ ...campos, cnpj: (campos.cnpj ?? '').replace(/\D/g, '') }).select('id').single()
  if (error?.code === '23505') throw new ErroApi('Já existe uma empresa com este CNPJ.')
  falhou(error, 'Não foi possível cadastrar a empresa.')
  return (data as { id: string }).id
}

// ── Primeira triagem (REQ-005) ────────────────────────────────────

export async function listarCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase.from('categorias').select('*').order('ordem')
  falhou(error, 'Não foi possível carregar as categorias.')
  return (data ?? []) as Categoria[]
}

export async function salvarCategoria(nome: string, situacao: Categoria['situacao']) {
  const { error } = await supabase.from('categorias').update({ situacao }).eq('nome', nome)
  falhou(error, 'Não foi possível salvar a categoria.')
}

export async function salvarTriagem1(empresa: string, itens: MarcasTriagem1, categoria: string, situacaoReceita: string, porteReceita: string) {
  const { error } = await supabase.rpc('salvar_triagem1', {
    empresa, itens, categoria_escolhida: categoria, situacao_receita: situacaoReceita, porte_receita: porteReceita,
  })
  falhou(error, 'Não foi possível salvar a triagem.')
}

export async function encerrarComA5(empresa: string, textoA5: string, motivo: string) {
  await registrarMensagem(empresa, 'A5', 'email', textoA5)
  await moverEtapa(empresa, 'recusada', motivo)
}

// ── Classificação (REQ-006) ───────────────────────────────────────

export async function conferirConflito(categoria: string, empresa: string): Promise<Conflito | null> {
  const { data, error } = await supabase.rpc('conflito_categoria', { categoria_pedida: categoria, empresa })
  falhou(error, 'Não foi possível conferir conflitos.')
  return ((data as Conflito[] | null) ?? [])[0] ?? null
}

export async function salvarClassificacao(empresa: string, ficha: FichaClassificacao, porte: Porte | null, padrao: Padrao | null, estudo: string, master: boolean) {
  const { error } = await supabase.rpc('salvar_classificacao', {
    empresa, ficha, porte_calc: porte, padrao_calc: padrao, texto_estudo: estudo, master,
  })
  falhou(error, 'Não foi possível salvar a classificação.')
}

export async function concluirTriagem2(empresa: string) {
  const { error } = await supabase.rpc('concluir_triagem2', { empresa })
  falhou(error, 'Não foi possível concluir a Triagem 2.')
}

// ── Distribuição e passagem (REQ-007) ─────────────────────────────

export async function sugerirGerente(): Promise<string | null> {
  const { data, error } = await supabase.rpc('sugerir_gerente')
  falhou(error, 'Não foi possível sugerir a Gerente.')
  return (data as string | null) ?? null
}

export async function passarAGerente(empresa: string, gerente: string | null, motivo: string) {
  const { error } = await supabase.rpc('passar_a_gerente', { empresa, gerente, motivo: motivo || null })
  falhou(error, 'Não foi possível passar à Gerente.')
}

export async function definirGerente2(empresa: string, gerente: string, ficha: FichaPassagem, responsavel: string) {
  const { error } = await supabase.rpc('definir_gerente2', { empresa, gerente, ficha, responsavel })
  falhou(error, 'Não foi possível definir a Gerente 2.')
}

const etapasDaFila: Etapa[] = ['triagem2', 'reuniao', 'proposta', 'direcao', 'contrato', 'ativa', 'renovacao']

export async function listarMinhaFila(usuario: string): Promise<Empresa[]> {
  const { data, error } = await supabase.from('empresas').select('*')
    .or(`gerente1_id.eq.${usuario},gerente2_id.eq.${usuario},responsavel_id.eq.${usuario}`)
    .in('etapa', etapasDaFila)
    .order('passada_em', { ascending: true })
  falhou(error, 'Não foi possível carregar a sua fila.')
  return (data ?? []) as Empresa[]
}

// ── Calendário (REQ-012) ──────────────────────────────────────────

export async function listarDatas(ano: number): Promise<DataDoCalendario[]> {
  const { data, error } = await supabase.from('calendario_datas').select('*').gte('data', `${ano}-01-01`).lte('data', `${ano}-12-31`).order('data')
  falhou(error, 'Não foi possível carregar o calendário.')
  return (data ?? []) as DataDoCalendario[]
}

export async function listarJanelas(ano: number): Promise<Janela[]> {
  const { data, error } = await supabase.from('janelas_escolha').select('*').eq('ano', ano)
  falhou(error, 'Não foi possível carregar as janelas.')
  return (data ?? []) as Janela[]
}

export async function salvarJanela(j: Janela) {
  const { error } = await supabase.from('janelas_escolha').upsert(j)
  falhou(error, 'Não foi possível salvar a janela.')
}

export type NovaData = Pick<DataDoCalendario, 'data' | 'tipo' | 'vespera_feriado' | 'aula' | 'horario' | 'media_alunos' | 'tema'>

export async function cadastrarData(d: NovaData) {
  const { error } = await supabase.from('calendario_datas').insert(d)
  falhou(error, 'Não foi possível cadastrar a data.')
}

export async function apagarData(id: string) {
  const { error } = await supabase.from('calendario_datas').delete().eq('id', id)
  falhou(error, 'Não foi possível apagar a data.')
}

export async function reservarData(data: string, empresa: string, acao: TipoAcao) {
  const { error } = await supabase.rpc('reservar_data', { data_id: data, empresa, acao })
  falhou(error, 'Não foi possível reservar a data.')
}

export async function liberarData(data: string, motivo?: string) {
  const { error } = await supabase.rpc('liberar_data', { data_id: data, motivo: motivo || null })
  falhou(error, 'Não foi possível liberar a data.')
}

export async function trocarData(antiga: string, nova: string, pedido: string) {
  const { error } = await supabase.rpc('trocar_data', { data_antiga: antiga, data_nova: nova, pedido })
  falhou(error, 'Não foi possível trocar a data.')
}

export async function listarEmpresasParaReserva(): Promise<Empresa[]> {
  const { data, error } = await supabase.from('empresas').select('*').in('etapa', ['reuniao', 'proposta', 'direcao', 'contrato', 'ativa', 'renovacao']).order('marca')
  falhou(error, 'Não foi possível carregar as empresas.')
  return (data ?? []) as Empresa[]
}

// ── Reunião e proposta (REQ-008) ──────────────────────────────────

export async function listarCardapio(): Promise<ItemCardapio[]> {
  const { data, error } = await supabase.from('cardapio').select('*').order('ordem')
  falhou(error, 'Não foi possível carregar o cardápio.')
  return (data ?? []) as ItemCardapio[]
}

export async function salvarItemCardapio(padrao: string, item: string, descricao: string, maximo: number | null) {
  const { error } = await supabase.from('cardapio').update({ descricao, maximo }).eq('padrao', padrao).eq('item', item)
  falhou(error, 'Não foi possível salvar o item do cardápio.')
}

export async function salvarReuniao(empresa: string, dados: Reuniao) {
  const { error } = await supabase.rpc('salvar_reuniao', { empresa, dados })
  falhou(error, 'Não foi possível salvar a reunião.')
}

export async function salvarProposta(empresa: string, dados: Proposta, formato: string, tipo: string) {
  const { error } = await supabase.rpc('salvar_proposta', { empresa, dados, formato_novo: formato, tipo_novo: tipo })
  falhou(error, 'Não foi possível salvar a proposta.')
}

export async function confirmarOperacoes(empresa: string, dados: ConfirmacaoOperacoes) {
  const { error } = await supabase.rpc('confirmar_operacoes', { empresa, dados })
  falhou(error, 'Não foi possível confirmar.')
}

export async function enviarProposta(empresa: string) {
  const { error } = await supabase.rpc('enviar_proposta', { empresa })
  falhou(error, 'Não foi possível registrar o envio.')
}

export async function registrarAceite(empresa: string): Promise<Etapa> {
  const { data, error } = await supabase.rpc('registrar_aceite', { empresa })
  falhou(error, 'Não foi possível registrar o aceite.')
  return data as Etapa
}

export async function listarParaOperacoes(): Promise<Empresa[]> {
  const { data, error } = await supabase.from('empresas').select('*').in('etapa', ['proposta', 'direcao']).order('etapa_desde')
  falhou(error, 'Não foi possível carregar as propostas.')
  return (data ?? []) as Empresa[]
}

// ── Porta da Direção (REQ-009) ────────────────────────────────────

export async function levarADirecao(empresa: string, recomendacao: string) {
  const { error } = await supabase.rpc('levar_a_direcao', { empresa, recomendacao })
  falhou(error, 'Não foi possível levar à Direção.')
}

export async function decidirDirecao(empresa: string, decisao: Decisao, motivo: string, comoMaster: boolean, destinoRecusa: 'espera' | 'recusada', retomar: string | null) {
  const { data, error } = await supabase.rpc('decidir_direcao', {
    empresa, decisao, motivo, como_master: comoMaster, destino_recusa: destinoRecusa, retomar,
  })
  falhou(error, 'Não foi possível registrar a decisão.')
  return data as Etapa
}

export async function listarParaDirecao(): Promise<Empresa[]> {
  const { data, error } = await supabase.from('empresas').select('*').eq('etapa', 'direcao').order('etapa_desde')
  falhou(error, 'Não foi possível carregar as decisões.')
  return (data ?? []) as Empresa[]
}

export async function vagaMasterOcupada(exceto: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('vaga_master_ocupada', { exceto })
  falhou(error, 'Não foi possível conferir a vaga de Master.')
  return Boolean(data)
}

export async function listarFeriados(): Promise<{ data: string; nome: string }[]> {
  const { data, error } = await supabase.from('feriados').select('*').order('data')
  falhou(error, 'Não foi possível carregar os feriados.')
  return (data ?? []) as { data: string; nome: string }[]
}

export async function listarDatasDaEmpresa(empresa: string): Promise<DataDoCalendario[]> {
  const { data, error } = await supabase.from('calendario_datas').select('*').eq('empresa_id', empresa).order('data')
  falhou(error, 'Não foi possível carregar as datas da empresa.')
  return (data ?? []) as DataDoCalendario[]
}

// ── Contrato e assinatura (REQ-010) ───────────────────────────────

export async function obterPacote(empresa: string): Promise<Pacote | null> {
  const { data, error } = await supabase.from('pacotes_contrato').select('endereco, signatario_nome, signatario_cpf, email_assinatura').eq('empresa_id', empresa).maybeSingle()
  falhou(error, 'Não foi possível carregar o pacote do contrato.')
  return (data as Pacote | null) ?? null
}

export async function enviarAoJuridico(empresa: string, p: Pacote) {
  const { error } = await supabase.rpc('enviar_ao_juridico', { empresa, endereco: p.endereco, nome: p.signatario_nome, cpf: p.signatario_cpf, email: p.email_assinatura })
  falhou(error, 'Não foi possível enviar ao Jurídico.')
}

export async function conferirContrato(empresa: string, minutaTipo: TipoMinuta, conferencia: ConferenciaContrato, divergencia: string, pronto: boolean) {
  const { error } = await supabase.rpc('conferir_contrato', { empresa, minuta_tipo: minutaTipo, conferencia, divergencia, pronto })
  falhou(error, 'Não foi possível salvar a conferência.')
}

export async function registrarAssinatura(empresa: string, inicio: string, fim: string, testemunhas: boolean) {
  const { error } = await supabase.rpc('registrar_assinatura', { empresa, inicio, fim, testemunhas })
  falhou(error, 'Não foi possível registrar a assinatura.')
}

export async function listarParaJuridico(): Promise<Empresa[]> {
  const { data, error } = await supabase.from('empresas').select('*').eq('etapa', 'contrato').order('etapa_desde')
  falhou(error, 'Não foi possível carregar os contratos.')
  return (data ?? []) as Empresa[]
}
