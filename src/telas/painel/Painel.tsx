import { useState } from 'react'
import { Topo } from '../../componentes/Casca'
import { PadraoTag } from '../../componentes/Rotulos'
import { listarMetas, obterIndicadores, salvarMeta } from '../../dados/api'
import type { Padrao } from '../../dados/tipos'
import { formatarData, formatarDinheiro, hojeISO } from '../../regras/formato'
import { comparaMeta, percentual, textoNumero, textoPercentual, type Comparacao, type Indicadores } from '../../regras/indicadores'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

type Linha = { id: string; rotulo: string; mostra: string; valor: number | null; sufixoMeta?: string; menorEhMelhor?: boolean; ajuda: string }

function linhas(i: Indicadores): { titulo: string; itens: Linha[] }[] {
  const resp = percentual(i.respondidas_2du, i.chegaram)
  const reun = percentual(i.chegaram_reuniao, i.chegaram)
  const conv = percentual(i.viraram_contrato, i.reunioes)
  const renov = percentual(i.renovadas, i.decididas_renovacao)
  const datasA = percentual(i.datas_a_ocupadas, i.datas_a_total)
  const ativas = Object.values(i.ativas_por_padrao).reduce((s, n) => s + n, 0)
  return [
    { titulo: 'Funil · como o sistema anda', itens: [
      { id: 'chegaram', rotulo: 'Empresas que chegaram', mostra: textoNumero(i.chegaram), valor: i.chegaram, ajuda: 'Interesse pelo Club' },
      { id: 'respondidas_2du', rotulo: 'Respondidas em até 2 dias úteis', mostra: textoPercentual(resp), valor: resp, sufixoMeta: '%', ajuda: 'Agilidade da triagem' },
      { id: 'chegaram_reuniao', rotulo: 'Chegaram à reunião', mostra: textoPercentual(reun), valor: reun, sufixoMeta: '%', ajuda: 'Qualidade da triagem' },
      { id: 'reunioes_contrato', rotulo: 'Reuniões que viraram contrato', mostra: textoPercentual(conv), valor: conv, sufixoMeta: '%', ajuda: 'Qualidade da reunião e da proposta' },
      { id: 'dias_ate_contrato', rotulo: 'Dias entre a chegada e o contrato', mostra: textoNumero(i.dias_ate_contrato, ' dias'), valor: i.dias_ate_contrato, sufixoMeta: ' dias', menorEhMelhor: true, ajuda: 'Velocidade do funil' },
      { id: 'recusadas', rotulo: 'Recusadas', mostra: textoNumero(i.recusadas_nao_combina), valor: i.recusadas_nao_combina, ajuda: 'Rigor da curadoria' },
    ] },
    { titulo: 'Carteira · o que o Club tem', itens: [
      { id: 'ativas', rotulo: 'Parcerias ativas', mostra: textoNumero(ativas), valor: ativas, ajuda: 'Equilíbrio entre os padrões (abaixo)' },
      { id: 'receita', rotulo: 'Receita mensal de parcerias', mostra: i.receita_centavos !== null ? formatarDinheiro(i.receita_centavos) + (i.receita_sem_valor ? ` + ${i.receita_sem_valor} sem valor` : '') : i.receita_sem_valor ? 'R$ …' : '—', valor: i.receita_centavos !== null ? i.receita_centavos / 100 : null, ajuda: 'Peso financeiro' },
      { id: 'renovacoes', rotulo: 'Renovações', mostra: textoPercentual(renov), valor: renov, sufixoMeta: '%', ajuda: 'Satisfação dos parceiros' },
      { id: 'datas_a', rotulo: 'Datas A ocupadas no mês', mostra: textoPercentual(datasA), valor: datasA, sufixoMeta: '%', ajuda: 'Procura pelas melhores datas' },
      { id: 'vencendo_sem_aviso', rotulo: 'Contratos vencendo sem aviso', mostra: textoNumero(i.vencendo_sem_aviso), valor: i.vencendo_sem_aviso, menorEhMelhor: true, ajuda: 'Falhas no sistema de avisos (meta: 0)' },
    ] },
    { titulo: 'Experiência · o que membro e parceiro sentem', itens: [
      { id: 'nota_membros', rotulo: 'Opinião dos membros nas ativações', mostra: textoNumero(i.nota_membros, ' de 5'), valor: i.nota_membros, ajuda: 'Pergunta curta após cada ação' },
      { id: 'nota_parceiro', rotulo: 'Satisfação do parceiro', mostra: textoNumero(i.nota_parceiro, ' de 5'), valor: i.nota_parceiro, ajuda: 'Conversa de balanço' },
      { id: 'reclamacoes', rotulo: 'Reclamações de membros no trimestre', mostra: textoNumero(i.reclamacoes_trimestre), valor: i.reclamacoes_trimestre, menorEhMelhor: true, ajuda: 'Registro simples' },
    ] },
  ]
}

