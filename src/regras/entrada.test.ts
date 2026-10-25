import { describe, expect, it } from 'vitest'
import { textoConferencia, textosEntrada, validarEntradaManual } from './entrada'

const base = { cnpj: '11.222.333/0001-81', marca: 'Exemplo', contato_nome: 'Ana', segmento: 'tecnologia', origem: 'site' }

describe('entrada manual (REQ-003)', () => {
  it('só os cinco campos mínimos são obrigatórios', () => {
    expect(validarEntradaManual(base)).toEqual({})
    expect(Object.keys(validarEntradaManual({}))).toEqual(['cnpj', 'marca', 'contato_nome', 'segmento', 'origem'])
  })
  it('indicação exige quem indicou', () => {
    expect(validarEntradaManual({ ...base, origem: 'indicacao_membro' }).indicado_por).toBe(textosEntrada.indicacao)
    expect(validarEntradaManual({ ...base, origem: 'indicacao_membro', indicado_por: 'Membro' })).toEqual({})
  })
  it('conversa anterior mostra etapa, mês e motivo', () => {
    const t = textoConferencia({ id: '1', marca: 'X', etapa: 'espera', etapa_desde: '2026-03-15T12:00:00Z', motivo_saida: 'Sem acordo', situacao: 'anterior' })
    expect(t).toBe('Já conversou: Em espera desde 03/2026 · Sem acordo')
  })
  it('parceira ativa vira renovação', () => {
    expect(textoConferencia({ id: '1', marca: 'X', etapa: 'ativa', etapa_desde: '2026-03-15T12:00:00Z', motivo_saida: null, situacao: 'ativa' })).toBe(textosEntrada.ativa)
  })
})
