import { useEffect, useRef, useState } from 'react'
import { sair } from '../../dados/api'
import { rotuloPapel, type Perfil } from '../../dados/tipos'
import { Avatar, Icone } from '../ui'

// REQ-019 — avatar, nome, papel e sair.
export function MenuUsuario({ perfil }: { perfil: Perfil }) {
  const [aberto, setAberto] = useState(false)
  const caixa = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fora = (e: MouseEvent) => { if (!caixa.current?.contains(e.target as Node)) setAberto(false) }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [])
  const nome = perfil.nome.replace(/\s*\(exemplo\)$/i, '')
  return (
    <div className="menu-usuario" ref={caixa}>
      <button className="usuario-botao" aria-expanded={aberto} aria-label={`Menu de ${nome}`} onClick={() => setAberto(!aberto)}>
        <Avatar nome={perfil.nome} tamanho={34} />
        <span className="pilha usuario-nome" style={{ gap: 0 }}><b>{nome}</b><span className="muted pequeno">{rotuloPapel[perfil.papel]}</span></span>
      </button>
      {aberto && (
        <div className="flutuante usuario-lista">
          <div style={{ padding: '12px 14px' }} className="pilha">
            <b style={{ color: 'var(--ink)' }}>{perfil.nome}</b>
            <span className="muted pequeno">{perfil.email}</span>
            <span className="muted pequeno">{rotuloPapel[perfil.papel]}{perfil.admin ? ' · administradora' : ''}</span>
          </div>
          <button className="resultado" onClick={() => void sair()}><Icone nome="sair" /> Sair</button>
        </div>
      )}
    </div>
  )
}
