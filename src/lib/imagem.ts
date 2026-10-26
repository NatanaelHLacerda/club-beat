// REQ-040 — recorta o quadrado do centro e reduz para 256 × 256 JPEG no navegador (canvas, sem dependência).
import { ladoFoto, recorteQuadrado } from '../regras/foto'

export async function fotoQuadrada(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo)
  const { x, y, lado } = recorteQuadrado(bitmap.width, bitmap.height)
  const tela = document.createElement('canvas')
  tela.width = ladoFoto
  tela.height = ladoFoto
  const ctx = tela.getContext('2d')
  if (!ctx) throw new Error('Não foi possível preparar a foto neste navegador.')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, x, y, lado, lado, 0, 0, ladoFoto, ladoFoto)
  bitmap.close()
  return new Promise((ok, falha) => tela.toBlob((b) => (b ? ok(b) : falha(new Error('Não foi possível preparar a foto.'))), 'image/jpeg', 0.86))
}
