// REQ-015 — preenchimento das mensagens-modelo. O banco confere as mesmas travas em registrar_mensagem.
import type { Etapa } from './etapas'

export type DadosMensagem = { nome?: string | null; empresa?: string | null; gerente?: string | null; data?: string | null; padrao?: string | null }

export const mensagensModelo = {
  semValor: 'Antes da proposta, as mensagens não citam valores.',
  camposAbertos: 'Complete os campos entre colchetes antes de enviar.',
  caixaDeSaida: 'Mensagem guardada na caixa de saída. O envio automático começa quando o provedor de e-mail for configurado.',
  copiada: 'Texto copiado. Cole no WhatsApp da empresa.',
} as const

const semExemplo = (v: string) => v.replace(/\s*\(exemplo\)$/i, '')

export function preencherModelo(texto: string, d: DadosMensagem): string {
  let t = texto
  const trocar = (campo: string, valor?: string | null) => { if (valor) t = t.split(`[${campo}]`).join(valor) }
  trocar('nome', d.nome?.split(' ')[0])
  trocar('empresa', d.empresa)
  trocar('Gerente', d.gerente ? semExemplo(d.gerente) : null)
  trocar('padrão', d.padrao)
  trocar('data', d.data)
  return t
}

export const camposAbertos = (texto: string) => texto.match(/\[(nome|empresa|Gerente|data|padrão|itens)\]/g) ?? []

export const citaValor = (texto: string) => /R\$/.test(texto)

const antesDaProposta: Etapa[] = ['recebida', 'triagem1', 'triagem2', 'reuniao']

export function bloqueioDeEnvio(etapa: Etapa, texto: string): string | null {
  if (camposAbertos(texto).length) return mensagensModelo.camposAbertos
  if (antesDaProposta.includes(etapa) && citaValor(texto)) return mensagensModelo.semValor
  return null
}
