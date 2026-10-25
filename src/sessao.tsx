import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { aoMudarSessao, perfilAtual } from './dados/api'
import type { Perfil } from './dados/tipos'

type Sessao = { carregando: boolean; perfil: Perfil | null; recarregar: () => Promise<void> }

const Contexto = createContext<Sessao>({ carregando: true, perfil: null, recarregar: async () => {} })

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true)
  const [perfil, setPerfil] = useState<Perfil | null>(null)

  const recarregar = useCallback(async () => {
    try {
      setPerfil(await perfilAtual())
    } catch {
      setPerfil(null)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    void recarregar()
    return aoMudarSessao(() => void recarregar())
  }, [recarregar])

  return <Contexto.Provider value={{ carregando, perfil, recarregar }}>{children}</Contexto.Provider>
}

export function useSessao() {
  return useContext(Contexto)
}
