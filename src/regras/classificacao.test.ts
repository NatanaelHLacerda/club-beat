import { describe, expect, it } from 'vitest'
import {
  avaliarAderencia, chavesPontuacao, classificarPorte, configPontuacaoPadrao, faixasDePontos, lerConfigPontuacao, padraoFinal, padraoPorPontos,
  pontosSugeridos, pontuacaoMaxima, rotuloFaixaInvestimento, somaPontos, validarConfigPontuacao,
} from './classificacao'

describe('porte (REQ-006, cap. 6)', () => {
  it('60 funcionários em serviços e R$ 3 mi/ano → Média I com divergência', () => {
    const r = classificarPorte({ faturamento: 'R$ 360 mil a R$ 4,8 mi', funcionarios: '50 a 99' })
    expect(r.porte).toBe('media1')
    expect(r.nota).toBe('divergência: faturamento indica Pequena')
  })
  it('critérios concordam: clínica de bairro é Pequena', () => {
    expect(classificarPorte({ faturamento: 'R$ 360 mil a R$ 4,8 mi', funcionarios: '10 a 49' })).toEqual({ porte: 'pequena', nota: null, provisorio: false })
  })
  it('Receita "demais" impede Pequena', () => {
    expect(classificarPorte({ faturamento: 'até R$ 360 mil', funcionarios: 'até 9', receitaPorte: 'demais' }).porte).toBe('media1')
  })
  it('franqueada classificada pelo grupo', () => {
    expect(classificarPorte({ faturamento: 'R$ 360 mil a R$ 4,8 mi', funcionarios: 'até 9', grupoFaixa: 'acima de R$ 300 mi' }).porte).toBe('grande')
  })
  it('sem faturamento fica provisório', () => {
    expect(classificarPorte({ faturamento: 'prefiro informar na reunião', funcionarios: '10 a 49' }).provisorio).toBe(true)
  })
})

describe('pontos e padrão (REQ-006, cap. 7)', () => {
  it('2+2+2+2+2 = 10 → Prata', () => {
    const r = padraoFinal({ porte: 2, investimento: 2, duracao: 2, marca: 2, contrapartidas: 2 }, 'prata')
    expect(r).toEqual({ pontos: 10, porPontos: 'prata', final: 'prata', limitadoPeloInvestimento: false })
  })
  it('13 pontos com investimento Prata → Prata, limitado pelo investimento', () => {
    const r = padraoFinal({ porte: 3, investimento: 2, duracao: 2, marca: 3, contrapartidas: 3 }, 'prata')
    expect(r.porPontos).toBe('ouro')
    expect(r.final).toBe('prata')
    expect(r.limitadoPeloInvestimento).toBe(true)
  })
  it('faixas de pontos', () => {
    expect(padraoPorPontos(5)).toBe('bronze')
    expect(padraoPorPontos(7)).toBe('bronze')
    expect(padraoPorPontos(8)).toBe('prata')
    expect(padraoPorPontos(12)).toBe('ouro')
  })
  it('sugere pontos de porte, investimento e duração', () => {
    const p = pontosSugeridos('media1', 'prata', '12 meses')
    expect(p).toEqual({ porte: 2, investimento: 2, duracao: 2 })
    expect(somaPontos(p)).toBe(6)
  })
})

describe('aderência (REQ-006)', () => {
  it('"não" em o membro primeiro reprova', () => {
    expect(avaliarAderencia({ membro_primeiro: 'nao' }).reprovada).toBe(true)
  })
  it('dois "não" reprovam; um "não" fora do membro não', () => {
    expect(avaliarAderencia({ visao: 'nao', longo_prazo: 'nao' }).reprovada).toBe(true)
    expect(avaliarAderencia({ visao: 'nao', membro_primeiro: 'sim' }).reprovada).toBe(false)
  })
})

describe('pontuação configurável (REQ-041)', () => {
  const base = () => structuredClone(configPontuacaoPadrao)

  it('o padrão de fábrica é válido e mantém 5–7 bronze, 8–11 prata, 12–15 ouro', () => {
    expect(validarConfigPontuacao(base())).toEqual([])
    expect(faixasDePontos().map((f) => [f.padrao, f.de, f.ate])).toEqual([['bronze', 5, 7], ['prata', 8, 11], ['ouro', 12, 15]])
  })

  it('cortes novos mudam o padrão', () => {
    expect(padraoPorPontos(9)).toBe('prata')
    expect(padraoPorPontos(9, { minimo: 5, bronze_ate: 9, prata_ate: 12 })).toBe('bronze')
    expect(padraoPorPontos(4)).toBeNull()
  })

  it('pontos por opção vêm da configuração', () => {
    const c = base()
    c.criterios[0].opcoes[2].pontos = 5
    expect(somaPontos({ porte: 3 }, c.criterios)).toBe(5)
    expect(pontuacaoMaxima(c.criterios)).toBe(17)
  })

  it('rejeita configuração incoerente', () => {
    const c = base()
    c.cortes = { minimo: 5, bronze_ate: 7, prata_ate: 7 }
    expect(validarConfigPontuacao(c).length).toBeGreaterThan(0)
    const d = base()
    d.criterios[1].opcoes[0].pontos = 9
    expect(validarConfigPontuacao(d).some((e) => e.includes('mesmo ou mais'))).toBe(true)
    const e = base()
    e.investimento.prata.de = 100
    e.investimento.bronze.ate = 500
    expect(validarConfigPontuacao(e).length).toBeGreaterThan(0)
  })

  it('lerConfigPontuacao cai no padrão quando falta ou está quebrada', () => {
    expect(lerConfigPontuacao([])).toEqual(configPontuacaoPadrao)
    expect(lerConfigPontuacao([{ chave: chavesPontuacao.cortes, valor: { minimo: 9, bronze_ate: 2, prata_ate: 1 } }])).toEqual(configPontuacaoPadrao)
    const cortes = { minimo: 6, bronze_ate: 8, prata_ate: 12 }
    expect(lerConfigPontuacao([{ chave: chavesPontuacao.cortes, valor: cortes }]).cortes).toEqual(cortes)
  })

  it('rotula a faixa de investimento com valores ou "R$ …"', () => {
    expect(rotuloFaixaInvestimento('prata')).toBe('Faixa Prata (R$ …)')
    const f = { bronze: { de: 100000, ate: 500000 }, prata: { de: 500100, ate: 900000 }, ouro: { de: 900100 } }
    expect(rotuloFaixaInvestimento('ouro', f)).toContain('a partir de')
    expect(rotuloFaixaInvestimento('prata', f)).toContain(' a ')
  })
})
