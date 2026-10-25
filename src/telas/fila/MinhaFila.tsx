import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { EtapaTag, Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, Carregando, CartaoNumero, DataComIcone, Pill, Tabela } from '../../componentes/ui'
import { listarMinhaFila, listarPrazos } from '../../dados/api'
import type { Empresa } from '../../dados/tipos'
import { formatarData } from '../../regras/formato'
import { ordemFila } from '../../regras/passagem'
import { rotuloSituacaoPrazo } from '../../regras/prazos'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

export function MinhaFila() {
  const { perfil } = useSessao()
  const navegar = useNavigate()
  const fila = useConsulta(() => listarMinhaFila(perfil?.id ?? ''), [perfil?.id])
  const prazos = useConsulta(listarPrazos)
  const prazoDe = (id: string) => prazos.dado?.find((p) => p.empresa_id === id)
  const lista = [...(fila.dado ?? [])].sort((a, b) =>
    ordemFila(a.padrao_final, a.candidata_master) - ordemFila(b.padrao_final, b.candidata_master) ||
    (a.passada_em ?? '').localeCompare(b.passada_em ?? ''))
  const papel = (e: Empresa) => (e.responsavel_id === perfil?.id ? 'Responsável final' : e.gerente1_id === perfil?.id ? 'Conduz' : 'Finaliza')

  return (
    <>
      <Topo eyebrow="Gerente de Negócios" titulo="Minha fila" />
      <div className="numeros">
        <CartaoNumero rotulo="Empresas comigo" icone="fila" valor={fila.dado ? lista.length : '—'} />
        <CartaoNumero rotulo="Conduzo" icone="mensagem" valor={fila.dado ? lista.filter((e) => e.gerente1_id === perfil?.id).length : '—'} />
        <CartaoNumero rotulo="Finalizo" icone="juridico" valor={fila.dado ? lista.filter((e) => e.gerente2_id === perfil?.id).length : '—'} />
        <CartaoNumero rotulo="Com prazo atrasado" icone="alerta" valor={fila.dado && prazos.dado ? lista.filter((e) => prazoDe(e.id)?.situacao === 'atrasado').length : '—'} />
      </div>
      <p className="muted pequeno">Ouro e candidatas a Master primeiro, depois Prata e Bronze. Dentro de cada padrão, por ordem de passagem.</p>
      {fila.erro && <div className="aviso perigo">{fila.erro}</div>}
      {fila.carregando && !fila.dado ? <Carregando /> : (
        <Tabela<Empresa> itens={lista} chave={(e) => e.id} vazio="Nenhuma empresa com você agora."
          aoAbrir={(e) => navegar(`/empresas/${e.id}`)}
          destaque={(e) => { const s = prazoDe(e.id)?.situacao; return s === 'atrasado' ? 'atrasado' : s === 'vence_hoje' ? 'alerta' : null }}
          colunas={[
            { titulo: 'Empresa', render: (e) => <span className="linha" style={{ gap: 10, flexWrap: 'nowrap' }}><Avatar nome={e.marca} tamanho={28} /><span className="pilha" style={{ gap: 0 }}><b style={{ color: 'var(--ink)', fontWeight: 500 }}>{e.marca}</b><Exemplo mostrar={e.exemplo} /></span></span> },
            { titulo: 'Padrão', render: (e) => <span className="linha" style={{ gap: 6 }}><PadraoTag padrao={e.padrao_final} />{e.candidata_master && <Pill tom="ouro">Master?</Pill>}</span> },
            { titulo: 'Etapa', render: (e) => <EtapaTag etapa={e.etapa} /> },
            { titulo: 'Próximo prazo', render: (e) => { const p = prazoDe(e.id); return p ? <span className="pilha" style={{ gap: 2 }}><span className="pequeno">{p.descricao}</span><span className="linha" style={{ gap: 6 }}><DataComIcone texto={formatarData(p.prazo)} erro={p.situacao === 'atrasado'} />{p.situacao !== 'no_prazo' && <Pill tom={p.situacao === 'atrasado' ? 'perigo' : 'alerta'}>{rotuloSituacaoPrazo[p.situacao]}</Pill>}</span></span> : <span className="muted">—</span> } },
            { titulo: 'Passada em', render: (e) => <DataComIcone texto={formatarData(e.passada_em)} /> },
            { titulo: 'Meu papel', render: (e) => <span className="muted">{papel(e)}</span> },
          ]}
          acoes={[{ rotulo: 'Abrir', icone: 'ver', aoClicar: (e) => navegar(`/empresas/${e.id}`) }]} />
      )}
    </>
  )
}
