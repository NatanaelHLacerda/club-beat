import { useState } from 'react'
import { Topo } from '../../componentes/Casca'
import { listarModelos, salvarModelo } from '../../dados/api'
import type { ModeloMensagem } from '../../dados/tipos'
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
