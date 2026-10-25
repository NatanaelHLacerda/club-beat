// REQ-022 — caminho da empresa no funil e o próximo passo da ficha.
import type { Etapa } from './etapas'
import { formatarData } from './formato'

export type EstadoPasso = 'feito' | 'atual' | 'futuro'
export type Passo = { chave: Etapa; rotulo: string; estado: EstadoPasso }

const ordem: { chave: Etapa; rotulo: string }[] = [
  { chave: 'recebida', rotulo: 'Recebida' },
  { chave: 'triagem1', rotulo: 'Triagem 1' },
  { chave: 'triagem2', rotulo: 'Triagem 2' },
  { chave: 'reuniao', rotulo: 'Reunião' },
  { chave: 'proposta', rotulo: 'Proposta' },
  { chave: 'direcao', rotulo: 'Direção' },
  { chave: 'contrato', rotulo: 'Contrato' },
  { chave: 'ativa', rotulo: 'Ativa' },
  { chave: 'renovacao', rotulo: 'Renovação' },
]

// Direção só aparece quando o caso passou (ou está) por ela. Encerrada conta como tudo feito.
export function passosDoCaminho(etapa: Etapa, passouDirecao: boolean): Passo[] {
  const passos = ordem.filter((p) => p.chave !== 'direcao' || passouDirecao || etapa === 'direcao')
  const pos = etapa === 'encerrada' ? passos.length : passos.findIndex((p) => p.chave === etapa)
  return passos.map((p, i) => ({ ...p, estado: pos < 0 ? 'futuro' : i < pos ? 'feito' : i === pos ? 'atual' : 'futuro' }))
}

export type PrazoDaEmpresa = { descricao: string; prazo: string; situacao: 'no_prazo' | 'vence_hoje' | 'atrasado' }
export type ProximoPasso = { texto: string; aba: string; prazo?: string; situacao?: PrazoDaEmpresa['situacao'] }

const abaDoPrazo: Record<string, string> = {
  'Triagem 1': 'triagem1', 'Triagem 2': 'classificacao', 'Passar à Gerente': 'gerentes', 'Contato da Gerente': 'proposta',
  'Reunião': 'proposta', 'Enviar a proposta': 'proposta', 'Resposta da empresa': 'proposta', 'Decisão da Direção': 'direcao',
  'Minuta do Jurídico': 'contrato', 'Assinatura': 'contrato',
}

export function proximoPasso(e: { etapa: Etapa; retomar_em: string | null; contrato?: { enviado_juridico_em?: string } }, prazo?: PrazoDaEmpresa): ProximoPasso | null {
  if (prazo) return { texto: prazo.descricao, aba: abaDoPrazo[prazo.descricao] ?? 'resumo', prazo: prazo.prazo, situacao: prazo.situacao }
  switch (e.etapa) {
    case 'contrato': return e.contrato?.enviado_juridico_em ? null : { texto: 'Enviar o pacote ao Jurídico', aba: 'contrato' }
    case 'ativa': return { texto: 'Acompanhar entregas e relatórios', aba: 'parceria' }
    case 'renovacao': return { texto: 'Decidir a renovação', aba: 'renovacao' }
    case 'espera': return { texto: e.retomar_em ? `Retomar o contato em ${formatarData(e.retomar_em)}` : 'Retomar o contato', aba: 'tempo' }
    default: return null
  }
}
