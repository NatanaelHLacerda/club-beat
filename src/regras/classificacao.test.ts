import { describe, expect, it } from 'vitest'
import { avaliarAderencia, classificarPorte, padraoFinal, padraoPorPontos, pontosSugeridos, somaPontos } from './classificacao'

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
