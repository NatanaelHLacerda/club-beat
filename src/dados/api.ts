// Único ponto de acesso a dados. As telas importam daqui, nunca do cliente Supabase.
import { supabase } from './supabase'
import type { Papel, Perfil } from './tipos'

export class ErroApi extends Error {}

function falhou(error: { message: string } | null, padrao: string): never | void {
  if (error) throw new ErroApi(traduzir(error.message) ?? padrao)
}

function traduzir(mensagem: string): string | null {
  // Mensagens de regra do banco já vêm em português (raise exception).
  if (/[áéíóúãõç]/i.test(mensagem) && !/permission denied/i.test(mensagem)) return mensagem
  if (/permission denied|42501/i.test(mensagem)) return 'Você não tem acesso a esta área.'
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
