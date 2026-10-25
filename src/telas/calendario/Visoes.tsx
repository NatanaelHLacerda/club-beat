// REQ-023 — visões Semana e Mês do calendário.
import { BotaoIcone } from '../../componentes/ui'
import type { DataDoCalendario, Empresa } from '../../dados/tipos'
import { formatarData } from '../../regras/formato'
import { diasDaSemana, gradeDoMes, minutosDoHorario } from '../../regras/semana'

const nomesDias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const HORA_INICIO = 6
const HORA_FIM = 22
const ALTURA_HORA = 48

type PropsBloco = { d: DataDoCalendario; empresa?: Empresa; aoAbrir: (d: DataDoCalendario) => void; compacto?: boolean }

export function BlocoData({ d, empresa, aoAbrir, compacto }: PropsBloco) {
  const titulo = `${d.aula ?? 'Data'} ${d.horario ?? ''}`.trim()
  return (
    <button className={`bloco-data ${d.situacao}${compacto ? ' compacto' : ''}`} onClick={() => aoAbrir(d)}
      aria-label={`${formatarData(d.data)} ${titulo}, tipo ${d.tipo}, ${d.situacao === 'livre' ? 'livre' : `${d.situacao} ${empresa?.marca ?? ''}`}`}>
      <span className="linha entre" style={{ gap: 4, flexWrap: 'nowrap' }}>
        <b>{titulo}</b>
        <span className="linha" style={{ gap: 3 }}>{d.vespera_feriado && <span className="selo-v" title="Véspera de feriado">V</span>}{d.tipo === 'A' && <span className="selo-a" title="Data A · alta procura">A</span>}</span>
      </span>
      {!compacto && <span className="pequeno">{empresa ? empresa.marca : d.situacao === 'livre' ? 'Livre' : 'Ocupada'}</span>}
      {!compacto && d.situacao === 'reservada' && <span className="pequeno">até {formatarData(d.reservada_ate)}</span>}
    </button>
  )
}

type PropsSemana = { referencia: string; hoje: string; datas: DataDoCalendario[]; empresas: Empresa[]; aoAbrir: (d: DataDoCalendario) => void; diaMovel: number; mudarDiaMovel: (n: number) => void }

export function VisaoSemana({ referencia, hoje, datas, empresas, aoAbrir, diaMovel, mudarDiaMovel }: PropsSemana) {
  const dias = diasDaSemana(referencia)
  const horas = Array.from({ length: HORA_FIM - HORA_INICIO }, (_, i) => HORA_INICIO + i)
  const empresaDe = (id: string | null) => empresas.find((e) => e.id === id)
  return (
    <div className="semana" style={{ ['--dia-movel' as string]: diaMovel }}>
      <div className="semana-movel linha entre">
        <BotaoIcone icone="recolher" rotulo="Dia anterior" aoClicar={() => mudarDiaMovel(Math.max(0, diaMovel - 1))} />
        <b>{nomesDias[diaMovel]} {formatarData(dias[diaMovel])}</b>
        <BotaoIcone icone="expandir" rotulo="Próximo dia" aoClicar={() => mudarDiaMovel(Math.min(6, diaMovel + 1))} />
      </div>
      <div className="semana-grade">
        <div className="semana-horas">
          <div className="semana-cabeca" />
          {horas.map((h) => <div key={h} className="hora" style={{ height: ALTURA_HORA }}>{String(h).padStart(2, '0')}:00</div>)}
        </div>
        {dias.map((dia, i) => {
          const doDia = datas.filter((d) => d.data === dia)
          const semHora = doDia.filter((d) => minutosDoHorario(d.horario) === null)
          return (
            <div key={dia} className={`semana-dia${dia === hoje ? ' hoje' : ''}${i === diaMovel ? ' movel' : ''}`}>
              <div className="semana-cabeca">
                <span className="pequeno muted">{nomesDias[i]}</span>
                <b className={dia === hoje ? 'dia-hoje' : ''}>{dia.slice(8, 10)}</b>
              </div>
              <div className="semana-corpo" style={{ height: horas.length * ALTURA_HORA }}>
                {horas.map((h) => <div key={h} className="linha-hora" style={{ top: (h - HORA_INICIO) * ALTURA_HORA }} />)}
                {doDia.map((d) => {
                  const min = minutosDoHorario(d.horario)
                  if (min === null) return null
                  const topo = Math.max(0, ((min / 60) - HORA_INICIO) * ALTURA_HORA)
                  return <div key={d.id} className="posicao-bloco" style={{ top: topo, height: ALTURA_HORA - 4 }}><BlocoData d={d} empresa={empresaDe(d.empresa_id)} aoAbrir={aoAbrir} /></div>
                })}
                {semHora.length > 0 && <div className="sem-hora">{semHora.map((d) => <BlocoData key={d.id} d={d} empresa={empresaDe(d.empresa_id)} aoAbrir={aoAbrir} compacto />)}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type PropsMes = { mes: string; hoje: string; datas: DataDoCalendario[]; empresas: Empresa[]; aoAbrir: (d: DataDoCalendario) => void; aoAbrirDia: (dia: string) => void }

export function VisaoMes({ mes, hoje, datas, empresas, aoAbrir, aoAbrirDia }: PropsMes) {
  const grade = gradeDoMes(mes)
  return (
    <div className="mes-grade" role="grid">
      {nomesDias.map((n) => <div key={n} className="mes-cabeca pequeno muted" role="columnheader">{n}</div>)}
      {grade.flat().map((dia) => {
        const doDia = datas.filter((d) => d.data === dia.data)
        return (
          <div key={dia.data} className={`mes-dia${dia.doMes ? '' : ' fora'}${dia.data === hoje ? ' hoje' : ''}`} role="gridcell">
            <button className="mes-numero" onClick={() => aoAbrirDia(dia.data)} aria-label={`Ver a semana de ${formatarData(dia.data)}`}>{Number(dia.data.slice(8, 10))}</button>
            {doDia.slice(0, 3).map((d) => <BlocoData key={d.id} d={d} empresa={empresas.find((e) => e.id === d.empresa_id)} aoAbrir={aoAbrir} compacto />)}
            {doDia.length > 3 && <button className="mais-n pequeno" onClick={() => aoAbrirDia(dia.data)}>+{doDia.length - 3}</button>}
          </div>
        )
      })}
    </div>
  )
}
