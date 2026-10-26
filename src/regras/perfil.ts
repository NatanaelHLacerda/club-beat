// REQ-039 — regras do "Meu perfil": nome e nova senha. O banco repete a regra do nome em atualizar_meu_nome.
export const normalizarNome = (v: string) => v.trim().replace(/\s+/g, ' ')

export function erroNome(v: string): string | null {
  const n = normalizarNome(v)
  return n.length >= 2 && n.length <= 80 ? null : 'Informe um nome de 2 a 80 caracteres.'
}

export function erroNovaSenha(senha: string, confirma: string): string | null {
  if (senha.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.'
  if (senha !== confirma) return 'As duas senhas não são iguais.'
  return null
}
