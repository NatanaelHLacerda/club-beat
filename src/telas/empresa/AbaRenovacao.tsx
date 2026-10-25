import { useState } from 'react'
import { nomeDe } from '../../componentes/Filtros'
import { PadraoTag } from '../../componentes/Rotulos'
import { decidirRenovacao, encerrarParceria, listarEntregas, listarRelatorios, obterParceriaDaEmpresa } from '../../dados/api'
import { rotuloPadrao, type Padrao } from '../../dados/tipos'
import { contratadoFeito, notaMedia } from '../../regras/acompanhamento'
import { formatarData, formatarDataHora, hojeISO } from '../../regras/formato'
import {
  diasParaOFim, itensEncerramento, pendenciasEncerramento, quemDecideRenovacao, rotuloCaminho, textosRenovacao, type Caminho, type Renovacao,
} from '../../regras/renovacao'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'
import type { PropsAba } from './Ficha'

export function AbaRenovacao({ empresa, usuarios, atualizar, abrirAba }: PropsAba) {
  const { perfil } = useSessao()
  const hoje = hojeISO()
  const parceria = useConsulta(() => obterParceriaDaEmpresa(empresa.id), [empresa.id])
  const p = parceria.dado
  const entregas = useConsulta(() => (p ? listarEntregas(p.id) : Promise.resolve([])), [p?.id])
  const relatorios = useConsulta(() => (p ? listarRelatorios(p.id) : Promise.resolve([])), [p?.id])
  const r: Renovacao = p?.renovacao ?? {}
  const [avaliacao, setAvaliacao] = useState<NonNullable<Renovacao['avaliacao']>>(r.avaliacao ?? {})
  const [caminho, setCaminho] = useState<Caminho | ''>(r.caminho ?? '')
  const [novoPadrao, setNovoPadrao] = useState<Padrao | ''>((r.novo_padrao as Padrao | undefined) ?? '')
  const [encerramento, setEncerramento] = useState<Record<string, boolean>>(r.encerramento ?? {})
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  if (parceria.carregando && !parceria.dado) return <p className="muted">Carregando…</p>
  if (!p) return <div className="vazio">Nenhuma parceria para renovar.</div>

  const ehDirecao = pode(perfil, 'decidir_direcao')
  const podeDecidir = (pode(perfil, 'conduzir') || ehDirecao) && p.situacao === 'vigente' && (!r.decidida_em)
  const decide = quemDecideRenovacao(p.padrao, novoPadrao || null)
  const faltam = diasParaOFim(p.fim, hoje)
  const resumo = contratadoFeito(p.contrapartidas, entregas.dado ?? [])
  const media = notaMedia((entregas.dado ?? []).map((e) => e.nota_membros))

  const agir = async (f: () => Promise<unknown>, ok: string) => {
    setErro(''); setAviso('')
    try { await f(); setAviso(ok); await parceria.recarregar(); await atualizar() } catch (e) { setErro((e as Error).message) }
  }

  return (
    <div className="pilha">
      {p.promessa_revisao && <div className="aviso alerta"><b>Prometido rever ao fim do contrato:</b> {p.promessa_revisao}</div>}

      <section className="cartao">
        <div className="linha entre">
          <h3>Avaliação da parceria</h3>
          <span className={`pill ${faltam <= 30 ? 'perigo' : faltam <= 90 ? 'alerta' : ''}`}>termina em {formatarData(p.fim)} · {faltam} dias</span>
        </div>
        <div className="numeros">
          {resumo.map((x) => <div key={x.item} className="numero"><small>{x.item}</small><b>{x.feito}{x.contratado !== null ? `/${x.contratado}` : ''}</b></div>)}
          <div className="numero"><small>Opinião dos membros</small><b>{media !== null ? media.toLocaleString('pt-BR') : '—'}</b></div>
          <div className="numero"><small>Relatórios enviados</small><b>{(relatorios.dado ?? []).length}</b></div>
        </div>
        <p className="pequeno"><span className="muted">Resultado combinado na reunião: </span>{empresa.reuniao?.sucesso ?? '—'}</p>
        <div className="grade-2">
          <label className="marcar"><input type="checkbox" disabled={!podeDecidir} checked={Boolean(avaliacao.pagamentos_em_dia)} onChange={(e) => setAvaliacao({ ...avaliacao, pagamentos_em_dia: e.target.checked })} /><span>Pagamentos em dia</span></label>
          <label className="campo"><span>Interesse da empresa no próximo período</span><input disabled={!podeDecidir} value={avaliacao.interesse_empresa ?? ''} onChange={(e) => setAvaliacao({ ...avaliacao, interesse_empresa: e.target.value })} /></label>
          <label className="campo"><span>Resultados e o que funcionou</span><textarea disabled={!podeDecidir} value={avaliacao.resultados ?? ''} onChange={(e) => setAvaliacao({ ...avaliacao, resultados: e.target.value })} /></label>
          <label className="campo"><span>Observação</span><textarea disabled={!podeDecidir} value={avaliacao.observacao ?? ''} onChange={(e) => setAvaliacao({ ...avaliacao, observacao: e.target.value })} /></label>
        </div>
      </section>

      <section className="cartao">
        <div className="linha entre"><h3>Caminho</h3><PadraoTag padrao={p.padrao} /></div>
        {r.decidida_em ? (
          <p>Decidido: <b style={{ color: 'var(--ink)' }}>{rotuloCaminho[r.caminho!]}</b>{r.novo_padrao ? ` (${rotuloPadrao[r.novo_padrao]})` : ''} por {nomeDe(usuarios, r.decidida_por ?? null)} em {formatarDataHora(r.decidida_em)}.</p>
        ) : r.aguardando_direcao ? (
          <p className="aviso alerta">{textosRenovacao.direcao} Proposta: {rotuloCaminho[r.caminho!]}.</p>
        ) : null}
        {podeDecidir && (
          <>
            <div className="pilha" role="radiogroup" aria-label="Caminho">
              {(Object.keys(rotuloCaminho) as Caminho[]).map((c) => (
                <label key={c} className="marcar"><input type="radio" name="caminho" checked={caminho === c} onChange={() => setCaminho(c)} /><span>{rotuloCaminho[c]}</span></label>
              ))}
            </div>
            {caminho === 'mudar_padrao' && (
              <label className="campo" style={{ maxWidth: 240 }}><span>Novo padrão</span>
                <select value={novoPadrao} onChange={(e) => setNovoPadrao(e.target.value as Padrao)}>
                  <option value="">Escolha</option>
                  {(Object.keys(rotuloPadrao) as Padrao[]).filter((x) => x !== p.padrao).map((x) => <option key={x} value={x}>{rotuloPadrao[x]}</option>)}
                </select>
              </label>
            )}
            {decide === 'direcao' && !ehDirecao && <p className="muted pequeno">{textosRenovacao.direcao} A sua escolha vai como proposta.</p>}
            <div className="linha">
              <button className="botao primario" disabled={!caminho} onClick={() => void agir(() => decidirRenovacao(p.id, caminho as Caminho, avaliacao, novoPadrao || null), decide === 'direcao' && !ehDirecao ? 'Proposta de renovação enviada à Direção.' : 'Decisão registrada.')}>
                {decide === 'direcao' && !ehDirecao ? 'Propor à Direção' : 'Registrar decisão'}
              </button>
              <button className="botao leve" onClick={() => abrirAba('mensagens', 'A7')}>Convite de renovação (A7)</button>
            </div>
          </>
        )}
      </section>

      {r.caminho === 'encerrar' && r.decidida_em && p.situacao === 'vigente' && (
        <section className="cartao">
          <h3>Encerramento</h3>
          {itensEncerramento.map((i) => (
            <label key={i.id} className="marcar"><input type="checkbox" checked={Boolean(encerramento[i.id])} onChange={(e) => setEncerramento({ ...encerramento, [i.id]: e.target.checked })} /><span>{i.rotulo}</span></label>
          ))}
          <p className="muted pequeno">Ao encerrar, a exclusividade da categoria fica livre e a empresa vai para Encerrada.</p>
          <div><button className="botao perigo" onClick={() => {
            if (pendenciasEncerramento(encerramento).length) { setErro(textosRenovacao.encerramento); return }
            void agir(() => encerrarParceria(p.id, encerramento), 'Parceria encerrada.')
          }}>Encerrar parceria</button></div>
        </section>
      )}

      {erro && <div className="aviso perigo" role="alert">{erro}</div>}
      {aviso && <div className="aviso" role="status">{aviso}</div>}
    </div>
  )
}
