import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { pode, type Acao } from '../lib/permissoes'
import { useSessao } from '../sessao'
import { BuscaGlobal } from './casca/BuscaGlobal'
import { MenuUsuario } from './casca/MenuUsuario'
import { Sino } from './casca/Sino'
import { Icone, type NomeIcone } from './ui'

type Item = { para: string; rotulo: string; icone: NomeIcone; acao?: Acao }

const grupos: { titulo: string; itens: Item[] }[] = [
  { titulo: 'Funil', itens: [
    { para: '/inicio', rotulo: 'Início', icone: 'inicio' },
    { para: '/funil', rotulo: 'Funil', icone: 'funil' },
    { para: '/empresas', rotulo: 'Empresas', icone: 'empresas' },
    { para: '/fila', rotulo: 'Minha fila', icone: 'fila', acao: 'conduzir' },
    { para: '/direcao', rotulo: 'Direção', icone: 'direcao' },
  ] },
  { titulo: 'Parcerias', itens: [
    { para: '/parcerias', rotulo: 'Parcerias ativas', icone: 'parcerias' },
    { para: '/calendario', rotulo: 'Calendário', icone: 'calendario' },
    { para: '/operacoes', rotulo: 'Operações', icone: 'operacoes', acao: 'ver_operacoes' },
    { para: '/juridico', rotulo: 'Jurídico', icone: 'juridico', acao: 'ver_juridico' },
    { para: '/renovacoes', rotulo: 'Renovações', icone: 'renovacoes' },
  ] },
  { titulo: 'Acompanhamento', itens: [
    { para: '/painel', rotulo: 'Painel', icone: 'painel' },
    { para: '/prazos', rotulo: 'Prazos', icone: 'prazos' },
    { para: '/avisos', rotulo: 'Avisos', icone: 'avisos' },
  ] },
  { titulo: 'Configuração', itens: [
    { para: '/config/usuarios', rotulo: 'Usuários', icone: 'usuarios', acao: 'gerir_usuarios' },
    { para: '/config/regras', rotulo: 'Regras e modelos', icone: 'regras' },
    { para: '/config/importar', rotulo: 'Importar parceiros', icone: 'importar', acao: 'editar_empresa' },
    { para: '/config/componentes', rotulo: 'Componentes', icone: 'componentes', acao: 'ver_componentes' },
  ] },
]

const chaveRecolhida = 'crm.lateral.recolhida'
const lerRecolhida = () => { try { return localStorage.getItem(chaveRecolhida) === '1' } catch { return false } }

// O título de cada tela é desenhado na barra superior (portal).
const SlotTitulo = createContext<HTMLElement | null>(null)

export function Casca() {
  const { carregando, perfil } = useSessao()
  const local = useLocation()
  const [gaveta, setGaveta] = useState(false)
  const [recolhida, setRecolhida] = useState(lerRecolhida)
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  useEffect(() => { setGaveta(false) }, [local.pathname])

  if (carregando) return <div className="tela-solta muted">Carregando…</div>
  if (!perfil) return <Navigate to="/entrar" replace state={{ de: local.pathname }} />

  function alternar() {
    const novo = !recolhida
    setRecolhida(novo)
    try { localStorage.setItem(chaveRecolhida, novo ? '1' : '0') } catch { /* sem armazenamento: vale só nesta visita */ }
  }

  return (
    <div className={`casca${recolhida ? ' recolhida' : ''}`}>
      {gaveta && <div className="fundo-gaveta" onClick={() => setGaveta(false)} aria-hidden="true" />}
      <nav className={`lateral${gaveta ? ' aberta' : ''}`} aria-label="Menu principal">
        <div className="marca-lateral">
          <span className="selo" aria-hidden="true">CB</span>
          <span className="marca"><b>Club Beat</b><span>Parcerias</span></span>
        </div>
        {grupos.map((g) => {
          const itens = g.itens.filter((i) => !i.acao || pode(perfil, i.acao))
          if (!itens.length) return null
          return (
            <div className="grupo" key={g.titulo}>
              <small>{g.titulo}</small>
              {itens.map((i) => (
                <NavLink key={i.para} to={i.para} title={recolhida ? i.rotulo : undefined} className={({ isActive }) => (isActive ? 'ativo' : '')}>
                  <Icone nome={i.icone} />
                  <span className="rotulo-item">{i.rotulo}</span>
                </NavLink>
              ))}
            </div>
          )
        })}
        <button className="recolher" onClick={alternar} aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'} title={recolhida ? 'Expandir menu' : 'Recolher menu'}>
          <Icone nome={recolhida ? 'expandir' : 'recolher'} /><span className="rotulo-item">Recolher menu</span>
        </button>
      </nav>
      <div className="area">
        <header className="barra-superior">
          <button className="botao-icone grande abrir-gaveta" aria-label="Abrir menu" onClick={() => setGaveta(true)}><Icone nome="menu" tamanho={20} /></button>
          <div className="titulo-slot" ref={setSlot} />
          <BuscaGlobal />
          <Sino />
          <MenuUsuario perfil={perfil} />
        </header>
        <main className="conteudo">
          <SlotTitulo.Provider value={slot}>
            <Outlet />
          </SlotTitulo.Provider>
        </main>
      </div>
    </div>
  )
}

export function Topo({ eyebrow, titulo, children }: { eyebrow?: string; titulo: string; children?: ReactNode }) {
  const slot = useContext(SlotTitulo)
  const cabeca = (
    <div className="topo-titulo">
      <h1>{titulo}</h1>
      {eyebrow && <span className="contexto">{eyebrow}</span>}
    </div>
  )
  return (
    <>
      {slot ? createPortal(cabeca, slot) : cabeca}
      {children && <div className="faixa-acoes">{children}</div>}
    </>
  )
}

export function SemAcesso() {
  return <div className="aviso perigo">Você não tem acesso a esta área.</div>
}
