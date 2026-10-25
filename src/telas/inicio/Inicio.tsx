import { Link, useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { FunilBarras, GraficoPontos, Rosca } from '../../componentes/graficos/Graficos'
import { PadraoTag } from '../../componentes/Rotulos'
import { Avatar, Carregando, CartaoNumero, Icone, Pill, SecaoCabecalho, Vazio } from '../../componentes/ui'
import { listarDatas, listarEmpresas, listarPrazos, listarRenovacoes, listarUsuarios, obterIndicadores } from '../../dados/api'
import type { PrazoAberto } from '../../dados/tipos'
import { rotuloTipoAcao } from '../../regras/calendario'
import { etapasDoFunil, rotuloEtapa } from '../../regras/etapas'
import { formatarData, formatarDinheiro, hojeISO } from '../../regras/formato'
import { agruparPorDia } from '../../regras/graficos'
import { rotuloSituacaoPrazo } from '../../regras/prazos'
import { diasParaOFim } from '../../regras/renovacao'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

const mesAnterior = (mes: string) => {
  const [a, m] = mes.split('-').map(Number)
  return m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, '0')}`
}
const nomeMes = (mes: string) => new Date(`${mes}-15T12:00:00Z`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export function Inicio() {
  const { perfil } = useSessao()
  const navegar = useNavigate()
  const hoje = hojeISO()
  const mes = hoje.slice(0, 7)
  const atual = useConsulta(() => obterIndicadores(mes), [mes])
  const anterior = useConsulta(() => obterIndicadores(mesAnterior(mes)), [mes])
  const empresas = useConsulta(() => listarEmpresas())
  const prazos = useConsulta(listarPrazos)
  const datas = useConsulta(() => listarDatas(Number(hoje.slice(0, 4))), [hoje.slice(0, 4)])
  const renovacoes = useConsulta(listarRenovacoes)
  const usuarios = useConsulta(listarUsuarios)

  const i = atual.dado
  const lista = empresas.dado ?? []
  const ativas = i ? Object.values(i.ativas_por_padrao).reduce((s, n) => s + n, 0) : null
  const emProposta = lista.filter((e) => e.etapa === 'proposta' || e.etapa === 'direcao').length
  const ehMeu = (p: PrazoAberto) => p.responsavel_id === perfil?.id || (!p.responsavel_id && p.papel_responsavel === perfil?.papel) || perfil?.papel === 'direcao'
  const paraHoje = (prazos.dado ?? []).filter((p) => p.situacao !== 'no_prazo' && ehMeu(p)).sort((a, b) => a.prazo.localeCompare(b.prazo))
  const proximas = (datas.dado ?? []).filter((d) => d.data >= hoje).slice(0, 5)
  const etapasDoGrafico = etapasDoFunil.filter((e) => !['ativa', 'renovacao', 'encerrada'].includes(e))
  const nome = perfil?.nome.replace(/\s*\(exemplo\)$/i, '').split(' ')[0] ?? ''

  return (
    <>
      <Topo eyebrow={nomeMes(mes)} titulo={`Olá, ${nome}`}>
        <Link className="ver-todos" to="/painel">Indicadores detalhados</Link>
      </Topo>

      <div className="numeros">
        <CartaoNumero rotulo="Empresas que chegaram" icone="empresas" valor={i ? i.chegaram : '—'} atual={i?.chegaram ?? null} anterior={anterior.dado?.chegaram ?? null} />
        <CartaoNumero rotulo="Parcerias ativas" icone="parcerias" valor={ativas ?? '—'} atual={ativas} anterior={null} />
        <CartaoNumero rotulo="Propostas em andamento" icone="regras" valor={empresas.dado ? emProposta : '—'} atual={empresas.dado ? emProposta : null} anterior={null} />
        <CartaoNumero rotulo="Receita mensal de parcerias" icone="painel"
          valor={!i ? '—' : i.receita_centavos !== null ? formatarDinheiro(i.receita_centavos) : i.receita_sem_valor ? 'R$ …' : '—'}
          atual={i?.receita_centavos ?? null} anterior={null} ajuda={i?.receita_sem_valor ? `${i.receita_sem_valor} parceria(s) sem valor definido` : undefined} />
      </div>

      <div className="grade-inicio">
        <section className="cartao">
          <SecaoCabecalho titulo="Empresas que chegaram por dia" para="/empresas" />
          {empresas.carregando && !empresas.dado ? <Carregando /> : <GraficoPontos titulo="Empresas que chegaram por dia" dias={agruparPorDia(lista.map((e) => e.criado_em), mes)} />}
        </section>
        <section className="cartao">
          <SecaoCabecalho titulo="Parcerias ativas por padrão" para="/parcerias" />
          {!i ? <Carregando /> : <Rosca centro="ativas" valores={(['bronze', 'prata', 'ouro', 'master'] as const).map((p) => ({ chave: p, valor: i.ativas_por_padrao[p] ?? 0 }))} />}
        </section>
      </div>

      <div className="grade-inicio">
        <section className="cartao">
          <SecaoCabecalho titulo="Funil agora" para="/funil" />
          {!empresas.dado ? <Carregando /> : (
            <FunilBarras etapas={etapasDoGrafico.map((e) => ({ chave: e, rotulo: rotuloEtapa[e], quantidade: lista.filter((x) => x.etapa === e).length }))} />
          )}
        </section>
        <section className="cartao">
          <SecaoCabecalho titulo="Para hoje" para="/prazos" />
          {!prazos.dado ? <Carregando /> : paraHoje.length === 0 ? <Vazio texto="Nada atrasado nem vencendo hoje." icone="check" /> : (
            <ul className="lista-tarefas">
              {paraHoje.slice(0, 6).map((p) => (
                <li key={`${p.empresa_id}-${p.descricao}`}>
                  <button onClick={() => navegar(`/empresas/${p.empresa_id}`)}>
                    <span className={`icone-redondo ${p.situacao === 'atrasado' ? 'perigo' : 'alerta'}`}><Icone nome="prazos" tamanho={14} /></span>
                    <span className="pilha" style={{ gap: 0, minWidth: 0 }}><b>{p.descricao}</b><span className="muted pequeno">{p.marca} · {p.responsavel_id ? nomeDe(usuarios.dado, p.responsavel_id) : 'equipe'}</span></span>
                    <span className="pilha" style={{ gap: 2, alignItems: 'flex-end' }}>
                      <Pill tom={p.situacao === 'atrasado' ? 'perigo' : 'alerta'}>{rotuloSituacaoPrazo[p.situacao]}</Pill>
                      <span className="muted pequeno num"><Icone nome="calendario" tamanho={12} /> {formatarData(p.prazo)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grade-inicio">
        <section className="cartao">
          <SecaoCabecalho titulo="Próximas datas do calendário" para="/calendario" />
          {!datas.dado ? <Carregando /> : proximas.length === 0 ? <Vazio texto="Nenhuma data cadastrada à frente." icone="calendario" /> : (
            <ul className="lista-tarefas">
              {proximas.map((d) => {
                const e = lista.find((x) => x.id === d.empresa_id)
                return (
                  <li key={d.id}><div className="item-fixo">
                    <span className="data-bloco"><b className="destaque-numero">{d.data.slice(8, 10)}</b><span className="pequeno muted">{new Date(`${d.data}T12:00:00Z`).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })}</span></span>
                    <span className="pilha" style={{ gap: 0, minWidth: 0 }}><b>{d.aula ?? 'Data'} {d.horario ?? ''}</b><span className="muted pequeno">{e ? `${e.marca}${d.tipo_acao ? ` · ${rotuloTipoAcao[d.tipo_acao]}` : ''}` : 'Livre'}</span></span>
                    <span className="linha" style={{ gap: 6 }}><Pill tom={d.tipo === 'A' ? 'ouro' : 'neutro'}>{d.tipo}</Pill><Pill tom={d.situacao === 'confirmada' ? 'oceano' : d.situacao === 'reservada' ? 'alerta' : 'neutro'}>{d.situacao === 'livre' ? 'Livre' : d.situacao === 'reservada' ? 'Reservada' : 'Confirmada'}</Pill></span>
                  </div></li>
                )
              })}
            </ul>
          )}
        </section>
        <section className="cartao">
          <SecaoCabecalho titulo="Renovações nos próximos 90 dias" para="/renovacoes" />
          {!renovacoes.dado ? <Carregando /> : renovacoes.dado.length === 0 ? <Vazio texto="Nenhum contrato termina nos próximos 90 dias." icone="renovacoes" /> : (
            <ul className="lista-tarefas">
              {renovacoes.dado.slice(0, 3).map((p) => (
                <li key={p.id}><button onClick={() => navegar(`/empresas/${p.empresa_id}`)}>
                  <Avatar nome={p.empresas.marca} tamanho={32} />
                  <span className="pilha" style={{ gap: 0, minWidth: 0 }}><b>{p.empresas.marca}</b><span className="muted pequeno">termina em {formatarData(p.fim)}</span></span>
                  <span className="pilha" style={{ gap: 2, alignItems: 'flex-end' }}><PadraoTag padrao={p.padrao} /><span className="muted pequeno num">{diasParaOFim(p.fim, hoje)} dias</span></span>
                </button></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
