import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SemAcesso, Topo } from '../../componentes/Casca'
import { NomeEmpresa, PadraoTag } from '../../componentes/Rotulos'
import { Carregando, CartaoNumero, DataComIcone, PainelLateral, Pill, Tabela } from '../../componentes/ui'
import { confirmarOperacoes, listarCardapio, listarParaOperacoes } from '../../dados/api'
import type { Empresa } from '../../dados/tipos'
import { formatarData, formatarDinheiro } from '../../regras/formato'
import { itensDoPadrao, rotuloFormato, type ConfirmacaoOperacoes, type ItemCardapio } from '../../regras/proposta'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

export function Operacoes() {
  const { perfil } = useSessao()
  const navegar = useNavigate()
  const lista = useConsulta(listarParaOperacoes)
  const cardapio = useConsulta(listarCardapio)
  const [aberta, setAberta] = useState<Empresa | null>(null)
  if (!pode(perfil, 'ver_operacoes')) return (<><Topo titulo="Operações" /><SemAcesso /></>)
  const propostas = (lista.dado ?? []).filter((e) => (e.proposta?.itens ?? []).length > 0)
  const aguardando = propostas.filter((e) => !e.operacoes?.confirmada_em)
  const rotulo = (e: Empresa, item: string) => itensDoPadrao(cardapio.dado ?? [], e.padrao_final).find((i) => i.item === item)?.rotulo ?? item

  return (
    <>
      <Topo eyebrow="Viabilidade" titulo="Operações" />
      <div className="numeros">
        <CartaoNumero rotulo="Aguardando confirmação" icone="operacoes" valor={lista.dado ? aguardando.length : '—'} />
        <CartaoNumero rotulo="Confirmadas" icone="check" valor={lista.dado ? propostas.length - aguardando.length : '—'} />
      </div>
      <p className="muted pequeno">Nenhuma entrega é prometida sem a confirmação de Operações: capacidade, equipe, espaço e horário, e custo interno.</p>
      {lista.erro && <div className="aviso perigo">{lista.erro}</div>}
      {lista.carregando && !lista.dado ? <Carregando /> : (
        <Tabela<Empresa> itens={propostas} chave={(e) => e.id} vazio="Nenhuma proposta em montagem."
          aoAbrir={(e) => setAberta(e)} destaque={(e) => (!e.operacoes?.confirmada_em ? 'alerta' : null)}
          colunas={[
            { titulo: 'Empresa', render: (e) => <NomeEmpresa marca={e.marca} exemplo={e.exemplo} /> },
            { titulo: 'Padrão', render: (e) => <PadraoTag padrao={e.padrao_final} /> },
            { titulo: 'Contrapartidas', quebra: true, render: (e) => <span className="pequeno">{(e.proposta?.itens ?? []).map((i) => `${rotulo(e, i.item)}${i.quantidade > 1 ? ` × ${i.quantidade}` : ''}`).join(', ')}</span> },
            { titulo: 'Formato', render: (e) => (e.formato ? rotuloFormato[e.formato] : <span className="muted">—</span>) },
            { titulo: 'Situação', render: (e) => (e.operacoes?.confirmada_em ? <Pill tom="ok">Confirmada</Pill> : <Pill tom="alerta">Aguardando</Pill>) },
            { titulo: 'Desde', render: (e) => <DataComIcone texto={formatarData(e.etapa_desde)} /> },
          ]}
          acoes={[
            { rotulo: 'Confirmar viabilidade', icone: 'check', mostrar: (e) => !e.operacoes?.confirmada_em && pode(perfil, 'operacoes'), aoClicar: (e) => setAberta(e) },
            { rotulo: 'Abrir empresa', icone: 'ver', aoClicar: (e) => navegar(`/empresas/${e.id}`) },
          ]} />
      )}
      {aberta && (
        <PainelLateral titulo={`Viabilidade · ${aberta.marca}`} aoFechar={() => setAberta(null)}>
          <Confirmacao e={aberta} cardapio={cardapio.dado ?? []} podeConfirmar={pode(perfil, 'operacoes')}
            aoSalvar={async () => { setAberta(null); await lista.recarregar() }} />
        </PainelLateral>
      )}
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
    <div className="pilha">
      <p className="pequeno">{e.formato ? rotuloFormato[e.formato] : 'Formato a definir'} · {(e.proposta?.itens ?? []).map((i) => `${rotulo(i.item)}${i.quantidade > 1 ? ` × ${i.quantidade}` : ''}`).join(', ')}</p>
      {e.proposta?.fora_do_cardapio && <p className="pequeno">Fora do cardápio: {e.proposta.fora_do_cardapio}</p>}
      {e.operacoes?.confirmada_em ? (
        <p className="ok">Confirmada{e.operacoes.custo_centavos ? ` · custo interno ${formatarDinheiro(e.operacoes.custo_centavos)}` : ''}.</p>
      ) : podeConfirmar ? (
        <>
          {([['capacidade', 'Capacidade e número de participantes'], ['equipe', 'Equipe'], ['espaco_horario', 'Espaço e horário']] as const).map(([k, r]) => (
            <label key={k} className="marcar"><input type="checkbox" checked={Boolean(c[k])} onChange={(ev) => setC({ ...c, [k]: ev.target.checked })} /><span>{r}</span></label>
          ))}
          <label className="campo"><span>Custo interno estimado (R$)</span><input inputMode="decimal" value={custo} onChange={(ev) => setCusto(ev.target.value)} placeholder="água, toalhas, limpeza, equipe, espaço" /></label>
          <label className="campo"><span>Observação</span><input value={c.observacao ?? ''} onChange={(ev) => setC({ ...c, observacao: ev.target.value })} /></label>
          {erro && <p className="erro" role="alert">{erro}</p>}
          <div><button className="botao primario" onClick={() => void confirmar()}>Confirmar viabilidade</button></div>
        </>
      ) : <p className="muted">Aguardando a confirmação de Operações.</p>}
    </div>
  )
}
