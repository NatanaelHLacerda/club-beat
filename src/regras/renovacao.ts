// REQ-013 — marcos da renovação e quem decide. A rotina do banco usa os mesmos marcos.
import type { Padrao } from '../dados/tipos'

export type Caminho = 'renovar_igual' | 'renovar_mais' | 'mudar_padrao' | 'encerrar'
export const rotuloCaminho: Record<Caminho, string> = {
  renovar_igual: 'Renovar igual', renovar_mais: 'Renovar com mais benefícios (cláusulas revistas)', mudar_padrao: 'Mudar de padrão', encerrar: 'Encerrar',
}

export type Renovacao = {
  aviso90_em?: string; aviso60_em?: string; aviso30_em?: string
  avaliacao?: { pagamentos_em_dia?: boolean; interesse_empresa?: string; resultados?: string; observacao?: string }
  caminho?: Caminho; novo_padrao?: Padrao | null; aguardando_direcao?: boolean; decidida_em?: string; decidida_por?: string
  encerramento?: Record<string, boolean>; encerrada_em?: string
}

export const itensEncerramento = [
  { id: 'relatorio_final', rotulo: 'Relatório final enviado' },
  { id: 'agradecimento', rotulo: 'Agradecimento à empresa' },
  { id: 'marca_site', rotulo: 'Marca retirada do site' },
  { id: 'marca_telas', rotulo: 'Marca retirada das telas' },
] as const

export const textosRenovacao = {
  direcao: 'Ouro e Master: a Direção decide a renovação.',
  encerramento: 'Marque todos os itens do encerramento.',
  semMotivoEncerramento: 'Informe o motivo do encerramento.',
} as const

export function diasParaOFim(fim: string, hoje: string): number {
  return Math.round((Date.parse(`${fim}T12:00:00Z`) - Date.parse(`${hoje}T12:00:00Z`)) / 86_400_000)
}

// Qual marco já foi alcançado (90, 60, 30) ou null se ainda falta mais de 90 dias.
export function marcoDeRenovacao(fim: string, hoje: string): 90 | 60 | 30 | null {
  const d = diasParaOFim(fim, hoje)
  if (d <= 30) return 30
  if (d <= 60) return 60
  if (d <= 90) return 90
  return null
}

export const quemDecideRenovacao = (padrao: Padrao | null, novo?: Padrao | null) =>
  padrao === 'ouro' || padrao === 'master' || novo === 'ouro' || novo === 'master' ? 'direcao' : 'gerente'

export const pendenciasEncerramento = (marcas: Record<string, boolean>) => itensEncerramento.filter((i) => !marcas[i.id]).map((i) => i.rotulo)

// REQ-044 — o motivo do encerramento é digitado por quem encerra, nunca inventado pelo sistema.
export const motivoEncerramentoValido = (motivo: string) => motivo.trim().length > 0
