import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { Filtros, nomeDe } from '../../componentes/Filtros'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { TrocaEtapa } from '../../componentes/TrocaEtapa'
import { listarEmpresas, listarUsuarios, moverEtapa } from '../../dados/api'
import type { Empresa, FiltrosEmpresas } from '../../dados/tipos'
import { bloqueioDeMudanca, etapasDoFunil, exigeMotivo, rotuloEtapa, saidas, type Etapa } from '../../regras/etapas'
import { diasDesde, hojeISO } from '../../regras/formato'
import { diasDesdePedido, semRetorno } from '../../regras/triagem1'
import { respostaVencida } from '../../regras/proposta'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

const colunas: Etapa[] = [...etapasDoFunil, ...saidas]

export function Funil() {
  const { perfil } = useSessao()
  const [filtros, setFiltros] = useState<FiltrosEmpresas>({})
  const empresas = useConsulta(() => listarEmpresas(filtros), [JSON.stringify(filtros)])
  const usuarios = useConsulta(listarUsuarios)
  const [arrastando, setArrastando] = useState<Empresa | null>(null)
  const [sobre, setSobre] = useState<Etapa | null>(null)
  const [pendente, setPendente] = useState<{ empresa: Empresa; para: Etapa } | null>(null)
  const [aviso, setAviso] = useState('')
  const podeMover = pode(perfil, 'triar')

  async function soltar(para: Etapa) {
    const e = arrastando
    setArrastando(null); setSobre(null)
    if (!e || e.etapa === para || !podeMover) return
    const bloqueio = bloqueioDeMudanca(e.etapa, para)
    if (bloqueio) { setAviso(bloqueio); return }
    if (exigeMotivo(para)) { setPendente({ empresa: e, para }); return }
    try {
      await moverEtapa(e.id, para)
      setAviso('')
      await empresas.recarregar()
    } catch (err) {
      setAviso((err as Error).message)
    }
  }

  const lista = empresas.dado ?? []
  return (
    <>
      <Topo eyebrow="Funil de parcerias" titulo="Funil">
        <span className="muted num">{lista.length} empresas</span>
      </Topo>
      <Filtros filtros={filtros} mudar={setFiltros} usuarios={usuarios.dado ?? []} />
      {aviso && <div className="aviso alerta" role="alert">{aviso}</div>}
      {empresas.erro && <div className="aviso perigo" role="alert">{empresas.erro}</div>}
      {pendente && (
        <div className="cartao destaque" style={{ maxWidth: 480 }}>
          <h3>{pendente.empresa.marca} → {rotuloEtapa[pendente.para]}</h3>
          <TrocaEtapa empresa={pendente.empresa.id} de={pendente.empresa.etapa} paraInicial={pendente.para}
            aoCancelar={() => setPendente(null)}
            aoConcluir={() => { setPendente(null); void empresas.recarregar() }} />
        </div>
      )}
      {empresas.carregando && !empresas.dado ? <p className="muted">Carregando…</p> : lista.length === 0 && !Object.values(filtros).some(Boolean) ? (
        <div className="vazio">Nenhuma empresa no funil ainda.</div>
      ) : (
        <div className="funil-rolagem">
          <div className="funil">
            {colunas.map((etapa) => {
              const cards = lista.filter((e) => e.etapa === etapa)
              return (
                <section key={etapa} className={`coluna${sobre === etapa ? ' sobre' : ''}`} aria-label={rotuloEtapa[etapa]}
                  onDragOver={(ev) => { if (podeMover) { ev.preventDefault(); setSobre(etapa) } }}
                  onDragLeave={() => setSobre((s) => (s === etapa ? null : s))}
                  onDrop={(ev) => { ev.preventDefault(); void soltar(etapa) }}>
                  <header><b>{rotuloEtapa[etapa]}</b><span className="muted num">{cards.length}</span></header>
                  <div className="cards">
                    {cards.map((e) => {
                      const parado = e.etapa === 'triagem1' && semRetorno(e.pedido_info_em, hojeISO())
                      const semResposta = e.etapa === 'proposta' && respostaVencida(e.proposta?.prazo_resposta, e.proposta?.aceite_em, hojeISO())
                      return (
                      <Link key={e.id} to={`/empresas/${e.id}`} className={`card${parado || semResposta ? ' atrasado' : ''}`} draggable={podeMover}
                        onDragStart={() => setArrastando(e)} onDragEnd={() => { setArrastando(null); setSobre(null) }}>
                        <div className="linha entre"><b>{e.marca}</b><Exemplo mostrar={e.exemplo} /></div>
                        <span className="muted pequeno">{e.segmento}</span>
                        <div className="linha entre pequeno">
                          <PadraoTag padrao={e.padrao_final} />
                          <span className="muted">{nomeDe(usuarios.dado, e.responsavel_id ?? e.gerente1_id)}</span>
                        </div>
                        <span className="muted pequeno num">{diasDesde(e.etapa_desde)} dias na etapa</span>
                        {parado && <span className="erro pequeno">Sem retorno há {diasDesdePedido(e.pedido_info_em, hojeISO())} dias</span>}
                        {semResposta && <span className="erro pequeno">Prazo de resposta vencido</span>}
                      </Link>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
