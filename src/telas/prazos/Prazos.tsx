import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { EtapaTag } from '../../componentes/Rotulos'
import { listarPrazos, listarUsuarios } from '../../dados/api'
import { rotuloPapel, type PrazoAberto } from '../../dados/tipos'
import { formatarData } from '../../regras/formato'
import { ordemSituacao, rotuloSituacaoPrazo } from '../../regras/prazos'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

const tom = { atrasado: 'perigo', vence_hoje: 'alerta', no_prazo: '' } as const

export function Prazos() {
  const { perfil } = useSessao()
  const navegar = useNavigate()
  const prazos = useConsulta(listarPrazos)
  const usuarios = useConsulta(listarUsuarios)
  const [meus, setMeus] = useState(false)
  const ehMeu = (p: PrazoAberto) => p.responsavel_id === perfil?.id || (!p.responsavel_id && p.papel_responsavel === perfil?.papel)
  const lista = (prazos.dado ?? []).filter((p) => !meus || ehMeu(p)).sort((a, b) => ordemSituacao[a.situacao] - ordemSituacao[b.situacao] || a.prazo.localeCompare(b.prazo))
  const conta = (s: PrazoAberto['situacao']) => lista.filter((p) => p.situacao === s).length

  return (
    <>
      <Topo eyebrow="Acompanhamento" titulo="Prazos">
        <label className="marcar"><input type="checkbox" checked={meus} onChange={(e) => setMeus(e.target.checked)} /><span>Só os meus</span></label>
      </Topo>
      <div className="numeros">
        <div className="numero"><small>Atrasados</small><b className={conta('atrasado') ? 'erro' : ''}>{conta('atrasado')}</b></div>
        <div className="numero"><small>Vencem hoje</small><b>{conta('vence_hoje')}</b></div>
        <div className="numero"><small>No prazo</small><b>{conta('no_prazo')}</b></div>
      </div>
      <p className="muted pequeno">Prazos em dias úteis (sem sábado, domingo e feriados cadastrados). Avisos e escalonamento saem todo dia às 6h10.</p>
      {prazos.erro && <div className="aviso perigo">{prazos.erro}</div>}
      {prazos.carregando && !prazos.dado ? <p className="muted">Carregando…</p> : lista.length === 0 ? <div className="vazio">Nenhum prazo aberto.</div> : (
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Situação</th><th>Empresa</th><th>Etapa</th><th>O que falta</th><th>Prazo</th><th>Com quem</th></tr></thead>
            <tbody>
              {lista.map((p) => (
                <tr key={`${p.empresa_id}-${p.descricao}`} className="clicavel" onClick={() => navegar(`/empresas/${p.empresa_id}`)}>
                  <td><span className={`pill ${tom[p.situacao]}`}>{rotuloSituacaoPrazo[p.situacao]}</span></td>
                  <td>{p.marca}</td>
                  <td><EtapaTag etapa={p.etapa} /></td>
                  <td>{p.descricao}</td>
                  <td className="num">{formatarData(p.prazo)}</td>
                  <td className="muted">{p.responsavel_id ? nomeDe(usuarios.dado, p.responsavel_id) : rotuloPapel[p.papel_responsavel]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
