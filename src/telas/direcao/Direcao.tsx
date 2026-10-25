import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, Carregando, CartaoNumero, DataComIcone, Pill, Tabela } from '../../componentes/ui'
import { listarParaDirecao, listarUsuarios } from '../../dados/api'
import type { Empresa } from '../../dados/tipos'
import { prazoVencido } from '../../regras/direcao'
import { formatarData, hojeISO } from '../../regras/formato'
import { useConsulta } from '../../lib/useConsulta'

export function Direcao() {
  const navegar = useNavigate()
  const casos = useConsulta(listarParaDirecao)
  const usuarios = useConsulta(listarUsuarios)
  const lista = casos.dado ?? []
  const hoje = hojeISO()
  const vencidos = lista.filter((e) => prazoVencido(e.direcao?.prazo, hoje)).length
  return (
    <>
      <Topo eyebrow="Decisões" titulo="Direção" />
      <div className="numeros">
        <CartaoNumero rotulo="Aguardando decisão" icone="direcao" valor={casos.dado ? lista.length : '—'} />
        <CartaoNumero rotulo="Prazo vencido" icone="alerta" valor={casos.dado ? vencidos : '—'} />
        <CartaoNumero rotulo="Candidatas a Master" icone="ativacao" valor={casos.dado ? lista.filter((e) => e.candidata_master).length : '—'} />
      </div>
      <p className="muted pequeno">Ouro, Master e o que foge do estabelecido. Resposta em até 3 dias úteis. Bronze e Prata dentro do cardápio não passam por aqui.</p>
      {casos.erro && <div className="aviso perigo">{casos.erro}</div>}
      {casos.carregando && !casos.dado ? <Carregando /> : (
        <Tabela<Empresa> itens={lista} chave={(e) => e.id} vazio="Nenhum caso aguardando a Direção."
          aoAbrir={(e) => navegar(`/empresas/${e.id}`)}
          destaque={(e) => (prazoVencido(e.direcao?.prazo, hoje) ? 'atrasado' : null)}
          colunas={[
            { titulo: 'Empresa', render: (e) => <span className="linha" style={{ gap: 10, flexWrap: 'nowrap' }}><Avatar nome={e.marca} tamanho={28} /><span className="pilha" style={{ gap: 0 }}><b style={{ color: 'var(--ink)', fontWeight: 500 }}>{e.marca}</b><Exemplo mostrar={e.exemplo} /></span></span> },
            { titulo: 'Padrão', render: (e) => <span className="linha" style={{ gap: 6 }}><PadraoTag padrao={e.padrao_final} />{e.candidata_master && <Pill tom="ouro">Master?</Pill>}</span> },
            { titulo: 'Motivos', render: (e) => <span className="pequeno">{(e.direcao?.motivos ?? []).join(', ')}</span> },
            { titulo: 'Levada por', render: (e) => e.direcao?.levada_por ? <span className="linha" style={{ gap: 6, flexWrap: 'nowrap' }}><Avatar nome={nomeDe(usuarios.dado, e.direcao.levada_por)} tamanho={22} />{nomeDe(usuarios.dado, e.direcao.levada_por).replace(/\s*\(exemplo\)$/, '')}</span> : '—' },
            { titulo: 'Prazo', render: (e) => <DataComIcone texto={formatarData(e.direcao?.prazo)} erro={prazoVencido(e.direcao?.prazo, hoje)} /> },
          ]}
          acoes={[{ rotulo: 'Decidir', icone: 'direcao', aoClicar: (e) => navegar(`/empresas/${e.id}`) }]} />
      )}
    </>
  )
}
