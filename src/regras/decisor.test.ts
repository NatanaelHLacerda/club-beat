import { describe, expect, it } from 'vitest'
import { decisorConsolidado, pendenciaDecisor, validarDecisor } from './decisor'

describe('decisor da parceria (REQ-042)', () => {
  it('exige a resposta na entrada nova, mas não nas empresas antigas', () => {
    expect(validarDecisor({})).toEqual({ quem_decide: 'Informe quem decide a parceria.' })
    expect(validarDecisor({}, false)).toEqual({})
  })
  it('"eu mesmo" não pede dados do decisor', () => {
    expect(validarDecisor({ quem_decide: 'eu mesmo' })).toEqual({})
  })
  it('"outra pessoa" exige nome, e-mail e WhatsApp válidos', () => {
    expect(Object.keys(validarDecisor({ quem_decide: 'outra pessoa' }))).toEqual(['decisor_nome', 'decisor_email', 'decisor_whatsapp'])
    expect(validarDecisor({ quem_decide: 'Outra pessoa', decisor_nome: 'Ana', decisor_email: 'ana@x.com', decisor_whatsapp: '(11) 91234-5678' })).toEqual({})
    const e = validarDecisor({ quem_decide: 'outra pessoa', decisor_nome: 'Ana', decisor_email: 'ana', decisor_whatsapp: '123' })
    expect(e.decisor_email).toBeDefined()
    expect(e.decisor_whatsapp).toBeDefined()
  })
  it('consolida o decisor para a Triagem 2 sem pedir de novo', () => {
    const base = { contato_nome: 'Bia', contato_email: 'bia@x.com', contato_whatsapp: '11999990000' }
    expect(decisorConsolidado({ ...base, quem_decide: 'eu mesmo' })).toMatchObject({ nome: 'Bia', quem: 'responsavel' })
    expect(decisorConsolidado({ ...base, quem_decide: 'outra pessoa', decisor_nome: 'Caio', decisor_email: 'c@x.com', decisor_whatsapp: '1188887777' }))
      .toMatchObject({ nome: 'Caio', email: 'c@x.com', quem: 'outra_pessoa' })
    expect(decisorConsolidado(base)).toEqual({ nome: null, email: null, whatsapp: null, quem: 'nao_informado' })
  })
  it('só trava a Triagem 2 quando "outra pessoa" está incompleta', () => {
    expect(pendenciaDecisor({ quem_decide: 'outra pessoa' })).not.toBeNull()
    expect(pendenciaDecisor({ quem_decide: 'eu mesmo' })).toBeNull()
    expect(pendenciaDecisor({})).toBeNull()
  })
})
