import { describe, expect, it } from 'vitest'
import { agruparPorDia, arcosDaRosca, barrasDoFunil, pontosDaColuna } from './graficos'

describe('gráficos do painel inicial (REQ-020)', () => {
  it('agrupa chegadas por dia no fuso de São Paulo', () => {
    const r = agruparPorDia(['2026-10-05T15:00:00Z', '2026-10-05T20:00:00Z', '2026-11-01T02:00:00Z'], '2026-10')
    expect(r).toHaveLength(31)
    expect(r[4]).toEqual({ dia: 5, quantidade: 2 })
    expect(r[30]).toEqual({ dia: 31, quantidade: 1 }) // 01/11 02h UTC ainda é 31/10 em São Paulo
  })
  it('pontos: até 8 por coluna', () => {
    expect(pontosDaColuna(3, 5)).toBe(3)
    expect(pontosDaColuna(20, 40)).toBe(4)
    expect(pontosDaColuna(0, 40)).toBe(0)
  })
  it('uma parceria Ouro e nada mais → rosca 100% Ouro', () => {
    const arcos = arcosDaRosca([{ chave: 'bronze', valor: 0 }, { chave: 'prata', valor: 0 }, { chave: 'ouro', valor: 1 }, { chave: 'master', valor: 0 }])
    expect(arcos).toEqual([{ chave: 'ouro', valor: 1, percentual: 100, inicio: 0, fim: 360 }])
  })
  it('funil em azul, largura pela maior etapa', () => {
    const b = barrasDoFunil([{ chave: 'triagem1', rotulo: 'Triagem 1', quantidade: 2 }, { chave: 'recebida', rotulo: 'Recebida', quantidade: 1 }])
    expect(b[0].largura).toBe(100)
    expect(b[1].largura).toBe(50)
    expect(b[0].cor).toBe('#0C1F32')
    expect(barrasDoFunil([{ chave: 'direcao', rotulo: 'Com a Direção', quantidade: 0 }])[0].largura).toBe(0)
  })
})
