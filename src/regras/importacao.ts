// REQ-017 — leitura e validação da planilha de parceiros atuais (colunas da aba "Parcerias ativas", cap. 11).
import { cnpjValido, soDigitos } from './formato'

export const colunasImportacao = [
  'cnpj', 'marca', 'razao_social', 'contato_nome', 'contato_email', 'contato_whatsapp', 'segmento', 'categoria', 'padrao', 'tipo',
  'inicio', 'fim', 'valor_mensal', 'troca', 'contrapartidas', 'entregas_feitas', 'exclusividade_categoria', 'exclusividade_fim',
  'responsavel_email', 'contrato_assinado',
] as const

export type Item = { item: string; quantidade: number }

export type LinhaImportacao = {
  linha: number; cnpj: string; marca: string; razao_social: string; contato_nome: string; contato_email: string; contato_whatsapp: string
  segmento: string; categoria: string; padrao: string; tipo: string; inicio: string | null; fim: string | null
  valor_centavos: number | null; troca: boolean; contrapartidas: Item[]; entregas: Item[]
  exclusividade_categoria: string; exclusividade_fim: string | null; responsavel_email: string; contrato_assinado: boolean
}

// CSV simples com aspas; aceita ";" (Excel em português) ou ",".
export function lerCsv(texto: string): string[][] {
  const limpo = texto.replace(/^﻿/, '')
  const primeira = limpo.split(/\r?\n/)[0] ?? ''
  const sep = (primeira.match(/;/g)?.length ?? 0) >= (primeira.match(/,/g)?.length ?? 0) ? ';' : ','
  const linhas: string[][] = []
  let campo = ''
  let linha: string[] = []
  let aspas = false
  for (let i = 0; i < limpo.length; i++) {
    const c = limpo[i]
    if (aspas) {
      if (c === '"' && limpo[i + 1] === '"') { campo += '"'; i++ }
      else if (c === '"') aspas = false
      else campo += c
    } else if (c === '"') aspas = true
    else if (c === sep) { linha.push(campo); campo = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && limpo[i + 1] === '\n') i++
      linha.push(campo); campo = ''
      if (linha.some((x) => x.trim())) linhas.push(linha)
      linha = []
    } else campo += c
  }
  linha.push(campo)
  if (linha.some((x) => x.trim())) linhas.push(linha)
  return linhas
}

export function lerData(v: string): string | null {
  const t = v.trim()
  if (!t) return null
  const br = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  const iso = br ? `${br[3]}-${br[2]}-${br[1]}` : t
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(Date.parse(iso)) ? iso : 'invalida'
}

export function lerValor(v: string): number | null {
  const t = v.replace(/R\$\s*/i, '').trim()
  if (!t) return null
  const n = Number(t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t)
  return Number.isFinite(n) ? Math.round(n * 100) : null
}

export function lerItens(v: string): Item[] {
  return v.split(/[;|]/).map((p) => p.trim()).filter(Boolean).map((p) => {
    const [item, qtd] = p.split(':')
    return { item: item.trim(), quantidade: qtd ? Number(qtd) : 1 }
  }).filter((i) => i.item && Number.isFinite(i.quantidade))
}

const simNao = (v: string) => /^(s|sim|x|true|1)$/i.test(v.trim())

export type ResultadoLeitura = { validas: LinhaImportacao[]; erros: { linha: number; motivo: string }[] }

export function interpretarPlanilha(texto: string): ResultadoLeitura {
  const [cabecalho, ...corpo] = lerCsv(texto)
  const idx = (c: string) => (cabecalho ?? []).findIndex((h) => h.trim().toLowerCase() === c)
  const validas: LinhaImportacao[] = []
  const erros: { linha: number; motivo: string }[] = []
  corpo.forEach((cols, n) => {
    const linha = n + 2
    const v = (c: (typeof colunasImportacao)[number]) => (idx(c) >= 0 ? (cols[idx(c)] ?? '').trim() : '')
    const motivo = validarLinha(v)
    if (motivo) { erros.push({ linha, motivo }); return }
    validas.push({
      linha, cnpj: soDigitos(v('cnpj')), marca: v('marca'), razao_social: v('razao_social'), contato_nome: v('contato_nome'),
      contato_email: v('contato_email'), contato_whatsapp: v('contato_whatsapp'), segmento: v('segmento'), categoria: v('categoria'),
      padrao: v('padrao').toLowerCase(), tipo: v('tipo').toLowerCase(), inicio: lerData(v('inicio')), fim: lerData(v('fim')),
      valor_centavos: lerValor(v('valor_mensal')), troca: simNao(v('troca')), contrapartidas: lerItens(v('contrapartidas')),
      entregas: lerItens(v('entregas_feitas')), exclusividade_categoria: v('exclusividade_categoria'),
      exclusividade_fim: lerData(v('exclusividade_fim')), responsavel_email: v('responsavel_email'), contrato_assinado: simNao(v('contrato_assinado')),
    })
  })
  return { validas, erros }
}

export function validarLinha(v: (c: (typeof colunasImportacao)[number]) => string): string | null {
  if (!v('cnpj')) return 'CNPJ obrigatório'
  if (!cnpjValido(v('cnpj'))) return 'CNPJ inválido'
  if (!v('marca')) return 'Nome da marca obrigatório'
  const inicio = lerData(v('inicio'))
  const fim = lerData(v('fim'))
  if (inicio === 'invalida' || fim === 'invalida' || Boolean(inicio) !== Boolean(fim) || (inicio && fim && fim < inicio)) {
    return 'Início e fim em dd/mm/aaaa ou aaaa-mm-dd, fim depois do início'
  }
  if (simNao(v('contrato_assinado')) && !inicio) return 'Contrato assinado exige início e fim'
  const padrao = v('padrao').toLowerCase()
  if (padrao && !['bronze', 'prata', 'ouro', 'master'].includes(padrao)) return 'Padrão deve ser Bronze, Prata, Ouro ou Master'
  return null
}
