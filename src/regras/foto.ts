// REQ-040 — foto de perfil: tipos e tamanho aceitos e o quadrado do centro que vira 256 × 256.
export const tiposFoto = ['image/jpeg', 'image/png', 'image/webp']
export const limiteFoto = 5 * 1024 * 1024
export const ladoFoto = 256

export function erroArquivoFoto(arquivo: { type: string; size: number }): string | null {
  if (!tiposFoto.includes(arquivo.type)) return 'Use uma imagem JPG, PNG ou WebP.'
  if (arquivo.size > limiteFoto) return 'A foto pode ter até 5 MB.'
  return null
}

export function recorteQuadrado(largura: number, altura: number): { x: number; y: number; lado: number } {
  const lado = Math.min(largura, altura)
  return { x: Math.round((largura - lado) / 2), y: Math.round((altura - lado) / 2), lado }
}
