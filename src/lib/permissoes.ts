// Única fonte de permissão da tela. O banco garante o mesmo por RLS e rpc.
import type { Papel, Perfil } from '../dados/tipos'

export type Acao =
  | 'ver_crm'
  | 'gerir_usuarios'
  | 'editar_empresa'
  | 'triar'
  | 'conduzir'
  | 'decidir_direcao'
  | 'juridico'
  | 'financeiro'
  | 'operacoes'
  | 'configurar'
  | 'publicar_calendario'
  | 'manter_parcerias'

const matriz: Record<Acao, Papel[]> = {
  ver_crm: ['primeira_pessoa', 'gerente', 'direcao', 'juridico', 'financeiro', 'operacoes'],
  gerir_usuarios: [],
  editar_empresa: ['primeira_pessoa', 'gerente'],
  triar: ['primeira_pessoa', 'gerente'],
  conduzir: ['gerente'],
  decidir_direcao: ['direcao'],
  juridico: ['juridico'],
  financeiro: ['financeiro'],
  operacoes: ['operacoes'],
  configurar: ['direcao'],
  publicar_calendario: ['direcao', 'primeira_pessoa'],
  manter_parcerias: ['primeira_pessoa', 'gerente'],
}

export function pode(perfil: Pick<Perfil, 'papel' | 'admin' | 'ativo'> | null, acao: Acao): boolean {
  if (!perfil || !perfil.ativo) return false
  if (acao === 'gerir_usuarios') return perfil.admin
  return matriz[acao].includes(perfil.papel)
}
