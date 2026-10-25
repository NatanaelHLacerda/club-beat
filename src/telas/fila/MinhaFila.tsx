import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { EtapaTag, Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { listarMinhaFila } from '../../dados/api'
import { formatarData } from '../../regras/formato'
import { ordemFila } from '../../regras/passagem'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

export function MinhaFila() {
  const { perfil } = useSessao()
  const navegar = useNavigate()
  const fila = useConsulta(() => listarMinhaFila(perfil?.id ?? ''), [perfil?.id])
  const lista = [...(fila.dado ?? [])].sort((a, b) =>
    ordemFila(a.padrao_final, a.candidata_master) - ordemFila(b.padrao_final, b.candidata_master) ||
    (a.passada_em ?? '').localeCompare(b.passada_em ?? ''))

  return (
    <>
      <Topo eyebrow="Gerente de Negócios" titulo="Minha fila"><span className="muted num">{lista.length} empresas</span></Topo>
      <p className="muted">Ouro e candidatas a Master primeiro, depois Prata e Bronze. Dentro de cada padrão, por ordem de passagem.</p>
      {fila.erro && <div className="aviso perigo">{fila.erro}</div>}
      {fila.carregando && !fila.dado ? <p className="muted">Carregando…</p> : lista.length === 0 ? (
        <div className="vazio">Nenhuma empresa com você agora.</div>
      ) : (
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Padrão</th><th>Marca</th><th>Etapa</th><th>Passada em</th><th>Papel</th></tr></thead>
            <tbody>
              {lista.map((e) => (
                <tr key={e.id} className="clicavel" onClick={() => navegar(`/empresas/${e.id}`)}>
                  <td><PadraoTag padrao={e.padrao_final} />{e.candidata_master && <span className="pill ouro" style={{ marginLeft: 6 }}>Master?</span>}</td>
                  <td>{e.marca} <Exemplo mostrar={e.exemplo} /></td>
                  <td><EtapaTag etapa={e.etapa} /></td>
                  <td className="num muted">{formatarData(e.passada_em)}</td>
                  <td className="muted">{e.responsavel_id === perfil?.id ? 'Responsável final' : e.gerente1_id === perfil?.id ? 'Conduz' : 'Finaliza'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
