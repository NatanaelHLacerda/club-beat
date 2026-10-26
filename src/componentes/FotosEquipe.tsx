// REQ-040 — fotos da equipe carregadas uma vez na casca; o Avatar só lê daqui (não chama dados).
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { listarFotosDaEquipe } from '../dados/api'

type Fotos = { fotoDe: (pessoa?: string | null) => string | undefined; recarregarFotos: () => Promise<void> }
const Contexto = createContext<Fotos>({ fotoDe: () => undefined, recarregarFotos: async () => {} })

export function ProvedorFotos({ children }: { children: ReactNode }) {
  const [fotos, setFotos] = useState<Record<string, string>>({})
  const recarregarFotos = useCallback(async () => {
    try { setFotos(await listarFotosDaEquipe()) } catch { /* sem fotos: o Avatar mostra as iniciais */ }
  }, [])
  useEffect(() => {
    void recarregarFotos()
    // URLs assinadas valem 1 h: renova antes.
    const relogio = window.setInterval(() => void recarregarFotos(), 50 * 60 * 1000)
    return () => window.clearInterval(relogio)
  }, [recarregarFotos])
  const fotoDe = useCallback((pessoa?: string | null) => (pessoa ? fotos[pessoa] : undefined), [fotos])
  return <Contexto.Provider value={{ fotoDe, recarregarFotos }}>{children}</Contexto.Provider>
}

export function useFotos() {
  return useContext(Contexto)
}
