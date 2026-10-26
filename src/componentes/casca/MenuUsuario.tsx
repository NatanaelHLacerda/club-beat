import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { alterarDisponibilidade, sair } from '../../dados/api'
import { rotuloPapel, type Perfil } from '../../dados/tipos'
import { pode, type Acao } from '../../lib/permissoes'
import { useSessao } from '../../sessao'
import { Avatar, Icone, type NomeIcone } from '../ui'

// REQ-037 — configurações do CRM ficam no menu da pessoa, cada uma só para quem pode abrir.
const configuracao: { para: string; rotulo: string; icone: NomeIcone; acao?: Acao }[] = [
  { para: '/config/usuarios', rotulo: 'Usuários', icone: 'usuarios', acao: 'gerir_usuarios' },
  { para: '/config/regras', rotulo: 'Regras e modelos', icone: 'regras' },
  { para: '/config/importar', rotulo: 'Importar parceiros', icone: 'importar', acao: 'editar_empresa' },
  { para: '/config/componentes', rotulo: 'Componentes', icone: 'componentes', acao: 'ver_componentes' },
]

// REQ-019/037/039 — avatar abre o menu da pessoa: Meu perfil, disponibilidade (Gerente), configuração e sair.
export function MenuUsuario({ perfil }: { perfil: Perfil }) {
  const { recarregar } = useSessao()
  const [aberto, setAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const caixa = useRef<HTMLDivElement>(null)
  const botao = useRef<HTMLButtonElement>(null)
  const lista = useRef<HTMLDivElement>(null)
  const pelaTecla = useRef(false)
  const itens = () => [...(lista.current?.querySelectorAll<HTMLElement>('[data-item]') ?? [])]

  useEffect(() => {
    const fora = (e: MouseEvent) => { if (!caixa.current?.contains(e.target as Node)) setAberto(false) }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [])

  useEffect(() => {
    if (aberto && pelaTecla.current) itens()[0]?.focus()
  }, [aberto])

  const fechar = (devolverFoco = false) => { setAberto(false); setErro(''); if (devolverFoco) botao.current?.focus() }

  function teclas(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); fechar(true); return }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const todos = itens()
    const i = todos.indexOf(document.activeElement as HTMLElement)
    const proximo = e.key === 'ArrowDown' ? (i + 1) % todos.length : (i - 1 + todos.length) % todos.length
    todos[proximo]?.focus()
  }

  async function trocarDisponibilidade() {
    setSalvando(true); setErro('')
    try { await alterarDisponibilidade(perfil.id, !perfil.disponivel); await recarregar() } catch (e) { setErro((e as Error).message) } finally { setSalvando(false) }
  }

  const nome = perfil.nome.replace(/\s*\(exemplo\)$/i, '')
  const permitidos = configuracao.filter((c) => !c.acao || pode(perfil, c.acao))

  return (
    <div className="menu-usuario" ref={caixa} onKeyDown={teclas}>
      <button ref={botao} className="usuario-botao" aria-expanded={aberto} aria-controls="menu-pessoa" aria-label={`Menu de ${nome}`}
        onKeyDown={(e) => { pelaTecla.current = e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' }}
        onMouseDown={() => { pelaTecla.current = false }}
        onClick={() => setAberto(!aberto)}>
        <Avatar nome={perfil.nome} tamanho={34} />
        <span className="pilha usuario-nome" style={{ gap: 0 }}><b>{nome}</b><span className="muted pequeno">{rotuloPapel[perfil.papel]}</span></span>
      </button>
      {aberto && (
        <div className="flutuante usuario-lista" id="menu-pessoa" ref={lista}>
          <div className="menu-pessoa-cabeca">
            <Avatar nome={perfil.nome} tamanho={40} />
            <span className="pilha" style={{ gap: 2, minWidth: 0 }}>
              <b>{nome}</b>
              <span className="muted pequeno menu-pessoa-email">{perfil.email}</span>
              <span className="muted pequeno">{rotuloPapel[perfil.papel]}{perfil.admin ? ' · administradora' : ''}</span>
            </span>
          </div>

          <div className="menu-pessoa-secao">
            <Link data-item className="resultado" to="/perfil" onClick={() => fechar()}><Icone nome="usuarios" />Meu perfil</Link>
          </div>

          {perfil.papel === 'gerente' && (
            <div className="menu-pessoa-secao">
              <button type="button" data-item role="switch" aria-checked={perfil.disponivel} className="menu-pessoa-interruptor" disabled={salvando} onClick={() => void trocarDisponibilidade()}>
                <span className="pilha" style={{ gap: 2 }}>
                  <span>Disponível para novas empresas</span>
                  <span className="muted pequeno">{perfil.disponivel ? 'Você entra no revezamento.' : 'Fora do revezamento.'}</span>
                </span>
                <span className="trilho-interruptor" aria-hidden="true"><span /></span>
              </button>
              {erro && <p className="erro pequeno" role="alert">{erro}</p>}
            </div>
          )}


          {permitidos.length > 0 && (
            <div className="menu-pessoa-secao">
              <span className="eyebrow">Configuração</span>
              {permitidos.map((c) => (
                <Link key={c.para} data-item className="resultado" to={c.para} onClick={() => fechar()}><Icone nome={c.icone} />{c.rotulo}</Link>
              ))}
            </div>
          )}

          <div className="menu-pessoa-secao">
            <button type="button" data-item className="resultado" onClick={() => void sair()}><Icone nome="sair" />Sair</button>
          </div>
        </div>
      )}
    </div>
  )
}
