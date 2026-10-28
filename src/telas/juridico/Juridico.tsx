import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SemAcesso, Topo } from '../../componentes/Casca'
import { NomeEmpresa, PadraoTag } from '../../componentes/Rotulos'
import { Carregando, CartaoNumero, DataComIcone, Pill, Tabela } from '../../componentes/ui'
import { listarParaJuridico } from '../../dados/api'
import type { Empresa } from '../../dados/tipos'
import { rotuloPasta } from '../../dados/tipos'
import { PastaDocumentos } from './PastaDocumentos'
import { formatarData, hojeISO } from '../../regras/formato'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

function situacao(c: Empresa['contrato']) {
  if (c?.pronto_em) return <Pill tom="ok">Pronto para assinar</Pill>
  if (c?.divergencia) return <Pill tom="perigo">Divergência com a Gerente</Pill>
  if (c?.enviado_juridico_em) return <Pill tom="alerta">Minuta em preparo</Pill>
  return <Pill>Aguardando pacote</Pill>
}

export function Juridico() {
  const { perfil } = useSessao()
  const navegar = useNavigate()
  const lista = useConsulta(listarParaJuridico)
  const [aba, setAba] = useState<'contratos' | 'minutas' | 'diretrizes'>('contratos')
  if (!pode(perfil, 'ver_juridico')) return (<><Topo titulo="Jurídico" /><SemAcesso /></>)
  const hoje = hojeISO()
  const casos = lista.dado ?? []
  const vencido = (e: Empresa) => Boolean(!e.contrato?.pronto_em && e.contrato?.prazo_juridico && hoje > e.contrato.prazo_juridico)
  return (
    <>
      <Topo eyebrow="Contratos" titulo="Jurídico" />
      <div className="alternar" role="group" aria-label="Pastas do Jurídico">
        <button className={aba === 'contratos' ? 'ativo' : ''} aria-pressed={aba === 'contratos'} onClick={() => setAba('contratos')}>Contratos em andamento</button>
        <button className={aba === 'minutas' ? 'ativo' : ''} aria-pressed={aba === 'minutas'} onClick={() => setAba('minutas')}>{rotuloPasta.minutas}</button>
        <button className={aba === 'diretrizes' ? 'ativo' : ''} aria-pressed={aba === 'diretrizes'} onClick={() => setAba('diretrizes')}>{rotuloPasta.diretrizes}</button>
      </div>
      {aba !== 'contratos' && <PastaDocumentos pasta={aba} />}
      {aba === 'contratos' && <>
      <div className="numeros">
        <CartaoNumero rotulo="Em andamento" icone="juridico" valor={lista.dado ? casos.length : '—'} />
        <CartaoNumero rotulo="Minuta em preparo" icone="regras" valor={lista.dado ? casos.filter((e) => e.contrato?.enviado_juridico_em && !e.contrato?.pronto_em).length : '—'} />
        <CartaoNumero rotulo="Prontos para assinar" icone="check" valor={lista.dado ? casos.filter((e) => e.contrato?.pronto_em).length : '—'} />
        <CartaoNumero rotulo="Prazo vencido" icone="alerta" valor={lista.dado ? casos.filter(vencido).length : '—'} />
      </div>
      <p className="muted pequeno">Minuta em até 5 dias úteis depois do pacote. A minuta tem exatamente o que foi aceito na proposta.</p>
      {lista.erro && <div className="aviso perigo">{lista.erro}</div>}
      {lista.carregando && !lista.dado ? <Carregando /> : (
        <Tabela<Empresa> itens={casos} chave={(e) => e.id} vazio="Nenhum contrato em andamento."
          aoAbrir={(e) => navegar(`/empresas/${e.id}`)} destaque={(e) => (vencido(e) ? 'atrasado' : null)}
          colunas={[
            { titulo: 'Empresa', render: (e) => <NomeEmpresa marca={e.marca} exemplo={e.exemplo} /> },
            { titulo: 'Padrão', render: (e) => <PadraoTag padrao={e.padrao_final} /> },
            { titulo: 'Situação', render: (e) => situacao(e.contrato) },
            { titulo: 'Prazo da minuta', render: (e) => e.contrato?.prazo_juridico ? <DataComIcone texto={formatarData(e.contrato.prazo_juridico)} erro={vencido(e)} /> : <span className="muted">—</span> },
          ]}
          acoes={[{ rotulo: 'Abrir contrato', icone: 'juridico', aoClicar: (e) => navegar(`/empresas/${e.id}`) }]} />
      )}
      </>}
    </>
  )
}
