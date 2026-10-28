import { describe, expect, it } from 'vitest'
import { alertaCategoria, bloqueioCategoriaSemReceita, bloqueioCnpj, pendenciasTriagem1, semRetorno, textosTriagem1 } from './triagem1'

describe('primeira triagem (REQ-005)', () => {
  it('lista completa não tem pendências', () => {
    const todas = { formulario: true, cnpj: true, nome_cidade: true, site_instagram: true, portfolio: true, motivo: true, consentimento: true, categoria: true }
    expect(pendenciasTriagem1(todas)).toEqual([])
    expect(pendenciasTriagem1({ ...todas, portfolio: false })).toEqual(['Portfólio anexado e abre'])
  })
  it('apostas é não aceita; serviços financeiros pede Jurídico e Direção', () => {
    expect(alertaCategoria('nao_aceita')).toBe(textosTriagem1.naoAceita)
    expect(alertaCategoria('sensivel')).toBe(textosTriagem1.sensivel)
    expect(alertaCategoria('aceita')).toBeNull()
  })
  it('CNPJ baixado na Receita é empresa inativa', () => {
    expect(bloqueioCnpj('baixada')).toBe(textosTriagem1.inativa)
    expect(bloqueioCnpj('ativa')).toBeNull()
  })
  it('categoria só libera depois da situação na Receita registrada', () => {
    expect(bloqueioCategoriaSemReceita('')).toBe(textosTriagem1.consulteReceitaAntes)
    expect(bloqueioCategoriaSemReceita(null)).toBe(textosTriagem1.consulteReceitaAntes)
    expect(bloqueioCategoriaSemReceita('baixada')).toBeNull()
    expect(bloqueioCategoriaSemReceita('ativa')).toBeNull()
  })
  it('pedido em 01/11 sem resposta aparece em 08/11', () => {
    expect(semRetorno('2026-11-01', '2026-11-07')).toBe(false)
    expect(semRetorno('2026-11-01', '2026-11-08')).toBe(true)
    expect(semRetorno(null, '2026-11-08')).toBe(false)
  })
})
