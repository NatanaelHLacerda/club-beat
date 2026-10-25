import { Link } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { listarAvisos, marcarAvisoLido } from '../../dados/api'
import { formatarDataHora } from '../../regras/formato'
import { useConsulta } from '../../lib/useConsulta'

export function Avisos() {
  const avisos = useConsulta(listarAvisos)
  const lista = avisos.dado ?? []
  const naoLidos = lista.filter((a) => !a.lido_em).length

  async function ler(id: number) {
    await marcarAvisoLido(id)
    await avisos.recarregar()
    window.dispatchEvent(new Event('avisos-mudaram'))
  }

  return (
    <>
      <Topo eyebrow="Acompanhamento" titulo="Avisos"><span className="muted num">{naoLidos} não lidos</span></Topo>
      {avisos.erro && <div className="aviso perigo">{avisos.erro}</div>}
      {avisos.carregando && !avisos.dado ? <p className="muted">Carregando…</p> : lista.length === 0 ? (
        <div className="vazio">Nenhum aviso por enquanto.</div>
      ) : (
        <ol className="tempo">
          {lista.map((a) => (
            <li key={a.id} style={{ opacity: a.lido_em ? 0.6 : 1 }}>
              <time dateTime={a.em}>{formatarDataHora(a.em)}</time>
              <div className="linha entre">
                <span>{!a.lido_em && <span className="pill ouro">Novo</span>} {a.texto} {a.empresa_id && <Link to={`/empresas/${a.empresa_id}`}>Abrir empresa</Link>}</span>
                {!a.lido_em && <button className="botao leve" onClick={() => void ler(a.id)}>Marcar como lido</button>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  )
}
