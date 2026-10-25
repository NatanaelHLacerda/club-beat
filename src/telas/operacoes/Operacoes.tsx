import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SemAcesso, Topo } from '../../componentes/Casca'
import { PadraoTag } from '../../componentes/Rotulos'
import { confirmarOperacoes, listarCardapio, listarParaOperacoes } from '../../dados/api'
import type { Empresa } from '../../dados/tipos'
import { formatarDataHora } from '../../regras/formato'
import { itensDoPadrao, rotuloFormato, type ConfirmacaoOperacoes, type ItemCardapio } from '../../regras/proposta'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

export function Operacoes() {
  const { perfil } = useSessao()
  const lista = useConsulta(listarParaOperacoes)
  const cardapio = useConsulta(listarCardapio)
  if (!pode(perfil, 'ver_operacoes')) return (<><Topo titulo="Operações" /><SemAcesso /></>)
  const pendentes = (lista.dado ?? []).filter((e) => (e.proposta?.itens ?? []).length > 0)
  return (
    <>
      <Topo eyebrow="Viabilidade" titulo="Operações"><span className="muted num">{pendentes.filter((e) => !e.operacoes?.confirmada_em).length} aguardando</span></Topo>
      <p className="muted">Nenhuma entrega é prometida sem a confirmação de Operações: capacidade, equipe, espaço e horário, e custo interno.</p>
      {lista.erro && <div className="aviso perigo">{lista.erro}</div>}
      {pendentes.length === 0 ? <div className="vazio">Nenhuma proposta em montagem.</div> : pendentes.map((e) => (
        <Confirmacao key={e.id} e={e} cardapio={cardapio.dado ?? []} podeConfirmar={pode(perfil, 'operacoes')} aoSalvar={lista.recarregar} />
      ))}
    </>
  )
}

function Confirmacao({ e, cardapio, podeConfirmar, aoSalvar }: { e: Empresa; cardapio: ItemCardapio[]; podeConfirmar: boolean; aoSalvar: () => Promise<void> }) {
  const [c, setC] = useState<ConfirmacaoOperacoes>({ capacidade: false, equipe: false, espaco_horario: false })
  const [custo, setCusto] = useState('')
  const [erro, setErro] = useState('')
  const rotulo = (item: string) => itensDoPadrao(cardapio, e.padrao_final).find((i) => i.item === item)?.rotulo ?? item

  async function confirmar() {
    setErro('')
    const centavos = custo.trim() ? Math.round(Number(custo.replace(/\./g, '').replace(',', '.')) * 100) : null
    try { await confirmarOperacoes(e.id, { ...c, custo_centavos: Number.isFinite(centavos) ? centavos : null }); await aoSalvar() } catch (err) { setErro((err as Error).message) }
  }

  return (
    <section className="cartao">
      <div className="linha entre">
        <h3><Link to={`/empresas/${e.id}`}>{e.marca}</Link> <PadraoTag padrao={e.padrao_final} /></h3>
        {e.operacoes?.confirmada_em ? <span className="pill ok">Confirmada em {formatarDataHora(e.operacoes.confirmada_em)}</span> : <span className="pill alerta">Aguardando</span>}
      </div>
      <p className="muted pequeno">{e.formato ? rotuloFormato[e.formato] : 'Formato a definir'} · {(e.proposta?.itens ?? []).map((i) => `${rotulo(i.item)}${i.quantidade > 1 ? ` × ${i.quantidade}` : ''}`).join(', ')}</p>
      {e.proposta?.fora_do_cardapio && <p className="pequeno">Fora do cardápio: {e.proposta.fora_do_cardapio}</p>}
      {podeConfirmar && !e.operacoes?.confirmada_em && (
        <>
          <div className="linha">
            {([['capacidade', 'Capacidade e número de participantes'], ['equipe', 'Equipe'], ['espaco_horario', 'Espaço e horário']] as const).map(([k, r]) => (
              <label key={k} className="marcar"><input type="checkbox" checked={Boolean(c[k])} onChange={(ev) => setC({ ...c, [k]: ev.target.checked })} /><span>{r}</span></label>
            ))}
          </div>
          <div className="grade-2">
            <label className="campo"><span>Custo interno estimado (R$)</span><input inputMode="decimal" value={custo} onChange={(ev) => setCusto(ev.target.value)} placeholder="água, toalhas, limpeza, equipe, espaço" /></label>
            <label className="campo"><span>Observação</span><input value={c.observacao ?? ''} onChange={(ev) => setC({ ...c, observacao: ev.target.value })} /></label>
          </div>
          {erro && <p className="erro" role="alert">{erro}</p>}
          <div><button className="botao primario" onClick={() => void confirmar()}>Confirmar viabilidade</button></div>
        </>
      )}
    </section>
  )
}
