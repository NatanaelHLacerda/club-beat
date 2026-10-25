import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { PadraoTag } from '../../componentes/Rotulos'
import {
  apagarData, cadastrarData, liberarData, listarDatas, listarEmpresasParaReserva, listarJanelas, reservarData, salvarJanela, trocarData, type NovaData,
} from '../../dados/api'
import type { DataDoCalendario, Empresa } from '../../dados/tipos'
import {
  bloqueioDeReserva, prioridadeDaData, rotuloGrupo, rotuloTipoAcao, rotuloTipoData, type GrupoJanela, type Janela, type TipoAcao, type TipoData,
} from '../../regras/calendario'
import { formatarData, hojeISO } from '../../regras/formato'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const diasSemana = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

function situacaoLegivel(d: DataDoCalendario) {
  if (d.situacao === 'reservada') return <span className="pill alerta">Reservada até {formatarData(d.reservada_ate)}</span>
  if (d.situacao === 'confirmada') return <span className="pill ok">Confirmada</span>
  return <span className="pill">Livre</span>
}

export function Calendario() {
  const { perfil } = useSessao()
  const hoje = hojeISO()
  const [ano, setAno] = useState(Number(hoje.slice(0, 4)))
  const [mes, setMes] = useState(Number(hoje.slice(5, 7)) - 1)
  const datas = useConsulta(() => listarDatas(ano), [ano])
  const janelas = useConsulta(() => listarJanelas(ano), [ano])
  const empresas = useConsulta(listarEmpresasParaReserva)
  const [aberta, setAberta] = useState<string | null>(null)
  const podePublicar = pode(perfil, 'publicar_calendario')
  const podeReservar = pode(perfil, 'conduzir') || pode(perfil, 'triar') || pode(perfil, 'decidir_direcao')

  const lista = datas.dado ?? []
  const doMes = lista.filter((d) => Number(d.data.slice(5, 7)) - 1 === mes)
  const nomeEmpresa = (id: string | null) => empresas.dado?.find((e) => e.id === id)
  const recarregar = async () => { await datas.recarregar() }

  return (
    <>
      <Topo eyebrow="Parcerias" titulo="Calendário">
        <button className="botao leve" onClick={() => setAno(ano - 1)}>← {ano - 1}</button>
        <b className="num" style={{ color: 'var(--ink)' }}>{ano}</b>
        <button className="botao leve" onClick={() => setAno(ano + 1)}>{ano + 1} →</button>
      </Topo>
      {datas.erro && <div className="aviso perigo">{datas.erro}</div>}

      <div className="ano">
        {meses.map((m, i) => {
          const dm = lista.filter((d) => Number(d.data.slice(5, 7)) - 1 === i)
          const ocupadas = dm.filter((d) => d.situacao !== 'livre').length
          return (
            <button key={m} className={`mes${i === mes ? ' atual' : ''}`} onClick={() => setMes(i)}>
              <b>{m}</b>
              <span className="muted pequeno num">{dm.length ? `${dm.length} datas · ${ocupadas} ocupadas` : 'sem datas'}</span>
              {ocupadas > 0 && <span className="barra" aria-hidden="true"><span style={{ width: `${Math.min(100, (ocupadas / 4) * 100)}%` }} /></span>}
            </button>
          )
        })}
      </div>

      <Janelas ano={ano} janelas={janelas.dado ?? []} podeEditar={podePublicar} aoSalvar={janelas.recarregar} hoje={hoje} />

      <section className="pilha">
        <div className="linha entre">
          <h2>{meses[mes]} de {ano}</h2>
          <span className="muted pequeno num">{doMes.filter((d) => d.situacao !== 'livre').length} de 4 dias de ação no mês</span>
        </div>
        {datas.carregando && !datas.dado ? <p className="muted">Carregando…</p> : doMes.length === 0 ? (
          <div className="vazio">Nenhuma data cadastrada neste mês.</div>
        ) : (
          <div className="tabela-rolagem">
            <table>
              <thead><tr><th>Data</th><th>Tipo</th><th>Aula e horário</th><th>Alunos (média)</th><th>Tema</th><th>Prioridade</th><th>Empresa</th><th>Situação</th><th></th></tr></thead>
              <tbody>
                {doMes.map((d) => {
                  const e = nomeEmpresa(d.empresa_id)
                  const dia = new Date(`${d.data}T12:00:00Z`).getUTCDay()
                  return (
                    <Fragment key={d.id}>
                      <tr>
                        <td className="num">{formatarData(d.data)} <span className="muted">{diasSemana[dia]}</span></td>
                        <td><span className={`pill${d.tipo === 'A' ? ' ouro' : ''}`}>{d.tipo}</span>{d.vespera_feriado && <span className="pill alerta" style={{ marginLeft: 4 }}>véspera</span>}</td>
                        <td>{d.aula ?? '—'} <span className="muted">{d.horario ?? ''}</span></td>
                        <td className="num">{d.media_alunos ?? '—'}</td>
                        <td>{d.tema ?? '—'}</td>
                        <td className="muted pequeno">{prioridadeDaData(d)}</td>
                        <td>{e ? <Link to={`/empresas/${e.id}`}>{e.marca}</Link> : d.empresa_id ? '—' : ''}{d.tipo_acao && <span className="muted pequeno"> · {rotuloTipoAcao[d.tipo_acao]}</span>}</td>
                        <td>{situacaoLegivel(d)}</td>
                        <td>{(podeReservar || podePublicar) && d.data >= hoje && <button className="botao leve" onClick={() => setAberta(aberta === d.id ? null : d.id)}>{aberta === d.id ? 'Fechar' : 'Abrir'}</button>}</td>
                      </tr>
                      {aberta === d.id && (
                        <tr>
                          <td colSpan={9}>
                            <AcoesDaData d={d} todas={lista} janelas={janelas.dado ?? []} empresas={empresas.dado ?? []} hoje={hoje}
                              podeReservar={podeReservar} podePublicar={podePublicar} aoMudar={async () => { setAberta(null); await recarregar() }} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {podePublicar && <NovaDataForm aoSalvar={recarregar} />}
    </>
  )
}

function AcoesDaData({ d, todas, janelas, empresas, hoje, podeReservar, podePublicar, aoMudar }: {
  d: DataDoCalendario; todas: DataDoCalendario[]; janelas: Janela[]; empresas: Empresa[]; hoje: string
  podeReservar: boolean; podePublicar: boolean; aoMudar: () => Promise<void>
}) {
  const [empresa, setEmpresa] = useState('')
  const [acao, setAcao] = useState<TipoAcao>('ativacao')
  const [nova, setNova] = useState('')
  const [pedido, setPedido] = useState('')
  const [erro, setErro] = useState('')
  const escolhida = empresas.find((e) => e.id === empresa)
  const bloqueio = useMemo(() => (escolhida ? bloqueioDeReserva(d, escolhida, acao, janelas, todas, hoje) : null), [escolhida, d, acao, janelas, todas, hoje])
  const livres = todas.filter((x) => x.situacao === 'livre' && x.data > hoje)

  const agir = async (f: () => Promise<void>) => { setErro(''); try { await f(); await aoMudar() } catch (e) { setErro((e as Error).message) } }

  return (
    <div className="pilha" style={{ padding: '6px 0' }}>
      {d.situacao === 'livre' && podeReservar && (
        <div className="linha">
          <select className="entrada" style={{ width: 'auto' }} aria-label="Empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)}>
            <option value="">Reservar para…</option>
            {empresas.map((e) => <option key={e.id} value={e.id}>{e.marca}</option>)}
          </select>
          {escolhida && <PadraoTag padrao={escolhida.padrao_final} />}
          <select className="entrada" style={{ width: 'auto' }} aria-label="Tipo de ação" value={acao} onChange={(e) => setAcao(e.target.value as TipoAcao)}>
            {(Object.keys(rotuloTipoAcao) as TipoAcao[]).map((a) => <option key={a} value={a}>{rotuloTipoAcao[a]}</option>)}
          </select>
          <button className="botao primario" disabled={!escolhida || Boolean(bloqueio)} onClick={() => void agir(() => reservarData(d.id, empresa, acao))}>Reservar por 7 dias</button>
          {podePublicar && <button className="botao leve perigo" onClick={() => void agir(() => apagarData(d.id))}>Apagar data</button>}
        </div>
      )}
      {bloqueio && <p className="erro" role="alert">{bloqueio}</p>}
      {d.situacao === 'reservada' && podeReservar && (
        <div className="linha"><button className="botao" onClick={() => void agir(() => liberarData(d.id, 'Liberada na tela do calendário'))}>Liberar reserva</button></div>
      )}
      {d.situacao !== 'livre' && podeReservar && (
        <div className="linha">
          <select className="entrada" style={{ width: 'auto' }} aria-label="Nova data" value={nova} onChange={(e) => setNova(e.target.value)}>
            <option value="">Trocar para…</option>
            {livres.map((x) => <option key={x.id} value={x.id}>{formatarData(x.data)} · {x.tipo}</option>)}
          </select>
          <input className="entrada" style={{ maxWidth: 320 }} placeholder="Pedido por escrito da empresa" value={pedido} onChange={(e) => setPedido(e.target.value)} />
          <button className="botao" disabled={!nova} onClick={() => void agir(() => trocarData(d.id, nova, pedido))}>Trocar data</button>
        </div>
      )}
      {erro && <p className="erro" role="alert">{erro}</p>}
    </div>
  )
}

function Janelas({ ano, janelas, podeEditar, aoSalvar, hoje }: { ano: number; janelas: Janela[]; podeEditar: boolean; aoSalvar: () => Promise<void>; hoje: string }) {
  const [erro, setErro] = useState('')
  const grupos: GrupoJanela[] = ['master_ouro', 'prata', 'bronze']
  async function salvar(grupo: GrupoJanela, campo: 'abre_em' | 'fecha_em', valor: string) {
    const atual = janelas.find((j) => j.grupo === grupo) ?? { ano, grupo, abre_em: valor, fecha_em: valor }
    setErro('')
    try { await salvarJanela({ ...atual, [campo]: valor }); await aoSalvar() } catch (e) { setErro((e as Error).message) }
  }
  return (
    <section className="cartao">
      <h3>Janelas de escolha das datas A · {ano}</h3>
      <p className="muted pequeno">Master e Ouro escolhem primeiro, depois Prata, depois Bronze. Sugestão: 15 dias por janela.</p>
      <div className="grade-3">
        {grupos.map((g) => {
          const j = janelas.find((x) => x.grupo === g)
          const agora = j && hoje >= j.abre_em && hoje <= j.fecha_em
          return (
            <div key={g} className="pilha" style={{ gap: 6 }}>
              <span>{rotuloGrupo[g]} {agora && <span className="pill ouro">aberta agora</span>}</span>
              {podeEditar ? (
                <div className="linha">
                  <input className="entrada" type="date" aria-label={`${rotuloGrupo[g]} abre em`} value={j?.abre_em ?? ''} onChange={(e) => void salvar(g, 'abre_em', e.target.value)} />
                  <input className="entrada" type="date" aria-label={`${rotuloGrupo[g]} fecha em`} value={j?.fecha_em ?? ''} onChange={(e) => void salvar(g, 'fecha_em', e.target.value)} />
                </div>
              ) : <span className="muted num">{j ? `${formatarData(j.abre_em)} a ${formatarData(j.fecha_em)}` : '—'}</span>}
            </div>
          )
        })}
      </div>
      {erro && <p className="erro">{erro}</p>}
    </section>
  )
}

function NovaDataForm({ aoSalvar }: { aoSalvar: () => Promise<void> }) {
  const vazio: NovaData = { data: '', tipo: 'C', vespera_feriado: false, aula: '', horario: '', media_alunos: null, tema: '' }
  const [d, setD] = useState<NovaData>(vazio)
  const [msg, setMsg] = useState('')
  async function salvar() {
    setMsg('')
    if (!d.data) { setMsg('Informe a data.'); return }
    try { await cadastrarData({ ...d, aula: d.aula || null, horario: d.horario || null, tema: d.tema || null }); setD(vazio); setMsg('Data cadastrada.'); await aoSalvar() } catch (e) { setMsg((e as Error).message) }
  }
  return (
    <section className="cartao">
      <h3>Cadastrar data</h3>
      <div className="grade-3">
        <label className="campo"><span>Data</span><input id="nd-data" type="date" value={d.data} onChange={(e) => setD({ ...d, data: e.target.value })} /></label>
        <label className="campo"><span>Tipo</span>
          <select id="nd-tipo" value={d.tipo} onChange={(e) => setD({ ...d, tipo: e.target.value as TipoData })}>
            {(Object.keys(rotuloTipoData) as TipoData[]).map((t) => <option key={t} value={t}>{rotuloTipoData[t]}</option>)}
          </select>
        </label>
        <label className="campo"><span>Aula</span><input id="nd-aula" value={d.aula ?? ''} onChange={(e) => setD({ ...d, aula: e.target.value })} /></label>
        <label className="campo"><span>Horário</span><input id="nd-horario" value={d.horario ?? ''} onChange={(e) => setD({ ...d, horario: e.target.value })} placeholder="09:00" /></label>
        <label className="campo"><span>Alunos (média)</span><input id="nd-alunos" type="number" min={0} value={d.media_alunos ?? ''} onChange={(e) => setD({ ...d, media_alunos: e.target.value === '' ? null : Number(e.target.value) })} /></label>
        <label className="campo"><span>Tema ou evento</span><input id="nd-tema" value={d.tema ?? ''} onChange={(e) => setD({ ...d, tema: e.target.value })} /></label>
      </div>
      <label className="marcar"><input type="checkbox" checked={d.vespera_feriado} onChange={(e) => setD({ ...d, vespera_feriado: e.target.checked })} /><span>Véspera de feriado (só Bronze e Prata)</span></label>
      <div className="linha"><button className="botao primario" onClick={() => void salvar()}>Cadastrar data</button>{msg && <span className="muted">{msg}</span>}</div>
    </section>
  )
}
