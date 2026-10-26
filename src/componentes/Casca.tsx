import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { pode, type Acao } from '../lib/permissoes'
import { useSessao } from '../sessao'
import { BuscaGlobal } from './casca/BuscaGlobal'
import { MenuUsuario } from './casca/MenuUsuario'
import { Sino } from './casca/Sino'
import { Icone, type NomeIcone } from './ui'

type Item = { para: string; rotulo: string; icone: NomeIcone; acao?: Acao; subitens?: { para: string; rotulo: string }[] }

const grupos: { titulo: string; itens: Item[] }[] = [
  { titulo: 'Funil', itens: [
    { para: '/inicio', rotulo: 'Início', icone: 'inicio' },
    { para: '/funil', rotulo: 'Funil', icone: 'funil' },
    { para: '/empresas', rotulo: 'Empresas', icone: 'empresas', subitens: [
      { para: '/empresas', rotulo: 'Geral' },
      { para: '/empresas/recusadas', rotulo: 'Recusadas' },
    ] },
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

// O título de cada tela é desenhado na barra superior (portal).
const SlotTitulo = createContext<HTMLElement | null>(null)

export function Casca() {
  const { carregando, perfil } = useSessao()
  const local = useLocation()
  const [gaveta, setGaveta] = useState(false)
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  useEffect(() => { setGaveta(false) }, [local.pathname])

  if (carregando) return <div className="tela-solta muted">Carregando…</div>
  if (!perfil) return <Navigate to="/entrar" replace state={{ de: local.pathname }} />

  return (
    <div className="casca">
      {gaveta && <div className="fundo-gaveta" onClick={() => setGaveta(false)} aria-hidden="true" />}
      <nav className={`lateral${gaveta ? ' aberta' : ''}`} aria-label="Menu principal">
        <div className="marca-lateral">
          <img className="logo" src="/marca/logo-branco.png" width="1481" height="619" alt="The Beat Life Club" />
          <span className="marca-rotulo">Parcerias</span>
        </div>
        {grupos.map((g) => {
          const itens = g.itens.filter((i) => !i.acao || pode(perfil, i.acao))
          if (!itens.length) return null
          return (
            <div className="grupo" key={g.titulo}>
              <small>{g.titulo}</small>
              {itens.map((i) => i.subitens ? (
                <div className="com-subitens" key={i.para}>
                  <NavLink to={i.para} end className={() => (local.pathname.startsWith(i.para) ? 'pai-ativo' : '')}>
                    <Icone nome={i.icone} />
                    <span className="rotulo-item">{i.rotulo}</span>
                  </NavLink>
                  <div className="subitens">
                    {i.subitens.map((s) => (
                      <NavLink key={s.para} to={s.para} end className={({ isActive }) => (isActive ? 'ativo' : '')}>{s.rotulo}</NavLink>
                    ))}
                  </div>
                </div>
              ) : (
                <NavLink key={i.para} to={i.para} className={({ isActive }) => (isActive ? 'ativo' : '')}>
                  <Icone nome={i.icone} />
                  <span className="rotulo-item">{i.rotulo}</span>
                </NavLink>
              ))}
            </div>
          )
        })}
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

// REQ-027 — `secao` abre a barra de ações à esquerda (nome da seção com contagem); ações à direita, numa linha.
export function Topo({ eyebrow, titulo, secao, children }: { eyebrow?: string; titulo: string; secao?: ReactNode; children?: ReactNode }) {
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
      {(children || secao) && (
        <div className={`faixa-acoes${secao ? ' com-secao' : ''}`}>
          {secao && <h2 className="secao-titulo">{secao}</h2>}
          {children && <div className="faixa-acoes-itens">{children}</div>}
        </div>
      )}
    </>
  )
}

export function SemAcesso() {
  return <div className="aviso perigo">Você não tem acesso a esta área.</div>
}
