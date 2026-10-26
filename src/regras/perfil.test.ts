import { describe, expect, it } from 'vitest'
import { erroNome, erroNovaSenha, normalizarNome } from './perfil'

describe('meu perfil', () => {
  it('normaliza espaços do nome', () => {
    expect(normalizarNome('  Fernanda   Souza ')).toBe('Fernanda Souza')
  })
  it('nome precisa ter de 2 a 80 caracteres', () => {
    expect(erroNome('')).not.toBeNull()
    expect(erroNome('   ')).not.toBeNull()
    expect(erroNome('F')).not.toBeNull()
    expect(erroNome('Fe')).toBeNull()
    expect(erroNome('a'.repeat(80))).toBeNull()
    expect(erroNome('a'.repeat(81))).not.toBeNull()
  })
  it('nova senha com 8 ou mais caracteres e repetida igual', () => {
    expect(erroNovaSenha('1234567', '1234567')).toBe('A senha precisa ter pelo menos 8 caracteres.')
    expect(erroNovaSenha('12345678', '12345679')).toBe('As duas senhas não são iguais.')
    expect(erroNovaSenha('12345678', '12345678')).toBeNull()
  })
})
