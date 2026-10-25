import { describe, expect, it } from 'vitest'
import { fichaVazia, textosFormulario, validarEtapa, type Ficha } from './formulario'

const etapa1: Ficha = {
  ...fichaVazia, cnpj: '11.222.333/0001-81', razao_social: 'Exemplo Ltda', marca: 'Exemplo', cidade: 'Belo Horizonte', uf: 'MG',
  segmento: 'tecnologia', instagram: '@exemplo', tempo_atuacao: '1 a 3', faixa_faturamento: 'até R$ 360 mil', faixa_funcionarios: 'até 9',
}

describe('formulário de parcerias (REQ-002)', () => {
  it('etapa 1 completa passa', () => {
    expect(validarEtapa(1, etapa1)).toEqual({})
  })
  it('CNPJ 11.111.111/1111-11 é inválido', () => {
    expect(validarEtapa(1, { ...etapa1, cnpj: '11.111.111/1111-11' }).cnpj).toBe(textosFormulario.cnpj)
  })
  it('exige site ou Instagram', () => {
    expect(validarEtapa(1, { ...etapa1, instagram: '' }).site).toBe(textosFormulario.siteOuInstagram)
  })
  it('anexo de 25 MB é recusado', () => {
    expect(validarEtapa(4, etapa1, [{ tamanho: 25 * 1024 * 1024 }]).arquivos).toBe(textosFormulario.arquivoGrande)
  })
  it('sem consentimento não envia', () => {
    const erros = validarEtapa(5, { ...etapa1, aceite_nao_proposta: true })
    expect(erros.consentimento).toBe(textosFormulario.consentimento)
  })
})
