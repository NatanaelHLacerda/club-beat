import { describe, expect, it } from 'vitest'
import { erroArquivoFoto, recorteQuadrado } from './foto'

const mb = 1024 * 1024

describe('foto de perfil', () => {
  it('aceita JPG, PNG e WebP de até 5 MB', () => {
    expect(erroArquivoFoto({ type: 'image/jpeg', size: 3 * mb })).toBeNull()
    expect(erroArquivoFoto({ type: 'image/png', size: 5 * mb })).toBeNull()
    expect(erroArquivoFoto({ type: 'image/webp', size: 1 })).toBeNull()
  })
  it('recusa outros tipos e arquivos grandes', () => {
    expect(erroArquivoFoto({ type: 'application/pdf', size: 1 })).toBe('Use uma imagem JPG, PNG ou WebP.')
    expect(erroArquivoFoto({ type: 'image/jpeg', size: 5 * mb + 1 })).toBe('A foto pode ter até 5 MB.')
  })
  it('recorta o quadrado do centro', () => {
    expect(recorteQuadrado(400, 300)).toEqual({ x: 50, y: 0, lado: 300 })
    expect(recorteQuadrado(300, 500)).toEqual({ x: 0, y: 100, lado: 300 })
    expect(recorteQuadrado(256, 256)).toEqual({ x: 0, y: 0, lado: 256 })
  })
})
