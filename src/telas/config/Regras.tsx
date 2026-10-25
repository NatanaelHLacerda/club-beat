import { useState } from 'react'
import { Topo } from '../../componentes/Casca'
import { listarCategorias, listarModelos, salvarCategoria, salvarModelo } from '../../dados/api'
import type { Categoria, ModeloMensagem } from '../../dados/tipos'
import { formatarDataHora } from '../../regras/formato'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

// Regras e modelos: começa com as mensagens-modelo (REQ-015); os próximos REQs acrescentam seções.
export function Regras() {
  return (
    <>
      <Topo eyebrow="Configuração" titulo="Regras e modelos" />
      <Modelos />
      <Categorias />
    </>
  )
}

function Modelos() {
  const { perfil } = useSessao()
  const modelos = useConsulta(listarModelos)
  const podeEditar = pode(perfil, 'gerir_usuarios')
  return (
    <section className="pilha">
      <h2>Mensagens-modelo</h2>
      <p className="muted">Campos trocados automaticamente: [nome], [empresa], [Gerente], [data], [padrão]. {podeEditar ? '' : 'Só a administradora edita os modelos.'}</p>
      {modelos.erro && <div className="aviso perigo">{modelos.erro}</div>}
      {(modelos.dado ?? []).map((m) => <Modelo key={m.codigo} modelo={m} podeEditar={podeEditar} aoSalvar={modelos.recarregar} />)}
    </section>
  )
}

function Modelo({ modelo, podeEditar, aoSalvar }: { modelo: ModeloMensagem; podeEditar: boolean; aoSalvar: () => Promise<void> }) {
  const [titulo, setTitulo] = useState(modelo.titulo)
  const [texto, setTexto] = useState(modelo.texto)
  const [msg, setMsg] = useState('')
  const mudou = titulo !== modelo.titulo || texto !== modelo.texto

  async function salvar() {
    setMsg('')
    try { await salvarModelo(modelo.codigo, titulo.trim(), texto.trim()); setMsg('Modelo salvo.'); await aoSalvar() } catch (e) { setMsg((e as Error).message) }
  }

  return (
    <div className="cartao">
      <div className="linha entre">
        <div className="linha">
          <span className="pill ouro">{modelo.codigo === 'PEDIDO_INFO' ? 'Pedido de informação' : modelo.codigo}</span>
          {modelo.automatico && <span className="pill">Automática</span>}
          {modelo.interno && <span className="pill">Interna</span>}
        </div>
        <span className="muted pequeno">Atualizado em {formatarDataHora(modelo.atualizado_em)}</span>
      </div>
      {podeEditar ? (
        <>
          <label className="campo"><span>Título</span><input id={`modelo-titulo-${modelo.codigo}`} value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
          <label className="campo"><span>Texto</span><textarea id={`modelo-texto-${modelo.codigo}`} value={texto} onChange={(e) => setTexto(e.target.value)} /></label>
          <div className="linha">
            <button className="botao primario" disabled={!mudou || !titulo.trim() || !texto.trim()} onClick={() => void salvar()}>Salvar modelo</button>
            {msg && <span className="muted">{msg}</span>}
          </div>
        </>
      ) : (
        <>
          <h3>{modelo.titulo}</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{modelo.texto}</p>
        </>
      )}
    </div>
  )
}

const rotuloSituacaoCategoria: Record<Categoria['situacao'], string> = { aceita: 'Aceita', nao_aceita: 'Não aceita', sensivel: 'Só com Jurídico e Direção' }

function Categorias() {
  const { perfil } = useSessao()
  const categorias = useConsulta(listarCategorias)
  const [erro, setErro] = useState('')
  const podeEditar = pode(perfil, 'configurar')

  async function mudar(c: Categoria, situacao: Categoria['situacao']) {
    setErro('')
    try { await salvarCategoria(c.nome, situacao); await categorias.recarregar() } catch (e) { setErro((e as Error).message) }
  }

  return (
    <section className="pilha">
      <h2>Categorias (cap. 12)</h2>
      <p className="muted">A Isabela confere esta lista na Triagem 1. {podeEditar ? '' : 'Só a Direção muda a situação de uma categoria.'}</p>
      {(erro || categorias.erro) && <div className="aviso perigo">{erro || categorias.erro}</div>}
      <div className="tabela-rolagem">
        <table>
          <thead><tr><th>Categoria</th><th>Situação</th></tr></thead>
          <tbody>
            {(categorias.dado ?? []).map((c) => (
              <tr key={c.nome}>
                <td>{c.nome}</td>
                <td>
                  {podeEditar ? (
                    <select className="entrada" style={{ width: 'auto' }} aria-label={`Situação de ${c.nome}`} value={c.situacao} onChange={(e) => void mudar(c, e.target.value as Categoria['situacao'])}>
                      {(Object.keys(rotuloSituacaoCategoria) as Categoria['situacao'][]).map((s) => <option key={s} value={s}>{rotuloSituacaoCategoria[s]}</option>)}
                    </select>
                  ) : <span className={`pill ${c.situacao === 'nao_aceita' ? 'perigo' : c.situacao === 'sensivel' ? 'alerta' : 'ok'}`}>{rotuloSituacaoCategoria[c.situacao]}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
