import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { listarRenovacoes, listarUsuarios } from '../../dados/api'
import { formatarData, hojeISO } from '../../regras/formato'
import { diasParaOFim, rotuloCaminho, textosRenovacao } from '../../regras/renovacao'
import { useConsulta } from '../../lib/useConsulta'

export function Renovacoes() {
  const navegar = useNavigate()
  const hoje = hojeISO()
  const lista = useConsulta(listarRenovacoes)
  const usuarios = useConsulta(listarUsuarios)
  const itens = lista.dado ?? []
  return (
    <>
      <Topo eyebrow="Parcerias" titulo="Renovações"><span className="muted num">{itens.length} nos próximos 90 dias</span></Topo>
      <p className="muted">Aviso aos 90 dias, lembretes aos 60 e 30. Toda renovação é um novo acordo por escrito. {textosRenovacao.direcao}</p>
      {lista.erro && <div className="aviso perigo">{lista.erro}</div>}
      {lista.carregando && !lista.dado ? <p className="muted">Carregando…</p> : itens.length === 0 ? <div className="vazio">Nenhum contrato termina nos próximos 90 dias.</div> : (
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Marca</th><th>Padrão</th><th>Fim</th><th>Faltam</th><th>Decisão</th><th>Responsável</th></tr></thead>
            <tbody>
              {itens.map((p) => {
                const d = diasParaOFim(p.fim, hoje)
                const r = p.renovacao ?? {}
                return (
                  <tr key={p.id} className="clicavel" onClick={() => navegar(`/empresas/${p.empresa_id}`)}>
                    <td>{p.empresas.marca} <Exemplo mostrar={p.empresas.exemplo} /></td>
                    <td><PadraoTag padrao={p.padrao} /></td>
                    <td className="num">{formatarData(p.fim)}</td>
                    <td className={`num ${d <= 30 ? 'erro' : ''}`}>{d} dias</td>
                    <td>{r.decidida_em ? <span className="pill ok">{rotuloCaminho[r.caminho!]}</span> : r.aguardando_direcao ? <span className="pill ouro">Com a Direção</span> : <span className="pill alerta">Sem decisão</span>}</td>
                    <td className="muted">{nomeDe(usuarios.dado, p.responsavel_id)}</td>
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
