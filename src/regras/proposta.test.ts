import { describe, expect, it } from 'vitest'
import { motivosDirecao, respostaVencida, retomarEmSeisMeses, validarItens, type ItemCardapio } from './proposta'

const cardapio: ItemCardapio[] = [
  { padrao: 'prata', item: 'ativacao_1d', rotulo: 'Ativações de 1 dia', descricao: '', maximo: 4, ordem: 3 },
  { padrao: 'prata', item: 'telas', rotulo: 'Telas do Club', descricao: '', maximo: 1, ordem: 1 },
  { padrao: 'master', item: 'marca_recepcao', rotulo: 'Marca na recepção', descricao: '', maximo: 1, ordem: 10 },
]

describe('proposta (REQ-008)', () => {
  it('Prata não passa de 4 ativações de 1 dia', () => {
    expect(validarItens(cardapio, 'prata', [{ item: 'ativacao_1d', quantidade: 5 }])).toBe('Acima do máximo do padrão: Ativações de 1 dia até 4.')
    expect(validarItens(cardapio, 'prata', [{ item: 'ativacao_1d', quantidade: 4 }])).toBeNull()
  })
  it('item de outro padrão é fora do cardápio', () => {
    expect(validarItens(cardapio, 'prata', [{ item: 'marca_recepcao', quantidade: 1 }])).toMatch(/^Fora do cardápio/)
  })
  it('Prata dentro do cardápio não precisa da Direção; fora do cardápio e exclusividade precisam', () => {
    const base = { padrao: 'prata' as const, candidataMaster: false, tipo: 'patrocinio' as const, categoriaSensivel: false }
    expect(motivosDirecao({ ...base, proposta: {} })).toEqual([])
    expect(motivosDirecao({ ...base, proposta: { fora_do_cardapio: 'algo', exclusividade_categoria: 'nutrição e alimentação' } })).toEqual(['fora do cardápio', 'exclusividade'])
    expect(motivosDirecao({ ...base, padrao: 'ouro', proposta: {} })).toEqual(['padrão Ouro'])
  })
  it('prazo de resposta de 7 dias vencido sem aceite', () => {
    expect(respostaVencida('2026-11-17', null, '2026-11-17')).toBe(true)
    expect(respostaVencida('2026-11-17', null, '2026-11-16')).toBe(false)
    expect(respostaVencida('2026-11-17', '2026-11-15', '2026-11-20')).toBe(false)
  })
  it('sem acordo: retomar em 6 meses', () => {
    expect(retomarEmSeisMeses('2026-11-20')).toBe('2027-05-20')
  })
})