const tomMeta: Record<Comparacao, string> = { atingida: 'ok', abaixo: 'perigo', sem_meta: '', sem_dado: '' }

export function Painel() {
  const { perfil } = useSessao()
  const [mes, setMes] = useState(hojeISO().slice(0, 7))
  const ind = useConsulta(() => obterIndicadores(mes), [mes])
  const metas = useConsulta(listarMetas)
  const podeMeta = pode(perfil, 'configurar')
  const [editando, setEditando] = useState<string | null>(null)
  const [valorMeta, setValorMeta] = useState('')

  async function gravarMeta(id: string) {
    await salvarMeta(id, valorMeta.trim() === '' ? null : Number(valorMeta.replace(',', '.')))
    setEditando(null)
    await metas.recarregar()
  }

  const i = ind.dado
  return (
    <>
      <Topo eyebrow="Acompanhamento" titulo="Painel">
        <input className="entrada" style={{ width: 'auto' }} type="month" aria-label="Mês" value={mes} onChange={(e) => setMes(e.target.value)} />
      </Topo>
      <p className="muted">Poucos números, revisados todo mês. Meta em branco aparece "—" até a Direção definir. O resumo de parcerias fechadas vai para a Direção todo dia 1.</p>
      {ind.erro && <div className="aviso perigo">{ind.erro}</div>}
      {!i ? <p className="muted">Carregando…</p> : (
        <>
          {linhas(i).map((b) => (
            <section key={b.titulo} className="pilha">
              <h2>{b.titulo}</h2>
              <div className="tabela-rolagem">
                <table>
                  <thead><tr><th>Indicador</th><th>No mês</th><th>Meta</th><th>O que mostra</th></tr></thead>
                  <tbody>
                    {b.itens.map((l) => {
                      const meta = metas.dado?.[l.id]
                      const c = comparaMeta(l.valor, meta, l.menorEhMelhor)
                      return (
                        <tr key={l.id}>
                          <td>{l.rotulo}</td>
                          <td className="num"><b style={{ color: 'var(--ink)', fontWeight: 600 }}>{l.mostra}</b></td>
                          <td className="num">
                            {editando === l.id ? (
                              <span className="linha"><input className="entrada num" style={{ width: 90 }} autoFocus value={valorMeta} onChange={(e) => setValorMeta(e.target.value)} /><button className="botao leve" onClick={() => void gravarMeta(l.id)}>Salvar</button></span>
                            ) : (
                              <span className="linha">
                                <span className={`pill ${tomMeta[c]}`}>{meta === undefined ? '—' : `${meta.toLocaleString('pt-BR')}${l.sufixoMeta ?? ''}`}</span>
                                {podeMeta && <button className="botao leve" onClick={() => { setEditando(l.id); setValorMeta(meta === undefined ? '' : String(meta)) }}>Editar</button>}
                              </span>
                            )}
                          </td>
                          <td className="muted pequeno">{l.ajuda}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
          <section className="pilha">
            <h2>Parcerias ativas por padrão</h2>
            <div className="numeros">
              {(['bronze', 'prata', 'ouro', 'master'] as Padrao[]).map((p) => (
                <div key={p} className="numero"><small><PadraoTag padrao={p} /></small><b>{i.ativas_por_padrao[p] ?? 0}</b></div>
              ))}
            </div>
          </section>
          <section className="pilha">
            <h2>Parcerias fechadas no mês</h2>
            {i.fechadas.length === 0 ? <div className="vazio">Nenhuma parceria fechada neste mês.</div> : (
              <div className="tabela-rolagem">
                <table>
                  <thead><tr><th>Marca</th><th>Padrão</th><th>Valor</th><th>Vigência</th></tr></thead>
                  <tbody>{i.fechadas.map((f) => (
                    <tr key={f.marca + f.inicio}><td>{f.marca}</td><td><PadraoTag padrao={f.padrao as Padrao | null} /></td><td className="num">{f.troca ? 'troca de serviços' : formatarDinheiro(f.valor_centavos)}</td><td className="num">{formatarData(f.inicio)} a {formatarData(f.fim)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  )
}
