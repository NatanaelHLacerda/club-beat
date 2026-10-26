import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { Exemplo, NomeEmpresa, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, Carregando, CartaoNumero, DataComIcone, Icone, iniciais, Pill, Progresso, Tabela, Vazio } from '../../componentes/ui'
import { listarEntregas, listarLogotipos, listarParcerias, listarRelatorios, listarUsuarios } from '../../dados/api'
import type { ParceriaComEmpresa } from '../../dados/tipos'
import { contratadoFeito, proximoBalanco, proximoRelatorio, textosAcompanhamento } from '../../regras/acompanhamento'
import { formatarData, hojeISO } from '../../regras/formato'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

type Modo = 'vitrine' | 'lista'
const chaveModo = (pessoa: string) => `crm.parcerias.modo.${pessoa}`
function lerModo(pessoa: string | undefined, papel: string | undefined): Modo {
  try { const v = pessoa ? localStorage.getItem(chaveModo(pessoa)) : null; if (v === 'vitrine' || v === 'lista') return v } catch { /* sem armazenamento */ }
  return papel === 'gerente' || papel === 'direcao' ? 'vitrine' : 'lista'
}

export function Parcerias() {
  const navegar = useNavigate()
  const { perfil } = useSessao()
  const [modo, setModo] = useState<Modo>(() => lerModo(perfil?.id, perfil?.papel))
  const hoje = hojeISO()
  const parcerias = useConsulta(() => listarParcerias('vigente'))
  const entregas = useConsulta(() => listarEntregas())
  const relatorios = useConsulta(() => listarRelatorios())
  const usuarios = useConsulta(listarUsuarios)
  const lista = parcerias.dado ?? []
  const nasTelas = lista.filter((p) => p.contrapartidas.some((c) => c.item === 'telas') && p.inicio <= hoje && p.fim >= hoje).length
  const relDe = (p: ParceriaComEmpresa) => proximoRelatorio(p.padrao, p.inicio, (relatorios.dado ?? []).filter((r) => r.parceria_id === p.id), hoje)
  const balDe = (p: ParceriaComEmpresa) => proximoBalanco(p.inicio, (relatorios.dado ?? []).filter((r) => r.parceria_id === p.id), hoje)
  const ativacoes = (p: ParceriaComEmpresa) => {
    const r = contratadoFeito(p.contrapartidas, (entregas.dado ?? []).filter((e) => e.parceria_id === p.id)).filter((x) => x.item.startsWith('ativacao'))
    return { feito: r.reduce((s, x) => s + x.feito, 0), total: r.some((x) => x.contratado === null) ? null : r.reduce((s, x) => s + (x.contratado ?? 0), 0) }
  }
  const atrasados = lista.filter((p) => relDe(p)?.atrasado).length
  // REQ-035 — logotipo só de parceira com contrato assinado (parceria vigente e empresa ativa ou em renovação).
  const comLogotipo = lista.filter((p) => p.empresas.etapa === 'ativa' || p.empresas.etapa === 'renovacao').map((p) => p.empresa_id)
  const logotipos = useConsulta(() => listarLogotipos(comLogotipo), [comLogotipo.join(',')])

  function trocarModo(m: Modo) {
    setModo(m)
    try { if (perfil) localStorage.setItem(chaveModo(perfil.id), m) } catch { /* sem armazenamento: vale só nesta visita */ }
  }

  return (
    <>
      <Topo eyebrow="Parcerias" titulo="Parcerias" acento="ativas" secao={parcerias.dado ? <>{lista.length} {lista.length === 1 ? 'parceria vigente' : 'parcerias vigentes'}</> : 'Parcerias'}>
        <div className="alternar" role="group" aria-label="Modo de exibição">
          <button type="button" className={modo === 'vitrine' ? 'ativo' : ''} aria-pressed={modo === 'vitrine'} onClick={() => trocarModo('vitrine')}><Icone nome="parcerias" tamanho={14} />Vitrine</button>
          <button type="button" className={modo === 'lista' ? 'ativo' : ''} aria-pressed={modo === 'lista'} onClick={() => trocarModo('lista')}><Icone nome="fila" tamanho={14} />Lista</button>
        </div>
      </Topo>
      <div className="numeros">
        <CartaoNumero rotulo="Parcerias vigentes" icone="parcerias" valor={parcerias.dado ? lista.length : '—'} />
        <CartaoNumero rotulo="Marcas nas telas agora" icone="painel" valor={parcerias.dado ? `${nasTelas} de 8` : '—'} />
        <CartaoNumero rotulo="Relatórios atrasados" icone="alerta" valor={parcerias.dado && relatorios.dado ? atrasados : '—'} />
        <CartaoNumero rotulo="Por padrão" icone="ativacao" valor={parcerias.dado ? <span className="linha pequeno" style={{ gap: 8 }}>{(['bronze', 'prata', 'ouro', 'master'] as const).map((x) => <span key={x}><PadraoTag padrao={x} /> {lista.filter((p) => p.padrao === x).length}</span>)}</span> : '—'} />
      </div>
      {parcerias.erro && <div className="aviso perigo">{parcerias.erro}</div>}
      {parcerias.carregando && !parcerias.dado ? <Carregando /> : modo === 'vitrine' ? (
        lista.length === 0 ? <Vazio texto="Nenhuma parceria ativa." icone="parcerias" /> : (
          <ul className="vitrine">
            {lista.map((p) => {
              const r = relDe(p)
              const logo = logotipos.dado?.[p.empresa_id]
              const marca = p.empresas.exemplo ? p.empresas.marca.replace(/\s*\(exemplo\)$/i, '') : p.empresas.marca
              return (
                <li key={p.id}>
                  <button type="button" className="vitrine-cartao" onClick={() => navegar(`/empresas/${p.empresa_id}`)}>
                    <span className={`vitrine-marca${p.padrao === 'master' ? ' master' : ''}`}>
                      {logo ? <img src={logo} alt={`Logotipo de ${marca}`} loading="lazy" onError={(e) => { e.currentTarget.hidden = true; e.currentTarget.nextElementSibling?.removeAttribute('hidden') }} /> : null}
                      <span className="vitrine-iniciais acento" aria-hidden="true" hidden={!!logo}>{iniciais(marca)}</span>
                    </span>
                    <span className="vitrine-corpo">
                      <span className="vitrine-nome"><b>{marca}</b><Exemplo mostrar={p.empresas.exemplo} /></span>
                      <PadraoTag padrao={p.padrao} />
                      <span className="vitrine-dados">
                        <span><span className="rotulo">Período</span><span className="num">{formatarData(p.inicio)} – {formatarData(p.fim)}</span></span>
                        <span><span className="rotulo">Próximo relatório</span>{r ? <span className={`num${r.atrasado ? ' erro' : ''}`}>{formatarData(r.prazo)}{r.atrasado ? ' · atrasado' : ''}</span> : <span>em dia</span>}</span>
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )
      ) : (
        <Tabela<ParceriaComEmpresa> itens={lista} chave={(p) => p.id} vazio="Nenhuma parceria ativa."
          aoAbrir={(p) => navegar(`/empresas/${p.empresa_id}`)}
          destaque={(p) => (relDe(p)?.atrasado ? 'atrasado' : balDe(p)?.atrasado ? 'alerta' : null)}
          colunas={[
            { titulo: 'Parceira', render: (p) => <NomeEmpresa marca={p.empresas.marca} exemplo={p.empresas.exemplo} /> },
            { titulo: 'Padrão', render: (p) => <PadraoTag padrao={p.padrao} /> },
            { titulo: 'Ativações', render: (p) => { const a = ativacoes(p); return <Progresso feito={a.feito} total={a.total} rotulo="Ativações feitas / contratadas" /> } },
            { titulo: 'Próximo relatório', render: (p) => { const r = relDe(p); return r ? <span className="pilha" style={{ gap: 2 }}><DataComIcone texto={formatarData(r.prazo)} erro={r.atrasado} />{r.atrasado && <Pill tom="perigo">{textosAcompanhamento.atrasado}</Pill>}</span> : <Pill tom="ok">em dia</Pill> } },
            { titulo: 'Balanço', render: (p) => { const b = balDe(p); return b ? <DataComIcone texto={formatarData(b.prazo)} erro={b.atrasado} /> : <Pill tom="ok">em dia</Pill> } },
            { titulo: 'Fim', render: (p) => <DataComIcone texto={formatarData(p.fim)} /> },
            { titulo: 'Responsável', render: (p) => p.responsavel_id ? <span className="linha" style={{ gap: 6, flexWrap: 'nowrap' }}><Avatar nome={nomeDe(usuarios.dado, p.responsavel_id)} pessoa={p.responsavel_id} tamanho={22} />{nomeDe(usuarios.dado, p.responsavel_id).replace(/\s*\(exemplo\)$/, '')}</span> : '—' },
          ]}
          acoes={[{ rotulo: 'Abrir parceria', icone: 'ver', aoClicar: (p) => navegar(`/empresas/${p.empresa_id}`) }]} />
      )}
    </>
  )
}
