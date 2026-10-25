import { useState } from 'react'
import { nomeDe } from '../../componentes/Filtros'
import { PadraoTag } from '../../componentes/Rotulos'
import { decidirDirecao, listarCardapio, listarDatasDaEmpresa, vagaMasterOcupada } from '../../dados/api'
import { rotuloPorte } from '../../dados/tipos'
import { prazoVencido, rotuloDecisao, textosDirecao, type Decisao } from '../../regras/direcao'
import { formatarData, formatarDataHora, formatarDinheiro, hojeISO } from '../../regras/formato'
import { itensDoPadrao, rotuloTipoParceria } from '../../regras/proposta'
import { rotuloEtapa } from '../../regras/etapas'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'
import type { PropsAba } from './Ficha'

// Resumo de decisão de 1 página (cap. 4, passo 9) e decisão da Direção.
export function AbaDirecao({ empresa, usuarios, atualizar }: PropsAba) {
  const { perfil } = useSessao()
  const cardapio = useConsulta(listarCardapio)
  const datas = useConsulta(() => listarDatasDaEmpresa(empresa.id), [empresa.id])
  const vaga = useConsulta(() => vagaMasterOcupada(empresa.id), [empresa.id])
  const [decisao, setDecisao] = useState<Decisao>('aprovar')
  const [motivo, setMotivo] = useState('')
  const [master, setMaster] = useState(false)
  const [destino, setDestino] = useState<'espera' | 'recusada'>('recusada')
  const [retomar, setRetomar] = useState('')
  const [erro, setErro] = useState('')
  const d = empresa.direcao ?? {}
  const p = empresa.proposta ?? {}
  const podeDecidir = pode(perfil, 'decidir_direcao') && empresa.etapa === 'direcao'
  const rotulo = (item: string) => itensDoPadrao(cardapio.dado ?? [], empresa.padrao_final).find((c) => c.item === item)?.rotulo ?? item

  async function decidir() {
    setErro('')
    if (!motivo.trim()) { setErro(textosDirecao.semMotivo); return }
    if (decisao === 'aprovar' && master && vaga.dado) { setErro(textosDirecao.vagaOcupada); return }
    try { await decidirDirecao(empresa.id, decisao, motivo, master, destino, retomar || null); await atualizar() } catch (e) { setErro((e as Error).message) }
  }

  if (!d.levada_em) return <div className="vazio">Este caso ainda não foi levado à Direção.</div>

  return (
    <div className="pilha">
      <section className="cartao resumo">
        <div className="linha entre">
          <h3>Resumo de decisão · {empresa.marca}</h3>
          <span className={`pill ${prazoVencido(d.prazo, hojeISO()) && !d.decidida_em ? 'perigo' : ''}`}>Resposta até {formatarData(d.prazo)}</span>
        </div>
        <dl className="grade-2" style={{ margin: 0 }}>
          <div><dt className="muted pequeno">Padrão</dt><dd><PadraoTag padrao={empresa.padrao_final} />{empresa.candidata_master && ' · candidata a Master'}{vaga.dado ? ' · vaga de Master ocupada' : ''}</dd></div>
          <div><dt className="muted pequeno">Porte e categoria</dt><dd>{empresa.porte ? rotuloPorte[empresa.porte] : '—'} · {empresa.categoria ?? '—'}</dd></div>
          <div><dt className="muted pequeno">Valor</dt><dd>{p.troca ? 'Troca de serviços' : `${formatarDinheiro(p.valor_mensal_centavos ?? null)} por mês`} · {p.prazo_meses ? `${p.prazo_meses} meses` : 'prazo —'}</dd></div>
          <div><dt className="muted pequeno">Tipo</dt><dd>{empresa.tipo_parceria ? rotuloTipoParceria[empresa.tipo_parceria] : '—'}</dd></div>
          <div><dt className="muted pequeno">Contrapartidas</dt><dd>{(p.itens ?? []).map((i) => `${rotulo(i.item)}${i.quantidade > 1 ? ` × ${i.quantidade}` : ''}`).join(', ') || '—'}</dd></div>
          <div><dt className="muted pequeno">Datas</dt><dd>{(datas.dado ?? []).map((x) => `${formatarData(x.data)} (${x.tipo}, ${x.situacao})`).join(', ') || '—'}</dd></div>
          <div><dt className="muted pequeno">Riscos e motivos</dt><dd>{(d.motivos ?? []).join(', ')}{p.fora_do_cardapio ? ` · fora do cardápio: ${p.fora_do_cardapio}` : ''}{p.exclusividade_categoria ? ` · exclusividade em ${p.exclusividade_categoria}` : ''}{p.justificativa ? ` · ${p.justificativa}` : ''}</dd></div>
          <div><dt className="muted pequeno">Recomendação de {nomeDe(usuarios, d.levada_por ?? null)}</dt><dd>{d.recomendacao}</dd></div>
        </dl>
      </section>

      {d.decidida_em && (
        <div className="aviso">
          {rotuloDecisao[d.decisao!]} por {nomeDe(usuarios, d.decidida_por ?? null)} em {formatarDataHora(d.decidida_em)}: {d.motivo}
          {d.como_master && ' · padrão Master'}{d.fila_master && ' · entra como Ouro na fila do Master'}
        </div>
      )}

      {podeDecidir && (
        <section className="cartao">
          <h3>Decisão</h3>
          <div className="linha" role="radiogroup" aria-label="Decisão">
            {(Object.keys(rotuloDecisao) as Decisao[]).map((k) => (
              <label key={k} className="marcar"><input type="radio" name="decisao" checked={decisao === k} onChange={() => setDecisao(k)} /><span>{rotuloDecisao[k]}</span></label>
            ))}
          </div>
          {decisao === 'aprovar' && (empresa.candidata_master || empresa.padrao_final === 'master') && (
            <label className="marcar"><input type="checkbox" checked={master} onChange={(e) => setMaster(e.target.checked)} /><span>Aprovar como Master {vaga.dado ? '(vaga ocupada: entrará como Ouro na fila)' : '(vaga livre)'}</span></label>
          )}
          {decisao === 'recusar' && (
            <div className="grade-2">
              <label className="campo"><span>Para onde vai</span>
                <select value={destino} onChange={(e) => setDestino(e.target.value as 'espera' | 'recusada')}>
                  <option value="recusada">{rotuloEtapa.recusada}</option>
                  <option value="espera">{rotuloEtapa.espera}</option>
                </select>
              </label>
              {destino === 'espera' && <label className="campo"><span>Retomar em</span><input type="date" value={retomar} onChange={(e) => setRetomar(e.target.value)} /></label>}
            </div>
          )}
          <label className="campo"><span>{decisao === 'ajustar' ? 'O que mudar' : 'Motivo'} <b>*</b></span><textarea id="d-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} /></label>
          {erro && <p className="erro" role="alert">{erro}</p>}
          <div><button className="botao primario" onClick={() => void decidir()}>Registrar decisão</button></div>
        </section>
      )}
    </div>
  )
}
