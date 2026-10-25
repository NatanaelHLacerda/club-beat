import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { contarAvisosNaoLidos, sair } from '../dados/api'
import { rotuloPapel } from '../dados/tipos'
import { pode, type Acao } from '../lib/permissoes'
import { useSessao } from '../sessao'

type Item = { para: string; rotulo: string; acao?: Acao }

const grupos: { titulo: string; itens: Item[] }[] = [
  { titulo: 'Funil', itens: [
    { para: '/funil', rotulo: 'Funil' },
    { para: '/empresas', rotulo: 'Empresas' },
    { para: '/fila', rotulo: 'Minha fila', acao: 'conduzir' },
    { para: '/direcao', rotulo: 'Direção' },
  ] },
  { titulo: 'Parcerias', itens: [
    { para: '/parcerias', rotulo: 'Parcerias ativas' },
    { para: '/calendario', rotulo: 'Calendário' },
    { para: '/operacoes', rotulo: 'Operações', acao: 'ver_operacoes' },
    { para: '/juridico', rotulo: 'Jurídico', acao: 'ver_juridico' },
    { para: '/renovacoes', rotulo: 'Renovações' },
  ] },
  { titulo: 'Acompanhamento', itens: [
    { para: '/painel', rotulo: 'Painel' },
    { para: '/prazos', rotulo: 'Prazos' },
    { para: '/avisos', rotulo: 'Avisos' },
  ] },
  { titulo: 'Configuração', itens: [
    { para: '/config/usuarios', rotulo: 'Usuários', acao: 'gerir_usuarios' },
    { para: '/config/regras', rotulo: 'Regras e modelos' },
  ] },
]

export function Casca() {
  const { carregando, perfil } = useSessao()
  const local = useLocation()
  const [aberta, setAberta] = useState(false)
  const naoLidos = useNaoLidos(Boolean(perfil))

  if (carregando) return <div className="tela-solta muted">Carregando…</div>
  if (!perfil) return <Navigate to="/entrar" replace state={{ de: local.pathname }} />

  return (
    <div className="casca">
      <div className="menu-movel">
        <span className="marca"><b>Club Beat</b><span>Parcerias</span></span>
        <button className="botao leve" onClick={() => setAberta(!aberta)} aria-expanded={aberta}>Menu</button>
      </div>
      <nav className={`lateral${aberta ? ' aberta' : ''}`} onClick={() => setAberta(false)}>
        <div className="marca"><b>Club Beat</b><span>Parcerias</span></div>
        {grupos.map((g) => {
          const itens = g.itens.filter((i) => !i.acao || pode(perfil, i.acao))
          if (!itens.length) return null
          return (
            <div className="grupo" key={g.titulo}>
              <small>{g.titulo}</small>
              {itens.map((i) => (
                <NavLink key={i.para} to={i.para} className={({ isActive }) => (isActive ? 'ativo' : '')}>
                  {i.rotulo}
                  {i.para === '/avisos' && naoLidos > 0 && <span className="contador num">{naoLidos}</span>}
                </NavLink>
              ))}
            </div>
          )
        })}
        <div className="quem">
          <b>{perfil.nome}</b>
          <span className="muted pequeno">{rotuloPapel[perfil.papel]}{perfil.admin ? ' · administradora' : ''}</span>
          <button className="botao leve" onClick={() => void sair()}>Sair</button>
        </div>
      </nav>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  )
}

export function Topo({ eyebrow, titulo, children }: { eyebrow?: string; titulo: string; children?: ReactNode }) {
  return (
    <header className="topo">
      <div className="pilha" style={{ gap: 4 }}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{titulo}</h1>
      </div>
      {children && <div className="linha">{children}</div>}
    </header>
  )
}

export function SemAcesso() {
  return <div className="aviso perigo">Você não tem acesso a esta área.</div>
}

function useNaoLidos(ativo: boolean) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!ativo) return
    let vivo = true
    const contar = () => { contarAvisosNaoLidos().then((c) => { if (vivo) setN(c) }, () => {}) }
    contar()
    const relogio = window.setInterval(contar, 60_000)
    window.addEventListener('avisos-mudaram', contar)
    return () => { vivo = false; window.clearInterval(relogio); window.removeEventListener('avisos-mudaram', contar) }
  }, [ativo])
  return n
}
