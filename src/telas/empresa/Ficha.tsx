import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { EtapaTag, Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { TrocaEtapa } from '../../componentes/TrocaEtapa'
import { listarUsuarios, obterEmpresa } from '../../dados/api'
import type { Empresa, Perfil } from '../../dados/tipos'
import { formatarCnpj, formatarData } from '../../regras/formato'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'
import { AbaAnexos } from './AbaAnexos'
import { AbaMensagens } from './AbaMensagens'
import { AbaResumo } from './AbaResumo'
import { AbaTempo } from './AbaTempo'

export type PropsAba = { empresa: Empresa; usuarios: Perfil[]; atualizar: () => Promise<void> }

type Aba = { id: string; titulo: string; mostrar?: (e: Empresa) => boolean; render: (p: PropsAba) => ReactNode }

// As abas crescem a cada REQ (triagem, classificação, proposta, contrato, parceria).
const abas: Aba[] = [
  { id: 'resumo', titulo: 'Resumo', render: (p) => <AbaResumo {...p} /> },
  { id: 'anexos', titulo: 'Anexos', render: (p) => <AbaAnexos {...p} /> },
  { id: 'mensagens', titulo: 'Mensagens', render: (p) => <AbaMensagens {...p} /> },
  { id: 'tempo', titulo: 'Linha do tempo', render: (p) => <AbaTempo {...p} /> },
]

export function Ficha() {
  const { id = '' } = useParams()
  const { perfil } = useSessao()
  const empresa = useConsulta(() => obterEmpresa(id), [id])
  const usuarios = useConsulta(listarUsuarios)
  const [aba, setAba] = useState('resumo')
  const [versao, setVersao] = useState(0)

  if (empresa.carregando && !empresa.dado) return <p className="muted">Carregando…</p>
  if (empresa.erro) return <div className="aviso perigo" role="alert">{empresa.erro}</div>
  const e = empresa.dado
  if (!e) return (<><Topo titulo="Empresa" /><div className="vazio">Empresa não encontrada ou sem acesso. <Link to="/empresas">Voltar às empresas</Link></div></>)

  const atualizar = async () => { await empresa.recarregar(); setVersao((v) => v + 1) }
  const visiveis = abas.filter((a) => !a.mostrar || a.mostrar(e))
  const atual = visiveis.find((a) => a.id === aba) ?? visiveis[0]
  const lista = usuarios.dado ?? []

  return (
    <>
      <Topo eyebrow={`${formatarCnpj(e.cnpj)} · chegou em ${formatarData(e.criado_em)}`} titulo={e.marca}>
        <Exemplo mostrar={e.exemplo} />
        <EtapaTag etapa={e.etapa} />
        <PadraoTag padrao={e.padrao_final} />
      </Topo>
      <div className="grade-ficha">
        <div className="pilha" style={{ minWidth: 0 }}>
          <nav className="abas" aria-label="Seções da empresa">
            {visiveis.map((a) => (
              <button key={a.id} className={a.id === atual.id ? 'ativa' : ''} onClick={() => setAba(a.id)}>{a.titulo}</button>
            ))}
          </nav>
          <div key={`${atual.id}-${versao}`}>{atual.render({ empresa: e, usuarios: lista, atualizar })}</div>
        </div>
        <aside className="pilha">
          <div className="cartao">
            <h3>Situação</h3>
            <div className="pilha pequeno" style={{ gap: 6 }}>
              <div className="linha entre"><span className="muted">Etapa</span><EtapaTag etapa={e.etapa} /></div>
              {e.motivo_saida && <div><span className="muted">Motivo: </span>{e.motivo_saida}</div>}
              {e.retomar_em && <div><span className="muted">Retomar em: </span>{formatarData(e.retomar_em)}</div>}
              <div className="linha entre"><span className="muted">Gerente 1</span><span>{nomeDe(lista, e.gerente1_id)}</span></div>
              <div className="linha entre"><span className="muted">Gerente 2</span><span>{nomeDe(lista, e.gerente2_id)}</span></div>
              <div className="linha entre"><span className="muted">Responsável final</span><span>{nomeDe(lista, e.responsavel_id)}</span></div>
            </div>
          </div>
          {pode(perfil, 'triar') && (
            <div className="cartao">
              <h3>Mudar etapa</h3>
              <TrocaEtapa key={e.etapa} empresa={e.id} de={e.etapa} aoConcluir={() => void atualizar()} />
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
