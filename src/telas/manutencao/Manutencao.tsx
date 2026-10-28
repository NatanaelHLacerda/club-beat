import { useState } from 'react'
import { SemAcesso, Topo } from '../../componentes/Casca'
import { lerPontuacao, salvarPontuacao } from '../../dados/api'
import {
  configPontuacaoPadrao, faixasDePontos, limitePontosPorOpcao, pontuacaoMaxima, validarConfigPontuacao, type ConfigPontuacao,
} from '../../regras/classificacao'
import { centavosParaReais, reaisParaCentavos } from '../../regras/formato'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

// REQ-041 — Manutenção / Configurações: nada da pontuação fica fixo no código.
export function Manutencao() {
  const { perfil } = useSessao()
  const config = useConsulta(lerPontuacao)
  if (!pode(perfil, 'manter_sistema')) return <SemAcesso />
  return (
    <>
      <Topo eyebrow="Sistema" titulo="Manutenção" acento="e configurações" />
      {config.erro && <div className="aviso perigo">{config.erro}</div>}
      {config.dado && <Pontuacao key={JSON.stringify(config.dado)} inicial={config.dado} aoSalvar={config.recarregar} />}
    </>
  )
}

function Pontuacao({ inicial, aoSalvar }: { inicial: ConfigPontuacao; aoSalvar: () => Promise<void> }) {
  const [c, setC] = useState<ConfigPontuacao>(inicial)
  // Os campos de valor ficam como texto até salvar (o usuário digita "5.000,00").
  const [texto, setTexto] = useState(() => textoInvest(inicial))
  const [msg, setMsg] = useState('')
  const [erros, setErros] = useState<string[]>([])

  const mudou = JSON.stringify(c) !== JSON.stringify(inicial) || JSON.stringify(texto) !== JSON.stringify(textoInvest(inicial))

  function opcao(ci: number, oi: number, campo: 'rotulo' | 'pontos', valor: string) {
    setC({ ...c, criterios: c.criterios.map((cr, i) => i !== ci ? cr : {
      ...cr, opcoes: cr.opcoes.map((o, j) => j !== oi ? o : { ...o, [campo]: campo === 'pontos' ? (valor === '' ? NaN : Number(valor)) : valor }),
    }) })
  }

  async function salvar() {
    setMsg('')
    const centavos = (v: string) => reaisParaCentavos(v)
    const lidos = { bronze_de: centavos(texto.bronze_de), bronze_ate: centavos(texto.bronze_ate), prata_de: centavos(texto.prata_de), prata_ate: centavos(texto.prata_ate), ouro_de: centavos(texto.ouro_de) }
    if (Object.values(lidos).some((v) => v === undefined)) { setErros(['Digite os valores em reais, como 5.000,00.']); return }
    const nova: ConfigPontuacao = {
      ...c,
      investimento: {
        bronze: { de: lidos.bronze_de ?? null, ate: lidos.bronze_ate ?? null },
        prata: { de: lidos.prata_de ?? null, ate: lidos.prata_ate ?? null },
        ouro: { de: lidos.ouro_de ?? null },
      },
    }
    const problemas = validarConfigPontuacao(nova)
    setErros(problemas)
    if (problemas.length) return
    try { await salvarPontuacao(nova); setMsg('Configuração salva. Vale para as próximas classificações.'); await aoSalvar() } catch (e) { setMsg((e as Error).message) }
  }

  const maximo = c.criterios.every((cr) => cr.opcoes.every((o) => Number.isInteger(o.pontos))) ? pontuacaoMaxima(c.criterios) : null
  const faixas = maximo !== null ? faixasDePontos(c) : []
  const num = (v: number) => (Number.isNaN(v) ? '' : v)

  return (
    <section className="pilha">
      <h2>Pontuação da Triagem 2</h2>
      <p className="muted">Mudanças valem para as próximas classificações. Empresas já classificadas mantêm o padrão calculado na época.</p>

      <div className="cartao pilha">
        <h3>Faixas de padrão (pontos)</h3>
        <div className="linha">
          <label className="campo"><span>Pontuação mínima (abaixo disso, sem padrão)</span>
            <input type="number" min={0} value={num(c.cortes.minimo)} onChange={(e) => setC({ ...c, cortes: { ...c.cortes, minimo: e.target.valueAsNumber } })} /></label>
          <label className="campo"><span>Bronze vai até</span>
            <input type="number" min={0} value={num(c.cortes.bronze_ate)} onChange={(e) => setC({ ...c, cortes: { ...c.cortes, bronze_ate: e.target.valueAsNumber } })} /></label>
          <label className="campo"><span>Prata vai até</span>
            <input type="number" min={0} value={num(c.cortes.prata_ate)} onChange={(e) => setC({ ...c, cortes: { ...c.cortes, prata_ate: e.target.valueAsNumber } })} /></label>
        </div>
        <p className="muted pequeno">{faixas.length ? faixas.map((f) => `${f.padrao[0].toUpperCase()}${f.padrao.slice(1)}: ${f.de} a ${f.ate}`).join(' · ') + ` (máximo ${maximo})` : 'Preencha todos os pontos para ver as faixas.'}</p>
      </div>

      <div className="cartao pilha">
        <h3>Critérios, notas e pontos</h3>
        <p className="muted pequeno">Cada critério tem três opções; cada opção vale de 0 a {limitePontosPorOpcao} pontos, sempre crescendo.</p>
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Critério</th><th>Opção 1</th><th>Opção 2</th><th>Opção 3</th></tr></thead>
            <tbody>
              {c.criterios.map((cr, ci) => (
                <tr key={cr.id}>
                  <td><input aria-label={`Nome do critério ${cr.id}`} value={cr.rotulo} onChange={(e) => setC({ ...c, criterios: c.criterios.map((x, i) => i === ci ? { ...x, rotulo: e.target.value } : x) })} /></td>
                  {cr.opcoes.map((o, oi) => (
                    <td key={oi}>
                      <div className="pilha" style={{ gap: 4 }}>
                        <input aria-label={`${cr.rotulo}, descrição da opção ${oi + 1}`} value={o.rotulo} onChange={(e) => opcao(ci, oi, 'rotulo', e.target.value)} />
                        <label className="marcar"><span className="pequeno">Pontos</span>
                          <input type="number" min={0} max={limitePontosPorOpcao} style={{ width: 70 }} aria-label={`${cr.rotulo}, pontos da opção ${oi + 1}`} value={num(o.pontos)} onChange={(e) => opcao(ci, oi, 'pontos', e.target.value)} /></label>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cartao pilha">
        <h3>Faixas de investimento (R$)</h3>
        <p className="muted pequeno">Deixe em branco o que ainda não foi definido: aparece “R$ …” na ficha.</p>
        <div className="linha">
          <Valor rotulo="Bronze, de" v={texto.bronze_de} f={(v) => setTexto({ ...texto, bronze_de: v })} />
          <Valor rotulo="Bronze, até" v={texto.bronze_ate} f={(v) => setTexto({ ...texto, bronze_ate: v })} />
          <Valor rotulo="Prata, de" v={texto.prata_de} f={(v) => setTexto({ ...texto, prata_de: v })} />
          <Valor rotulo="Prata, até" v={texto.prata_ate} f={(v) => setTexto({ ...texto, prata_ate: v })} />
          <Valor rotulo="Ouro, a partir de" v={texto.ouro_de} f={(v) => setTexto({ ...texto, ouro_de: v })} />
        </div>
      </div>

      {erros.length > 0 && <div className="aviso perigo" role="alert"><ul>{erros.map((e) => <li key={e}>{e}</li>)}</ul></div>}
      {msg && <div className="aviso" role="status">{msg}</div>}
      <div className="linha">
        <button className="botao primario" disabled={!mudou} onClick={() => void salvar()}>Salvar</button>
        <button className="botao" onClick={() => { setC(configPontuacaoPadrao); setTexto(textoInvest(configPontuacaoPadrao)); setErros([]); setMsg('Valores de fábrica carregados: salve para aplicar.') }}>Voltar ao padrão de fábrica</button>
      </div>
    </section>
  )
}

function Valor({ rotulo, v, f }: { rotulo: string; v: string; f: (v: string) => void }) {
  return <label className="campo"><span>{rotulo}</span><input inputMode="decimal" placeholder="R$ …" value={v} onChange={(e) => f(e.target.value)} /></label>
}

function textoInvest(c: ConfigPontuacao) {
  return {
    bronze_de: centavosParaReais(c.investimento.bronze.de), bronze_ate: centavosParaReais(c.investimento.bronze.ate),
    prata_de: centavosParaReais(c.investimento.prata.de), prata_ate: centavosParaReais(c.investimento.prata.ate),
    ouro_de: centavosParaReais(c.investimento.ouro.de),
  }
}
