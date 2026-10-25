import { describe, expect, it } from 'vitest'
import { avisoLimiteMes, contratadoFeito, notaMedia, proximoBalanco, proximoRelatorio, textosAcompanhamento } from './acompanhamento'

describe('acompanhamento (REQ-011)', () => {
  it('Prata com 4 ativações contratadas e 1 feita → 1/4', () => {
    const r = contratadoFeito([{ item: 'ativacao_1d', quantidade: 4 }], [{ item: 'ativacao_1d', data: '2026-12-05' }])
    expect(r).toEqual([{ item: 'ativacao_1d', contratado: 4, feito: 1 }])
  })
  it('Ouro: no dia 11 sem relatório do mês anterior está atrasado', () => {
    const r = proximoRelatorio('ouro', '2026-10-01', [{ tipo: 'relatorio', referencia: '2026-10-01' }], '2026-12-11')
    expect(r).toEqual({ referencia: '2026-11-01', prazo: '2026-12-10', atrasado: true })
    expect(proximoRelatorio('ouro', '2026-10-01', [{ tipo: 'relatorio', referencia: '2026-10-01' }], '2026-12-10')?.atrasado).toBe(false)
  })
  it('Prata: relatório a cada 3 meses', () => {
    const r = proximoRelatorio('prata', '2026-12-01', [], '2027-03-05')
    expect(r).toEqual({ referencia: '2026-12-01', prazo: '2027-03-10', atrasado: false })
    expect(proximoRelatorio('prata', '2026-12-01', [], '2027-03-11')?.atrasado).toBe(true)
  })
  it('balanço a cada 3 meses para todos', () => {
    expect(proximoBalanco('2026-12-01', [{ tipo: 'balanco', referencia: '2026-12-01' }], '2027-03-02')?.referencia).toBe('2027-03-01')
  })
  it('limites do mês: outro tipo de ação e 4 dias', () => {
    expect(avisoLimiteMes('eventos', '2026-12-20', [{ item: 'ativacao_1d', data: '2026-12-05' }])).toBe(textosAcompanhamento.outroTipo)
    const quatro = ['05', '12', '19', '26'].map((d) => ({ item: 'ativacao_1d', data: `2026-12-${d}` }))
    expect(avisoLimiteMes('ativacao_1d', '2026-12-28', quatro)).toBe(textosAcompanhamento.quatroDias)
    expect(avisoLimiteMes('telas', '2026-12-28', quatro)).toBeNull()
  })
  it('nota média dos membros', () => {
    expect(notaMedia([4.6, 4.8, null])).toBe(4.7)
    expect(notaMedia([null])).toBeNull()
  })
})
