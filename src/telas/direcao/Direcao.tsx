import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { listarParaDirecao, listarUsuarios } from '../../dados/api'
import { prazoVencido } from '../../regras/direcao'
import { formatarData, hojeISO } from '../../regras/formato'
import { useConsulta } from '../../lib/useConsulta'

export function Direcao() {
  const navegar = useNavigate()
  const casos = useConsulta(listarParaDirecao)
  const usuarios = useConsulta(listarUsuarios)
  const lista = casos.dado ?? []
  const hoje = hojeISO()
  return (
    <>
      <Topo eyebrow="Decisões" titulo="Direção"><span className="muted num">{lista.length} aguardando</span></Topo>
      <p className="muted">Ouro, Master e o que foge do estabelecido. Resposta em até 3 dias úteis. Bronze e Prata dentro do cardápio não passam por aqui.</p>
      {casos.erro && <div className="aviso perigo">{casos.erro}</div>}
      {casos.carregando && !casos.dado ? <p className="muted">Carregando…</p> : lista.length === 0 ? <div className="vazio">Nenhum caso aguardando a Direção.</div> : (
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Empresa</th><th>Padrão</th><th>Motivos</th><th>Levada por</th><th>Prazo</th></tr></thead>
            <tbody>
              {lista.map((e) => {
                const vencido = prazoVencido(e.direcao?.prazo, hoje)
                return (
                  <tr key={e.id} className="clicavel" onClick={() => navegar(`/empresas/${e.id}`)}>
                    <td>{e.marca} <Exemplo mostrar={e.exemplo} /></td>
                    <td><PadraoTag padrao={e.padrao_final} />{e.candidata_master && <span className="pill ouro" style={{ marginLeft: 6 }}>Master?</span>}</td>
                    <td className="pequeno">{(e.direcao?.motivos ?? []).join(', ')}</td>
                    <td className="muted">{nomeDe(usuarios.dado, e.direcao?.levada_por ?? null)}</td>
                    <td className={`num ${vencido ? 'erro' : ''}`}>{formatarData(e.direcao?.prazo)}{vencido ? ' · vencido' : ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
