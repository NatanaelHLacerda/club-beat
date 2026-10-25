import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { EtapaTag } from '../../componentes/Rotulos'
import { TrocaEtapa } from '../../componentes/TrocaEtapa'
import { Avatar, Carregando, Icone, PainelLateral, Pill } from '../../componentes/ui'
import { listarPrazos, listarUsuarios, obterEmpresa } from '../../dados/api'
import type { Empresa, Papel, Perfil } from '../../dados/tipos'
import { passosDoCaminho, proximoPasso } from '../../regras/caminho'
import { formatarData } from '../../regras/formato'
import { rotuloSituacaoPrazo } from '../../regras/prazos'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'
import { AbaAnexos } from './AbaAnexos'
import { AbaClassificacao } from './AbaClassificacao'
import { AbaContrato } from './AbaContrato'
import { AbaDirecao } from './AbaDirecao'
import { AbaGerentes } from './AbaGerentes'
import { AbaMensagens } from './AbaMensagens'
import { AbaParceria } from './AbaParceria'
import { AbaProposta } from './AbaProposta'
import { AbaRenovacao } from './AbaRenovacao'
import { AbaResumo } from './AbaResumo'
import { AbaTempo } from './AbaTempo'
import { AbaTriagem1 } from './AbaTriagem1'
import { PerfilEmpresa } from './PerfilEmpresa'

export type PropsAba = {
  empresa: Empresa
  usuarios: Perfil[]
  atualizar: () => Promise<void>
  abrirAba: (id: string, modelo?: string) => void
  modeloInicial?: string
}

type Grupo = 'empresa' | 'triagem' | 'negocio' | 'parceria'
const rotuloGrupo: Record<Grupo, string> = { empresa: 'Empresa', triagem: 'Triagem', negocio: 'Negócio', parceria: 'Parceria' }
type Aba = { id: string; titulo: string; grupo: Grupo; papeis?: Papel[]; mostrar?: (e: Empresa) => boolean; render: (p: PropsAba) => ReactNode }

const internos: Papel[] = ['primeira_pessoa', 'gerente', 'direcao']
const etapasDaParceria = ['ativa', 'renovacao', 'encerrada']

// REQ-022 — abas em quatro grupos, filtradas por papel e pela etapa.
const abas: Aba[] = [
  { id: 'resumo', titulo: 'Resumo', grupo: 'empresa', render: (p) => <AbaResumo {...p} /> },
  { id: 'anexos', titulo: 'Anexos', grupo: 'empresa', render: (p) => <AbaAnexos {...p} /> },
  { id: 'tempo', titulo: 'Linha do tempo', grupo: 'empresa', render: (p) => <AbaTempo {...p} /> },
  { id: 'triagem1', titulo: 'Triagem 1', grupo: 'triagem', papeis: internos, render: (p) => <AbaTriagem1 {...p} /> },
  { id: 'classificacao', titulo: 'Classificação', grupo: 'triagem', papeis: internos, render: (p) => <AbaClassificacao {...p} /> },
  { id: 'gerentes', titulo: 'Gerentes', grupo: 'triagem', papeis: internos, render: (p) => <AbaGerentes {...p} /> },
  { id: 'proposta', titulo: 'Reunião e proposta', grupo: 'negocio', papeis: [...internos, 'operacoes', 'financeiro'], render: (p) => <AbaProposta {...p} /> },
  { id: 'direcao', titulo: 'Direção', grupo: 'negocio', papeis: internos, mostrar: (e) => Boolean(e.direcao?.levada_em), render: (p) => <AbaDirecao {...p} /> },
  { id: 'contrato', titulo: 'Contrato', grupo: 'negocio', papeis: [...internos, 'juridico', 'financeiro'], mostrar: (e) => ['contrato', ...etapasDaParceria].includes(e.etapa) || Boolean(e.contrato?.enviado_juridico_em), render: (p) => <AbaContrato {...p} /> },
  { id: 'parceria', titulo: 'Parceria', grupo: 'parceria', mostrar: (e) => etapasDaParceria.includes(e.etapa), render: (p) => <AbaParceria {...p} /> },
  { id: 'renovacao', titulo: 'Renovação', grupo: 'parceria', papeis: internos, mostrar: (e) => etapasDaParceria.includes(e.etapa), render: (p) => <AbaRenovacao {...p} /> },
]

function abaDaEtapa(e: Empresa): string {
  switch (e.etapa) {
    case 'triagem1': return 'triagem1'
    case 'triagem2': return 'classificacao'
    case 'reuniao': case 'proposta': return 'proposta'
    case 'direcao': return 'direcao'
    case 'contrato': return 'contrato'
    case 'ativa': case 'encerrada': return 'parceria'
    case 'renovacao': return 'renovacao'
    default: return 'resumo'
  }
}

