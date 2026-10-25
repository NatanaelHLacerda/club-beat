import { describe, expect, it } from 'vitest'
import { ordemFila, pendenciasPassagem, proximaNoRevezamento } from './passagem'

const fernanda = { id: 'f', nome: 'Fernanda' }
const marcela = { id: 'm', nome: 'Marcela' }

describe('passagem (REQ-007)', () => {
  it('a última foi para Fernanda → próxima é Marcela, e volta', () => {
    expect(proximaNoRevezamento([fernanda, marcela], 'f')).toBe(marcela)
    expect(proximaNoRevezamento([fernanda, marcela], 'm')).toBe(fernanda)
  })
  it('Marcela indisponível → tudo vai para Fernanda', () => {
    expect(proximaNoRevezamento([fernanda], 'f')).toBe(fernanda)
    expect(proximaNoRevezamento([], 'f')).toBeNull()
  })
  it('ficha de passagem incompleta lista o que falta', () => {
    expect(pendenciasPassagem({ busca: 'x' })).toContain('Prazo combinado para o retorno')
    expect(pendenciasPassagem({ busca: 'a', apresentado: 'b', pediu_mais: 'c', prometido_rever: 'd', datas_interesse: 'e', precisa_direcao: 'nao', prazo_retorno: '2026-11-10' })).toEqual([])
  })
  it('fila: Master/Ouro antes de Prata, Bronze por último', () => {
    expect(ordemFila('prata', true)).toBeLessThan(ordemFila('ouro', false))
    expect(ordemFila('ouro', false)).toBeLessThan(ordemFila('prata', false))
    expect(ordemFila('bronze', false)).toBeLessThan(ordemFila(null, false))
  })
})
