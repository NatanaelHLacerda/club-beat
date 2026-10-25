// REQ-003 — entrada manual: obrigatórios mínimos, indicação com nome e texto da conferência de CNPJ.
import { rotuloEtapa, type Etapa } from './etapas'
import { cnpjValido } from './formato'

export const origensDeIndicacao = ['indicacao_membro', 'indicacao_funcionario', 'indicacao_direcao']

export const textosEntrada = {
  obrigatorio: 'Preencha este campo.',
  cnpj: 'CNPJ inválido',
  indicacao: 'Informe quem indicou.',
  ativa: 'Já é parceira ativa. Abra a ficha para tratar como renovação.',
} as const

export type DadosEntrada = { cnpj?: string | null; marca?: string | null; contato_nome?: string | null; segmento?: string | null; origem?: string | null; indicado_por?: string | null }

export function validarEntradaManual(d: DadosEntrada): Partial<Record<keyof DadosEntrada, string>> {
  const erros: Partial<Record<keyof DadosEntrada, string>> = {}
  for (const c of ['cnpj', 'marca', 'contato_nome', 'segmento', 'origem'] as const) {
    if (!d[c]?.trim()) erros[c] = textosEntrada.obrigatorio
  }
  if (d.cnpj?.trim() && !cnpjValido(d.cnpj)) erros.cnpj = textosEntrada.cnpj
  if (d.origem && origensDeIndicacao.includes(d.origem) && !d.indicado_por?.trim()) erros.indicado_por = textosEntrada.indicacao
  return erros
}

export type Conferencia = { id: string; marca: string; etapa: Etapa; etapa_desde: string; motivo_saida: string | null; situacao: 'ativa' | 'anterior' }

export function textoConferencia(c: Conferencia): string {
  if (c.situacao === 'ativa') return textosEntrada.ativa
  const desde = new Date(c.etapa_desde).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' })
  return `Já conversou: ${rotuloEtapa[c.etapa]} desde ${desde}${c.motivo_saida ? ` · ${c.motivo_saida}` : ''}`
}
