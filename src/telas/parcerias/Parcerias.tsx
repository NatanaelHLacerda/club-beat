import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { listarEntregas, listarParcerias, listarRelatorios, listarUsuarios } from '../../dados/api'
import { contratadoFeito, proximoBalanco, proximoRelatorio, textosAcompanhamento } from '../../regras/acompanhamento'
import { formatarData, hojeISO } from '../../regras/formato'
import { useConsulta } from '../../lib/useConsulta'

const curto: Record<string, string> = {
  telas: 'Telas', marca_site: 'Site', ativacao_1d: 'Ativações', ativacao_3d: 'Ativações 3 dias', ativacao_4d: 'Ativações 4 dias',
  redes: 'Redes', eventos: 'Eventos', beneficio_colaboradores: 'Benefício', exclusividade: 'Exclusividade', marca_recepcao: 'Recepção', relatorio: 'Relatório',
}

export function Parcerias() {
  const navegar = useNavigate()
  const hoje = hojeISO()
  const parcerias = useConsulta(() => listarParcerias('vigente'))
  const entregas = useConsulta(() => listarEntregas())
  const relatorios = useConsulta(() => listarRelatorios())
  const usuarios = useConsulta(listarUsuarios)
  const lista = parcerias.dado ?? []
  const nasTelas = lista.filter((p) => p.contrapartidas.some((c) => c.item === 'telas') && p.inicio <= hoje && p.fim >= hoje).length

  return (
    <>
      <Topo eyebrow="Parcerias" titulo="Parcerias ativas"><span className="muted num">{lista.length} vigentes</span></Topo>
      <div className="numeros">
        <div className="numero"><small>Marcas nas telas agora</small><b>{nasTelas} de 8</b></div>
        {(['bronze', 'prata', 'ouro', 'master'] as const).map((p) => (
          <div key={p} className="numero"><small><PadraoTag padrao={p} /></small><b>{lista.filter((x) => x.padrao === p).length}</b></div>
        ))}
      </div>
      {parcerias.erro && <div className="aviso perigo">{parcerias.erro}</div>}
      {parcerias.carregando && !parcerias.dado ? <p className="muted">Carregando…</p> : lista.length === 0 ? <div className="vazio">Nenhuma parceria ativa.</div> : (
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Marca</th><th>Padrão</th><th>Fim</th><th>Contratado × entregue</th><th>Próximo relatório</th><th>Balanço</th><th>Responsável</th></tr></thead>
            <tbody>
              {lista.map((p) => {
                const minhas = (entregas.dado ?? []).filter((e) => e.parceria_id === p.id)
                const meus = (relatorios.dado ?? []).filter((r) => r.parceria_id === p.id)
                const rel = proximoRelatorio(p.padrao, p.inicio, meus, hoje)
                const bal = proximoBalanco(p.inicio, meus, hoje)
                return (
                  <tr key={p.id} className="clicavel" onClick={() => navegar(`/empresas/${p.empresa_id}`)}>
                    <td>{p.empresas.marca} <Exemplo mostrar={p.empresas.exemplo} /></td>
                    <td><PadraoTag padrao={p.padrao} /></td>
                    <td className="num">{formatarData(p.fim)}</td>
                    <td className="pequeno">{contratadoFeito(p.contrapartidas, minhas).filter((r) => r.contratado !== 1 || r.feito > 0 || r.item.startsWith('ativacao')).map((r) => `${curto[r.item] ?? r.item} ${r.feito}${r.contratado !== null ? `/${r.contratado}` : ''}`).join(' · ')}</td>
                    <td className="num">{rel ? <>{formatarData(rel.prazo)}{rel.atrasado && <span className="pill perigo" style={{ marginLeft: 6 }}>{textosAcompanhamento.atrasado}</span>}</> : 'em dia'}</td>
                    <td className="num">{bal ? <span className={bal.atrasado ? 'erro' : ''}>{formatarData(bal.prazo)}</span> : 'em dia'}</td>
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
