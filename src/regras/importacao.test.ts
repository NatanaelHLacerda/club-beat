import { describe, expect, it } from 'vitest'
import { colunasImportacao, interpretarPlanilha, lerCsv, lerItens, lerValor } from './importacao'

const cabecalho = colunasImportacao.join(';')
const linha = (cnpj: string, marca: string) => {
  const v: Record<string, string> = { cnpj, marca, inicio: '01/03/2026', fim: '28/02/2027', contrato_assinado: 'sim', padrao: 'Prata', contrapartidas: 'telas:1;ativacao_1d:4' }
  return colunasImportacao.map((c) => v[c] ?? '').join(';')
}

describe('importação de parceiros atuais (REQ-017)', () => {
  it('12 linhas, 2 sem CNPJ: 10 importáveis e 2 recusadas com o motivo', () => {
    const corpo = Array.from({ length: 12 }, (_, i) => linha(i === 3 || i === 8 ? '' : '11.222.333/0001-81', `Parceiro ${i + 1}`))
    const r = interpretarPlanilha([cabecalho, ...corpo].join('\n'))
    expect(r.validas).toHaveLength(10)
    expect(r.erros).toEqual([{ linha: 5, motivo: 'CNPJ obrigatório' }, { linha: 10, motivo: 'CNPJ obrigatório' }])
    expect(r.validas[0].inicio).toBe('2026-03-01')
    expect(r.validas[0].padrao).toBe('prata')
  })
  it('lê aspas e vírgula como separador', () => {
    expect(lerCsv('a,b\n"x, y",2')).toEqual([['a', 'b'], ['x, y', '2']])
  })
  it('valores em reais e itens do cardápio', () => {
    expect(lerValor('R$ 1.234,56')).toBe(123456)
    expect(lerValor('')).toBeNull()
    expect(lerItens('telas:1; ativacao_1d:4')).toEqual([{ item: 'telas', quantidade: 1 }, { item: 'ativacao_1d', quantidade: 4 }])
  })
  it('fim antes do início é recusado', () => {
    const v: Record<string, string> = { cnpj: '11.222.333/0001-81', marca: 'X', inicio: '01/03/2027', fim: '01/03/2026' }
    const r = interpretarPlanilha([cabecalho, colunasImportacao.map((c) => v[c] ?? '').join(';')].join('\n'))
    expect(r.erros[0].motivo).toMatch(/fim depois do início/)
  })
})
