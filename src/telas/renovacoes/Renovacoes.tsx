import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, Carregando, CartaoNumero, DataComIcone, Pill, Tabela } from '../../componentes/ui'
import { listarRenovacoes, listarUsuarios } from '../../dados/api'
import type { ParceriaComEmpresa } from '../../dados/tipos'
import { formatarData, hojeISO } from '../../regras/formato'
import { diasParaOFim, rotuloCaminho, textosRenovacao } from '../../regras/renovacao'
import { useConsulta } from '../../lib/useConsulta'

export function Renovacoes() {
  const navegar = useNavigate()
  const hoje = hojeISO()
  const lista = useConsulta(listarRenovacoes)
  const usuarios = useConsulta(listarUsuarios)
  const itens = lista.dado ?? []
  const semDecisao = itens.filter((p) => !p.renovacao?.decidida_em && !p.renovacao?.aguardando_direcao).length
  const comDirecao = itens.filter((p) => p.renovacao?.aguardando_direcao).length
  const ate30 = itens.filter((p) => diasParaOFim(p.fim, hoje) <= 30).length
  return (
    <>
      <Topo eyebrow="Parcerias" titulo="Renovações" />
      <div className="numeros">
        <CartaoNumero rotulo="Nos próximos 90 dias" icone="renovacoes" valor={lista.dado ? itens.length : '—'} />
        <CartaoNumero rotulo="Sem decisão" icone="alerta" valor={lista.dado ? semDecisao : '—'} />
        <CartaoNumero rotulo="Com a Direção" icone="direcao" valor={lista.dado ? comDirecao : '—'} />
        <CartaoNumero rotulo="Terminam em até 30 dias" icone="prazos" valor={lista.dado ? ate30 : '—'} />
      </div>
      <p className="muted pequeno">Aviso aos 90 dias, lembretes aos 60 e 30. Toda renovação é um novo acordo por escrito. {textosRenovacao.direcao}</p>
      {lista.erro && <div className="aviso perigo">{lista.erro}</div>}
      {lista.carregando && !lista.dado ? <Carregando /> : (
        <Tabela<ParceriaComEmpresa> itens={itens} chave={(p) => p.id} vazio="Nenhum contrato termina nos próximos 90 dias."
          aoAbrir={(p) => navegar(`/empresas/${p.empresa_id}`)}
          destaque={(p) => (!p.renovacao?.decidida_em && diasParaOFim(p.fim, hoje) <= 30 ? 'atrasado' : !p.renovacao?.decidida_em ? 'alerta' : null)}
          colunas={[
            { titulo: 'Parceira', render: (p) => <span className="linha" style={{ gap: 10, flexWrap: 'nowrap' }}><Avatar nome={p.empresas.marca} tamanho={28} /><span className="pilha" style={{ gap: 0 }}><b style={{ color: 'var(--ink)', fontWeight: 500 }}>{p.empresas.marca}</b><Exemplo mostrar={p.empresas.exemplo} /></span></span> },
            { titulo: 'Padrão', render: (p) => <PadraoTag padrao={p.padrao} /> },
            { titulo: 'Fim', render: (p) => <DataComIcone texto={formatarData(p.fim)} /> },
            { titulo: 'Faltam', classe: 'num', render: (p) => { const d = diasParaOFim(p.fim, hoje); return <span className={d <= 30 ? 'erro' : ''}>{d} dias</span> } },
            { titulo: 'Decisão', render: (p) => p.renovacao?.decidida_em ? <Pill tom="ok">{rotuloCaminho[p.renovacao.caminho!]}</Pill> : p.renovacao?.aguardando_direcao ? <Pill tom="ouro">Com a Direção</Pill> : <Pill tom="alerta">Sem decisão</Pill> },
            { titulo: 'Responsável', render: (p) => p.responsavel_id ? <span className="linha" style={{ gap: 6, flexWrap: 'nowrap' }}><Avatar nome={nomeDe(usuarios.dado, p.responsavel_id)} tamanho={22} />{nomeDe(usuarios.dado, p.responsavel_id).replace(/\s*\(exemplo\)$/, '')}</span> : '—' },
          ]}
          acoes={[{ rotulo: 'Avaliar renovação', icone: 'renovacoes', aoClicar: (p) => navegar(`/empresas/${p.empresa_id}`) }]} />
      )}
    </>
  )
}
