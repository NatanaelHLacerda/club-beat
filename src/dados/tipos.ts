export type Papel = 'primeira_pessoa' | 'gerente' | 'direcao' | 'juridico' | 'financeiro' | 'operacoes'

export const rotuloPapel: Record<Papel, string> = {
  primeira_pessoa: '1ª pessoa',
  gerente: 'Gerente',
  direcao: 'Direção',
  juridico: 'Jurídico',
  financeiro: 'Financeiro',
  operacoes: 'Operações',
}

export type Perfil = {
  id: string
  nome: string
  email: string
  papel: Papel
  admin: boolean
  disponivel: boolean
  ativo: boolean
}
