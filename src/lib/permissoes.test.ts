import { describe, expect, it } from 'vitest'
import type { Papel } from '../dados/tipos'
import { pode } from './permissoes'

const perfil = (papel: Papel, admin = false) => ({ papel, admin, ativo: true })

describe('permissões (REQ-001)', () => {
  it('Gerente não decide pela Direção', () => {
    expect(pode(perfil('gerente'), 'decidir_direcao')).toBe(false)
  })
  it('Direção decide', () => {
    expect(pode(perfil('direcao'), 'decidir_direcao')).toBe(true)
  })
  it('1ª pessoa faz triagem e Gerente também cobre', () => {
    expect(pode(perfil('primeira_pessoa'), 'triar')).toBe(true)
    expect(pode(perfil('gerente'), 'triar')).toBe(true)
  })
  it('só Gerente conduz reunião e proposta', () => {
    expect(pode(perfil('primeira_pessoa'), 'conduzir')).toBe(false)
    expect(pode(perfil('gerente'), 'conduzir')).toBe(true)
  })
  it('gerir usuários depende de ser administrador, não do papel', () => {
    expect(pode(perfil('gerente', true), 'gerir_usuarios')).toBe(true)
    expect(pode(perfil('direcao'), 'gerir_usuarios')).toBe(false)
  })
  it('Manutenção é da Direção ou do administrador', () => {
    expect(pode(perfil('direcao'), 'manter_sistema')).toBe(true)
    expect(pode(perfil('gerente', true), 'manter_sistema')).toBe(true)
    expect(pode(perfil('gerente'), 'manter_sistema')).toBe(false)
    expect(pode(perfil('juridico'), 'manter_sistema')).toBe(false)
  })
  it('só Jurídico e Direção mexem nos documentos jurídicos; Gerente só lê', () => {
    expect(pode(perfil('juridico'), 'gerir_documentos_juridicos')).toBe(true)
    expect(pode(perfil('direcao'), 'gerir_documentos_juridicos')).toBe(true)
    expect(pode(perfil('gerente'), 'gerir_documentos_juridicos')).toBe(false)
    expect(pode(perfil('gerente'), 'ver_juridico')).toBe(true)
    expect(pode(perfil('financeiro'), 'ver_juridico')).toBe(false)
  })
  it('usuário inativo ou ausente não pode nada', () => {
    expect(pode({ papel: 'direcao', admin: true, ativo: false }, 'ver_crm')).toBe(false)
    expect(pode(null, 'ver_crm')).toBe(false)
  })
})