export function Ficha() {
  const { id = '' } = useParams()
  const { perfil } = useSessao()
  const empresa = useConsulta(() => obterEmpresa(id), [id])
  const usuarios = useConsulta(listarUsuarios)
  const prazos = useConsulta(listarPrazos)
  const [aba, setAba] = useState('')
  const [versao, setVersao] = useState(0)
  const [mensagens, setMensagens] = useState<{ modelo?: string } | null>(null)

  if (empresa.carregando && !empresa.dado) return <Carregando linhas={5} />
  if (empresa.erro) return <div className="aviso perigo" role="alert">{empresa.erro}</div>
  const e = empresa.dado
  if (!e) return (<><Topo titulo="Empresa" /><div className="vazio">Empresa não encontrada ou sem acesso. <Link to="/empresas">Voltar às empresas</Link></div></>)

  const atualizar = async () => { await empresa.recarregar(); await prazos.recarregar(); setVersao((v) => v + 1) }
  const visiveis = abas.filter((a) => (!a.papeis || (perfil && a.papeis.includes(perfil.papel))) && (!a.mostrar || a.mostrar(e)))
  const atual = visiveis.find((a) => a.id === (aba || abaDaEtapa(e))) ?? visiveis[0]
  const grupos = (Object.keys(rotuloGrupo) as Grupo[]).filter((g) => visiveis.some((a) => a.grupo === g))
  const lista = usuarios.dado ?? []
  const prazo = prazos.dado?.find((p) => p.empresa_id === e.id)
  const passo = proximoPasso(e, prazo)
  const abrirAba = (destino: string, modelo?: string) => {
    if (destino === 'mensagens') { setMensagens({ modelo }); return }
    setAba(destino)
  }
  const passos = passosDoCaminho(e.etapa, Boolean(e.direcao?.levada_em))

  return (
    <>
      <Topo eyebrow="Ficha da empresa" titulo={e.marca}>
        <EtapaTag etapa={e.etapa} />
      </Topo>

      <ol className="caminho" aria-label="Caminho da empresa no funil">
        {passos.map((p) => (
          <li key={p.chave} className={p.estado} aria-current={p.estado === 'atual' ? 'step' : undefined}>
            <span className="bola">{p.estado === 'feito' ? <Icone nome="check" tamanho={12} /> : null}</span>
            <span className="pequeno">{p.rotulo}</span>
          </li>
        ))}
        {(e.etapa === 'espera' || e.etapa === 'recusada') && <li className="saida"><EtapaTag etapa={e.etapa} /></li>}
      </ol>

      <div className="grade-ficha">
        <div className="pilha" style={{ minWidth: 0 }}>
          <PerfilEmpresa empresa={e} />
          <section className="cartao conteudo-abas">
            <nav className="grupos-abas" aria-label="Grupos de seções">
              {grupos.map((g) => (
                <button key={g} className={atual.grupo === g ? 'ativo' : ''} aria-pressed={atual.grupo === g} onClick={() => setAba(visiveis.find((a) => a.grupo === g)!.id)}>{rotuloGrupo[g]}</button>
              ))}
            </nav>
            <nav className="abas" aria-label="Seções da empresa">
              {visiveis.filter((a) => a.grupo === atual.grupo).map((a) => (
                <button key={a.id} className={a.id === atual.id ? 'ativa' : ''} aria-current={a.id === atual.id ? 'page' : undefined} onClick={() => setAba(a.id)}>{a.titulo}</button>
              ))}
            </nav>
            <div key={`${atual.id}-${versao}`} className="conteudo-aba">{atual.render({ empresa: e, usuarios: lista, atualizar, abrirAba })}</div>
          </section>
        </div>

        <aside className="pilha">
          <div className="cartao proximo-passo">
            <span className="rotulo-marcado">Próximo passo</span>
            {passo ? (
              <>
                <b className="destaque-texto">{passo.texto}</b>
                {passo.prazo && <span className="linha" style={{ gap: 6 }}><Pill tom={passo.situacao === 'atrasado' ? 'perigo' : passo.situacao === 'vence_hoje' ? 'alerta' : 'neutro'}>{rotuloSituacaoPrazo[passo.situacao!]}</Pill><span className="muted pequeno"><Icone nome="calendario" tamanho={12} /> até {formatarData(passo.prazo)}</span></span>}
                {visiveis.some((a) => a.id === passo.aba) && passo.aba !== atual.id && <button className="botao primario" onClick={() => setAba(passo.aba)}>Abrir {visiveis.find((a) => a.id === passo.aba)!.titulo}</button>}
              </>
            ) : <span className="muted">Nada pendente nesta etapa.</span>}
          </div>

          <div className="cartao">
            <h3>Situação</h3>
            <div className="pilha pequeno" style={{ gap: 8 }}>
              {e.motivo_saida && <div><span className="muted">Motivo: </span>{e.motivo_saida}</div>}
              {e.retomar_em && <div><span className="muted">Retomar em: </span>{formatarData(e.retomar_em)}</div>}
              {([['Gerente 1', e.gerente1_id], ['Gerente 2', e.gerente2_id], ['Responsável final', e.responsavel_id]] as const).map(([r, uid]) => (
                <div key={r} className="linha entre"><span className="muted">{r}</span>{uid ? <span className="linha" style={{ gap: 6 }}><Avatar nome={nomeDe(lista, uid)} tamanho={20} />{nomeDe(lista, uid).replace(/\s*\(exemplo\)$/, '')}</span> : <span>—</span>}</div>
              ))}
              <div className="linha entre"><span className="muted">Chegou em</span><span>{formatarData(e.criado_em)}</span></div>
            </div>
          </div>

          {(pode(perfil, 'triar') || pode(perfil, 'decidir_direcao')) && (
            <div className="cartao">
              <div className="linha entre"><h3>Mensagens</h3><Icone nome="mensagem" /></div>
              <p className="muted pequeno">Modelos A1 a A7 e pedido de informação, com caixa de saída.</p>
              <button className="botao" onClick={() => setMensagens({})}>Nova mensagem</button>
            </div>
          )}

          {pode(perfil, 'triar') && (
            <div className="cartao">
              <h3>Mudar etapa</h3>
              <TrocaEtapa key={e.etapa} empresa={e.id} de={e.etapa} aoConcluir={() => void atualizar()} />
            </div>
          )}
        </aside>
      </div>

      {mensagens && (
        <PainelLateral titulo={`Mensagens · ${e.marca}`} aoFechar={() => setMensagens(null)}>
          <AbaMensagens empresa={e} usuarios={lista} atualizar={atualizar} abrirAba={abrirAba} modeloInicial={mensagens.modelo} />
        </PainelLateral>
      )}
    </>
  )
}
