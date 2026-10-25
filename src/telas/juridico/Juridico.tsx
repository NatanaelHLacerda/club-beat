import { useNavigate } from 'react-router-dom'
import { SemAcesso, Topo } from '../../componentes/Casca'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { listarParaJuridico } from '../../dados/api'
import { formatarData, hojeISO } from '../../regras/formato'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

function situacao(c: { enviado_juridico_em?: string; pronto_em?: string | null; divergencia?: string | null }) {
  if (c.pronto_em) return <span className="pill ok">Pronto para assinar</span>
  if (c.divergencia) return <span className="pill perigo">Divergência com a Gerente</span>
  if (c.enviado_juridico_em) return <span className="pill alerta">Minuta em preparo</span>
  return <span className="pill">Aguardando pacote</span>
}

export function Juridico() {
  const { perfil } = useSessao()
  const navegar = useNavigate()
  const lista = useConsulta(listarParaJuridico)
  if (!pode(perfil, 'ver_juridico')) return (<><Topo titulo="Jurídico" /><SemAcesso /></>)
  const hoje = hojeISO()
  const casos = lista.dado ?? []
  return (
    <>
      <Topo eyebrow="Contratos" titulo="Jurídico"><span className="muted num">{casos.length} em andamento</span></Topo>
      <p className="muted">Minuta em até 5 dias úteis depois do pacote. A minuta tem exatamente o que foi aceito na proposta.</p>
      {lista.erro && <div className="aviso perigo">{lista.erro}</div>}
      {casos.length === 0 ? <div className="vazio">Nenhum contrato em andamento.</div> : (
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Empresa</th><th>Padrão</th><th>Situação</th><th>Prazo da minuta</th></tr></thead>
            <tbody>
              {casos.map((e) => {
                const vencido = !e.contrato?.pronto_em && e.contrato?.prazo_juridico && hoje > e.contrato.prazo_juridico
                return (
                  <tr key={e.id} className="clicavel" onClick={() => navegar(`/empresas/${e.id}`)}>
                    <td>{e.marca} <Exemplo mostrar={e.exemplo} /></td>
                    <td><PadraoTag padrao={e.padrao_final} /></td>
                    <td>{situacao(e.contrato ?? {})}</td>
                    <td className={`num ${vencido ? 'erro' : ''}`}>{formatarData(e.contrato?.prazo_juridico)}{vencido ? ' · vencido' : ''}</td>
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
