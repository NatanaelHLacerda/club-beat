import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { Filtros, FiltrosAtivos, nomeDe } from '../../componentes/Filtros'
import { EtapaTag, Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { TrocaEtapa } from '../../componentes/TrocaEtapa'
import { Avatar, BarraBusca, Carregando, Icone, PainelLateral, Pill, Tabela, Vazio } from '../../componentes/ui'
import { listarEmpresas, listarPrazos, listarUsuarios, moverEtapa } from '../../dados/api'
import type { Empresa, FiltrosEmpresas } from '../../dados/tipos'
import { bloqueioDeMudanca, etapasDoFunil, exigeMotivo, rotuloEtapa, saidas, type Etapa } from '../../regras/etapas'
import { formatarCnpj, formatarData } from '../../regras/formato'
import { rotuloSituacaoPrazo } from '../../regras/prazos'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'
import { CartaoEmpresa } from './CartaoEmpresa'

type Modo = 'quadro' | 'lista'
const chaveModo = 'crm.empresas.modo'
const lerModo = (): Modo => { try { return localStorage.getItem(chaveModo) === 'lista' ? 'lista' : 'quadro' } catch { return 'quadro' } }

// REQ-021 — Funil (quadro) e Empresas (lista) na mesma tela. Regras de etapa do REQ-004.
export function TelaEmpresas({ forcarLista = false }: { forcarLista?: boolean }) {
  const { perfil } = useSessao()
  const navegar = useNavigate()
  const [parametros] = useSearchParams()
  const [modo, setModo] = useState<Modo>(() => (forcarLista ? 'lista' : lerModo()))
  const [filtros, setFiltros] = useState<FiltrosEmpresas>(() => ({ busca: parametros.get('busca') ?? '' }))
  const empresas = useConsulta(() => listarEmpresas(filtros), [JSON.stringify(filtros)])
  const usuarios = useConsulta(listarUsuarios)
  const prazos = useConsulta(listarPrazos)
  const [comSaidas, setComSaidas] = useState(false)
  const [arrastando, setArrastando] = useState<Empresa | null>(null)
  const [sobre, setSobre] = useState<Etapa | null>(null)
  const [mover, setMover] = useState<{ empresa: Empresa; para?: Etapa } | null>(null)
  const [aviso, setAviso] = useState('')
  const podeMover = pode(perfil, 'triar')
  const lista = empresas.dado ?? []
  const prazoDe = (id: string) => prazos.dado?.find((p) => p.empresa_id === id)

  function trocarModo(m: Modo) {
    setModo(m)
    try { localStorage.setItem(chaveModo, m) } catch { /* sem armazenamento: vale só nesta visita */ }
  }

  async function soltar(para: Etapa) {
    const e = arrastando
    setArrastando(null); setSobre(null)
    if (!e || e.etapa === para || !podeMover) return
    const bloqueio = bloqueioDeMudanca(e.etapa, para)
    if (bloqueio) { setAviso(bloqueio); return }
    if (exigeMotivo(para)) { setMover({ empresa: e, para }); return }
    try { await moverEtapa(e.id, para); setAviso(''); await empresas.recarregar() } catch (err) { setAviso((err as Error).message) }
  }

  const colunas: Etapa[] = comSaidas ? [...etapasDoFunil, ...saidas] : etapasDoFunil

  return (
    <>
      <Topo eyebrow="Funil de parcerias" titulo={modo === 'quadro' ? 'Funil' : 'Empresas'}
        secao={empresas.dado ? <>{lista.length} {lista.length === 1 ? 'empresa' : 'empresas'}</> : 'Empresas'}>
        <BarraBusca id="filtro-busca" valor={filtros.busca ?? ''} mudar={(v) => setFiltros({ ...filtros, busca: v })} placeholder="Buscar por marca, razão social ou CNPJ" />
        <Filtros filtros={filtros} mudar={setFiltros} usuarios={usuarios.dado ?? []} />
        <div className="alternar" role="group" aria-label="Modo de exibição">
          <button className={modo === 'quadro' ? 'ativo' : ''} aria-pressed={modo === 'quadro'} onClick={() => trocarModo('quadro')}><Icone nome="funil" tamanho={14} />Quadro</button>
          <button className={modo === 'lista' ? 'ativo' : ''} aria-pressed={modo === 'lista'} onClick={() => trocarModo('lista')}><Icone nome="fila" tamanho={14} />Lista</button>
        </div>
        {pode(perfil, 'editar_empresa') && <Link className="botao primario" to="/empresas/nova"><Icone nome="mais" tamanho={14} /> Nova empresa</Link>}
      </Topo>
      <FiltrosAtivos filtros={filtros} mudar={setFiltros} usuarios={usuarios.dado ?? []} />
      {aviso && <div className="aviso alerta" role="alert">{aviso}</div>}
      {empresas.erro && <div className="aviso perigo" role="alert">{empresas.erro}</div>}

      {empresas.carregando && !empresas.dado ? <Carregando linhas={4} /> : modo === 'quadro' ? (
        <>
          <label className="marcar pequeno"><input type="checkbox" checked={comSaidas} onChange={(e) => setComSaidas(e.target.checked)} /><span>Mostrar saídas (Em espera e Recusada)</span></label>
          <div className="funil-rolagem">
            <div className="funil">
              {colunas.map((etapa) => {
                const cards = lista.filter((e) => e.etapa === etapa)
                return (
                  <section key={etapa} className={`coluna${sobre === etapa ? ' sobre' : ''}`} aria-label={rotuloEtapa[etapa]}
                    onDragOver={(ev) => { if (podeMover) { ev.preventDefault(); setSobre(etapa) } }}
                    onDragLeave={() => setSobre((s) => (s === etapa ? null : s))}
                    onDrop={(ev) => { ev.preventDefault(); void soltar(etapa) }}>
                    <header><b>{rotuloEtapa[etapa]}</b><span className="contagem num">{cards.length}</span></header>
                    <div className="cards">
                      {cards.map((e) => (
                        <CartaoEmpresa key={e.id} empresa={e} usuarios={usuarios.dado ?? []} prazo={prazoDe(e.id)} arrastavel={podeMover}
                          aoArrastar={() => setArrastando(e)} aoSoltar={() => { setArrastando(null); setSobre(null) }} />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <Tabela<Empresa> itens={lista} chave={(e) => e.id} aoAbrir={(e) => navegar(`/empresas/${e.id}`)} vazio="Nenhuma empresa encontrada."
          destaque={(e) => { const s = prazoDe(e.id)?.situacao; return s === 'atrasado' ? 'atrasado' : s === 'vence_hoje' ? 'alerta' : null }}
          colunas={[
            { titulo: 'Marca', render: (e) => <span className="linha" style={{ gap: 10, flexWrap: 'nowrap' }}><Avatar nome={e.marca} tamanho={30} /><span className="pilha" style={{ gap: 0, minWidth: 160 }}><b style={{ color: 'var(--ink)', fontWeight: 500 }}>{e.marca}</b><span className="muted pequeno">chegou em {formatarData(e.criado_em)} <Exemplo mostrar={e.exemplo} /></span></span></span> },
            { titulo: 'CNPJ', classe: 'num muted', render: (e) => formatarCnpj(e.cnpj) },
            { titulo: 'Segmento', render: (e) => e.segmento },
            { titulo: 'Etapa', render: (e) => <EtapaTag etapa={e.etapa} /> },
            { titulo: 'Padrão', render: (e) => <PadraoTag padrao={e.padrao_final} /> },
            { titulo: 'Responsável', render: (e) => { const r = e.responsavel_id ?? e.gerente1_id; return r ? <span className="linha" style={{ gap: 6, flexWrap: 'nowrap' }}><Avatar nome={nomeDe(usuarios.dado, r)} tamanho={22} />{nomeDe(usuarios.dado, r).replace(/\s*\(exemplo\)$/, '')}</span> : <span className="muted">—</span> } },
            { titulo: 'Prazo', render: (e) => { const p = prazoDe(e.id); return p ? <span className="pilha" style={{ gap: 2 }}><Pill tom={p.situacao === 'atrasado' ? 'perigo' : p.situacao === 'vence_hoje' ? 'alerta' : 'neutro'}>{rotuloSituacaoPrazo[p.situacao]}</Pill><span className="muted pequeno">{p.descricao} · {formatarData(p.prazo)}</span></span> : <span className="muted">—</span> } },
          ]}
          acoes={[
            { rotulo: 'Ver', icone: 'ver', aoClicar: (e) => navegar(`/empresas/${e.id}`) },
            { rotulo: 'Mover etapa', icone: 'mover', mostrar: () => podeMover, aoClicar: (e) => setMover({ empresa: e }) },
          ]} />
      )}
      {!empresas.carregando && lista.length === 0 && modo === 'quadro' && <Vazio texto="Nenhuma empresa no funil com estes filtros." icone="funil" />}

      {mover && (
        <PainelLateral titulo={`${mover.empresa.marca}: mover etapa`} aoFechar={() => setMover(null)}>
          <p className="muted pequeno">Etapa atual: {rotuloEtapa[mover.empresa.etapa]}</p>
          <TrocaEtapa empresa={mover.empresa.id} de={mover.empresa.etapa} paraInicial={mover.para}
            aoCancelar={() => setMover(null)} aoConcluir={() => { setMover(null); void empresas.recarregar() }} />
        </PainelLateral>
      )}
    </>
  )
}
