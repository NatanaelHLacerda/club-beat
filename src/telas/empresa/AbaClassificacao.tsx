import { useEffect, useMemo, useState } from 'react'
import { PadraoTag } from '../../componentes/Rotulos'
import { concluirTriagem2, conferirConflito, encerrarComA5, lerPontuacao, listarModelos, salvarClassificacao } from '../../dados/api'
import { faixasFaturamento } from '../../dados/campos'
import { rotuloPorte, type Conflito, type FichaClassificacao } from '../../dados/tipos'
import {
  avaliarAderencia, classificarPorte, configPontuacaoPadrao, criteriosAderencia, faixasDePontos, padraoFinal, pontosSugeridos,
  rotuloFaixaInvestimento, textosClassificacao,
  type CriterioPontos, type FaixaInvestimento, type RespostaAderencia,
} from '../../regras/classificacao'
import { formatarData, formatarDataHora } from '../../regras/formato'
import { preencherModelo } from '../../regras/mensagens'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'
import { ResumoTriagem1 } from './ResumoTriagem1'
import type { PropsAba } from './Ficha'

const rotuloResposta: Record<RespostaAderencia, string> = { sim: 'Sim', em_parte: 'Em parte', nao: 'Não' }

export function AbaClassificacao({ empresa, atualizar }: PropsAba) {
  const { perfil } = useSessao()
  const modelos = useConsulta(listarModelos)
  const pontuacao = useConsulta(lerPontuacao)
  const config = pontuacao.dado ?? configPontuacaoPadrao
  const [ficha, setFicha] = useState<FichaClassificacao>(() => {
    const salva = empresa.classificacao ?? {}
    const porte = classificarPorte({ faturamento: empresa.faixa_faturamento, funcionarios: empresa.faixa_funcionarios, receitaPorte: empresa.receita_porte }).porte
    return { ...salva, pontos: { ...pontosSugeridos(porte, salva.faixa_investimento ?? null, empresa.duracao), ...salva.pontos } }
  })
  const [estudo, setEstudo] = useState(empresa.estudo ?? '')
  const [master, setMaster] = useState(empresa.candidata_master)
  const [conflito, setConflito] = useState<Conflito | null>(null)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const editavel = pode(perfil, 'triar') && empresa.etapa === 'triagem2' && !empresa.triagem2_concluida_em

  const porte = useMemo(() => classificarPorte({
    faturamento: empresa.faixa_faturamento, funcionarios: empresa.faixa_funcionarios, industria: ficha.industria,
    receitaPorte: empresa.receita_porte, grupoFaixa: ficha.grupo ? ficha.grupo_faixa : null,
  }), [empresa, ficha.industria, ficha.grupo, ficha.grupo_faixa])
  const aderencia = avaliarAderencia(ficha.aderencia ?? {})
  const padrao = padraoFinal(ficha.pontos ?? {}, ficha.faixa_investimento ?? null, config)

  useEffect(() => {
    if (!empresa.categoria) return
    let vivo = true
    conferirConflito(empresa.categoria, empresa.id).then((c) => { if (vivo) setConflito(c) }, () => {})
    return () => { vivo = false }
  }, [empresa.categoria, empresa.id])

  // Porte e faixa alimentam os pontos de porte e investimento.
  function mudarFicha(nova: FichaClassificacao) {
    setFicha(nova); setErro(''); setAviso('')
  }
  function mudarFaixa(f: FaixaInvestimento | null) {
    const sugestao = pontosSugeridos(porte.porte, f, null)
    mudarFicha({ ...ficha, faixa_investimento: f, pontos: { ...ficha.pontos, investimento: sugestao.investimento } })
  }

  const dadosParaSalvar = (): FichaClassificacao => ({
    ...ficha, nota_porte: porte.nota, provisorio: porte.provisorio,
    pontos: { ...ficha.pontos, ...(porte.porte ? { porte: pontosSugeridos(porte.porte, null, null).porte } : {}) },
  })

  async function salvar(concluir: boolean) {
    setErro(''); setAviso('')
    try {
      await salvarClassificacao(empresa.id, dadosParaSalvar(), porte.porte, padrao.final, estudo, master)
      if (concluir) await concluirTriagem2(empresa.id)
      setAviso(concluir ? 'Triagem 2 concluída.' : 'Classificação salva.')
      await atualizar()
    } catch (e) { setErro((e as Error).message) }
  }

  async function encerrar() {
    const modelo = modelos.dado?.find((m) => m.codigo === 'A5')
    if (!modelo) return
    try {
      await encerrarComA5(empresa.id, preencherModelo(modelo.texto, { nome: empresa.contato_nome, empresa: empresa.marca }), 'Não combina com o membro (aderência)')
      await atualizar()
    } catch (e) { setErro((e as Error).message) }
  }

  const pontosPorte = porte.porte ? pontosSugeridos(porte.porte, null, null).porte : undefined
  return (
    <div className="pilha">
      {empresa.triagem2_concluida_em && <div className="aviso">Triagem 2 concluída em {formatarDataHora(empresa.triagem2_concluida_em)}.</div>}
      {!editavel && !empresa.triagem2_concluida_em && <div className="aviso">A classificação é feita com a empresa em Triagem 2.</div>}
      {conflito && <div className="aviso perigo" role="alert">Conflito de exclusividade com {conflito.marca} até {formatarData(conflito.fim)}.</div>}

      <ResumoTriagem1 empresa={empresa} />

      <div className="grade-2">
        <section className="cartao">
          <h3>Porte</h3>
          <p className="muted pequeno">Faturamento: {empresa.faixa_faturamento ?? '—'} · Funcionários: {empresa.faixa_funcionarios ?? '—'} · Receita: {empresa.receita_porte ?? '—'}</p>
          <label className="marcar"><input type="checkbox" disabled={!editavel} checked={Boolean(ficha.industria)} onChange={(e) => mudarFicha({ ...ficha, industria: e.target.checked })} /><span>É indústria (muda a régua de funcionários)</span></label>
          <label className="marcar"><input type="checkbox" disabled={!editavel} checked={Boolean(ficha.grupo)} onChange={(e) => mudarFicha({ ...ficha, grupo: e.target.checked })} /><span>Faz parte de grupo ou rede (franquia, filial)</span></label>
          {ficha.grupo && (
            <label className="campo"><span>Faturamento do grupo</span>
              <select id="c-grupo-faixa" disabled={!editavel} value={ficha.grupo_faixa ?? ''} onChange={(e) => mudarFicha({ ...ficha, grupo_faixa: e.target.value || null })}>
                <option value="">Escolha uma faixa</option>
                {faixasFaturamento.filter((f) => f !== 'prefiro informar na reunião').map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
          )}
          <p><b style={{ color: 'var(--ink)' }}>{porte.porte ? rotuloPorte[porte.porte] : '—'}</b>{porte.provisorio && <span className="pill alerta" style={{ marginLeft: 8 }}>provisório</span>}</p>
          {porte.nota && <p className="muted pequeno">{porte.nota}</p>}
        </section>

        <section className="cartao">
          <h3>Aderência ao membro</h3>
          {criteriosAderencia.map((c) => (
            <div key={c.id} className="pilha" style={{ gap: 4 }}>
              <span title={c.pergunta}>{c.rotulo}</span>
              <div className="linha" role="radiogroup" aria-label={c.rotulo}>
                {(Object.keys(rotuloResposta) as RespostaAderencia[]).map((r) => (
                  <label key={r} className="marcar">
                    <input type="radio" name={`ad-${c.id}`} disabled={!editavel} checked={ficha.aderencia?.[c.id] === r}
                      onChange={() => mudarFicha({ ...ficha, aderencia: { ...ficha.aderencia, [c.id]: r } })} />
                    <span>{rotuloResposta[r]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {aderencia.reprovada && (
            <div className="aviso perigo" role="alert">
              {textosClassificacao.reprovada}
              {editavel && <div style={{ marginTop: 8 }}><button className="botao perigo" onClick={() => void encerrar()}>Encerrar com A5</button></div>}
            </div>
          )}
        </section>
      </div>

      <section className="cartao">
        <div className="linha entre">
          <h3>Ficha de pontos</h3>
          <label className="campo" style={{ minWidth: 220 }}><span>Faixa de investimento que a empresa aceita</span>
            <select id="c-faixa" disabled={!editavel} value={ficha.faixa_investimento ?? ''} onChange={(e) => mudarFaixa((e.target.value || null) as FaixaInvestimento | null)}>
              <option value="">Escolha</option>
              {(['bronze', 'prata', 'ouro'] as const).map((f) => <option key={f} value={f}>{rotuloFaixaInvestimento(f, config.investimento)}</option>)}
            </select>
          </label>
        </div>
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Critério</th><th>Opção 1</th><th>Opção 2</th><th>Opção 3</th></tr></thead>
            <tbody>
              {config.criterios.map((c) => {
                const fixo = c.id === 'porte'
                const valor = fixo ? pontosPorte : ficha.pontos?.[c.id]
                return (
                  <tr key={c.id}>
                    <td>{c.rotulo}{fixo && <small className="muted"> (do porte)</small>}</td>
                    {c.opcoes.map((o, i) => (
                      <td key={o.rotulo}>
                        <label className="marcar">
                          <input type="radio" name={`pt-${c.id}`} disabled={!editavel || fixo} checked={valor === i + 1}
                            onChange={() => mudarFicha({ ...ficha, pontos: { ...ficha.pontos, [c.id as CriterioPontos]: (i + 1) as 1 | 2 | 3 } })} />
                          <span className="pequeno">{o.rotulo} <small className="muted">({o.pontos} {o.pontos === 1 ? 'ponto' : 'pontos'})</small></span>
                        </label>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="muted pequeno">{faixasDePontos(config).map((f) => `${f.padrao[0].toUpperCase()}${f.padrao.slice(1)} ${f.de} a ${f.ate}`).join(' · ')}</p>
        <div className="numeros">
          <div className="numero"><small>Soma</small><b>{padrao.pontos || '—'}</b></div>
          <div className="numero"><small>Padrão pelos pontos</small><b><PadraoTag padrao={padrao.porPontos} /></b></div>
          <div className="numero"><small>Padrão final</small><b><PadraoTag padrao={padrao.final} /></b>{padrao.limitadoPeloInvestimento && <small className="muted">{textosClassificacao.limitado}</small>}</div>
        </div>
        <label className="marcar"><input type="checkbox" disabled={!editavel} checked={master} onChange={(e) => setMaster(e.target.checked)} /><span>Candidata a Master (marca consolidada, maior investimento, longo prazo)</span></label>
        {master && <p className="muted pequeno">{textosClassificacao.master}</p>}
      </section>

      <section className="cartao">
        <h3>Estudo da empresa</h3>
        <p className="muted pequeno">6 a 8 linhas: quem é a marca, o que busca, por que combina com o Club e o que faz sentido oferecer agora. É a base da frase "fizemos um estudo da sua empresa".</p>
        <textarea id="c-estudo" className="entrada" style={{ minHeight: 150 }} disabled={!editavel} value={estudo} onChange={(e) => setEstudo(e.target.value)} />
      </section>

      {erro && <div className="aviso perigo" role="alert">{erro}</div>}
      {aviso && <div className="aviso" role="status">{aviso}</div>}
      {editavel && (
        <div className="linha">
          <button className="botao" onClick={() => void salvar(false)}>Salvar</button>
          <button className="botao primario" disabled={aderencia.reprovada || Boolean(conflito)} onClick={() => void salvar(true)}>Concluir triagem 2</button>
        </div>
      )}
    </div>
  )
}
