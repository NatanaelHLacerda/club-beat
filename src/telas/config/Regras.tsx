import { useState } from 'react'
import { Topo } from '../../componentes/Casca'
import { listarCardapio, listarCategorias, listarModelos, salvarCategoria, salvarItemCardapio, salvarModelo } from '../../dados/api'
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
      <Cardapio />
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

const nomesPadrao = { bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro', master: 'Master' } as const

function Cardapio() {
  const { perfil } = useSessao()
  const cardapio = useConsulta(listarCardapio)
  const [erro, setErro] = useState('')
  const podeEditar = pode(perfil, 'configurar')
  async function salvar(padrao: string, item: string, descricao: string, maximo: string) {
    setErro('')
    try { await salvarItemCardapio(padrao, item, descricao, maximo.trim() === '' ? null : Number(maximo)); await cardapio.recarregar() } catch (e) { setErro((e as Error).message) }
  }
  return (
    <section className="pilha">
      <h2>Cardápio por padrão (cap. 8)</h2>
      <p className="muted">É o limite de autonomia da Gerente: o que está aqui ela fecha sem consultar ninguém (Bronze e Prata). Quantidades dos contratos atuais; a Direção confirma. {podeEditar ? '' : 'Só a Direção edita.'}</p>
      {erro && <div className="aviso perigo">{erro}</div>}
      <div className="tabela-rolagem">
        <table>
          <thead><tr><th>Padrão</th><th>Contrapartida</th><th>Descrição</th><th>Máximo</th></tr></thead>
          <tbody>
            {(cardapio.dado ?? []).sort((a, b) => ['bronze', 'prata', 'ouro', 'master'].indexOf(a.padrao) - ['bronze', 'prata', 'ouro', 'master'].indexOf(b.padrao) || a.ordem - b.ordem).map((c) => (
              <tr key={`${c.padrao}-${c.item}`}>
                <td><span className={`padrao ${c.padrao}`}>{nomesPadrao[c.padrao]}</span></td>
                <td>{c.rotulo}</td>
                <td>{podeEditar ? <input className="entrada" defaultValue={c.descricao} onBlur={(e) => { if (e.target.value !== c.descricao) void salvar(c.padrao, c.item, e.target.value, c.maximo === null ? '' : String(c.maximo)) }} /> : c.descricao}</td>
                <td className="num">{podeEditar ? <input className="entrada num" style={{ width: 80 }} type="number" min={0} defaultValue={c.maximo ?? ''} onBlur={(e) => { if (e.target.value !== String(c.maximo ?? '')) void salvar(c.padrao, c.item, c.descricao, e.target.value) }} /> : c.maximo ?? 'a combinar'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
