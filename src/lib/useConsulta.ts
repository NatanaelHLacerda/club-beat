import { useCallback, useEffect, useRef, useState } from 'react'

export type Consulta<T> = { dado: T | null; erro: string; carregando: boolean; recarregar: () => Promise<void> }

// Carrega um dado da api.ts e expõe os estados carregando / erro / dado. `chave` muda → recarrega.
export function useConsulta<T>(buscar: () => Promise<T>, chave: unknown[] = []): Consulta<T> {
  const [dado, setDado] = useState<T | null>(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const buscarRef = useRef(buscar)
  buscarRef.current = buscar

  const recarregar = useCallback(async () => {
    setCarregando(true)
    try {
      setDado(await buscarRef.current())
      setErro('')
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    let vivo = true
    buscarRef.current().then(
      (d) => { if (vivo) { setDado(d); setErro(''); setCarregando(false) } },
      (e: Error) => { if (vivo) { setErro(e.message); setCarregando(false) } },
    )
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, chave)

  return { dado, erro, carregando, recarregar }
}
