// REQ-018 — peças visuais do CRM (estilo do kit de referência, identidade do Club). Sem chamada de dados.
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { calcularVariacao, textoVariacao } from '../../regras/variacao'
import { Icone, type NomeIcone } from './Icone'

// ── Cartão de número ────────────────────────────────────────────
type PropsCartao = {
  rotulo: string
  valor: ReactNode
  atual?: number | null
  anterior?: number | null
  ajuda?: string
  menorEhMelhor?: boolean
  icone?: NomeIcone
}

export function CartaoNumero({ rotulo, valor, atual, anterior, ajuda, menorEhMelhor, icone }: PropsCartao) {
  const v = atual !== undefined ? calcularVariacao(atual, anterior) : null
  const bom = v?.direcao === 'igual' ? null : v?.direcao === (menorEhMelhor ? 'desce' : 'sobe')
  return (
    <div className="cartao-numero">
      <div className="linha entre">
        <span className="rotulo-marcado">{rotulo}</span>
        {icone && <span className="icone-redondo"><Icone nome={icone} tamanho={16} /></span>}
      </div>
      <b className="destaque-numero valor">{valor}</b>
      {v && (
        <span className="pequeno muted variacao">
          {v.percentual === null ? '— vs mês anterior' : (
            <><span className={`pill ${bom === null ? '' : bom ? 'ok' : 'perigo'}`}>{v.direcao !== 'igual' && <Icone nome={v.direcao === 'sobe' ? 'sobe' : 'desce'} tamanho={12} />}{textoVariacao(v)}</span> vs mês anterior</>
          )}
        </span>
      )}
      {ajuda && <span className="pequeno muted">{ajuda}</span>}
    </div>
  )
}

// ── Pill ────────────────────────────────────────────────────────
export type TomPill = 'neutro' | 'ok' | 'alerta' | 'perigo' | 'ouro' | 'oceano'
export function Pill({ tom = 'neutro', children, icone }: { tom?: TomPill; children: ReactNode; icone?: NomeIcone }) {
  return <span className={`pill ${tom === 'neutro' ? '' : tom}`}>{icone && <Icone nome={icone} tamanho={12} />}{children}</span>
}

// ── Avatar por iniciais ─────────────────────────────────────────
const tons = ['#142540', '#2C4570', '#3F5A8A', '#7F6024', '#1E3358']
export function iniciais(nome: string): string {
  const partes = nome.replace(/\(exemplo\)/i, '').trim().split(/\s+/).filter(Boolean)
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : partes[0]?.[1] ?? '')).toUpperCase()
}
export function Avatar({ nome, tamanho = 32 }: { nome: string; tamanho?: number }) {
  const tom = tons[[...nome].reduce((s, c) => s + c.charCodeAt(0), 0) % tons.length]
  return (
    <span className="avatar" style={{ width: tamanho, height: tamanho, background: tom, fontSize: tamanho * 0.38 }} aria-hidden="true">
      {iniciais(nome)}
    </span>
  )
}

// ── Cabeçalho de seção ──────────────────────────────────────────
export function SecaoCabecalho({ titulo, para, acao, children }: { titulo: string; para?: string; acao?: string; children?: ReactNode }) {
  return (
    <div className="secao-cabecalho">
      <h2><span className="marcador" aria-hidden="true" />{titulo}</h2>
      <div className="linha">
        {children}
        {para && <Link className="ver-todos" to={para}>{acao ?? 'Ver todos'}</Link>}
      </div>
    </div>
  )
}

// ── Vazio ───────────────────────────────────────────────────────
export function Vazio({ texto, icone = 'componentes' }: { texto: string; icone?: NomeIcone }) {
  return <div className="vazio"><Icone nome={icone} tamanho={28} /><span>{texto}</span></div>
}

// ── Carregando ──────────────────────────────────────────────────
export function Carregando({ linhas = 3 }: { linhas?: number }) {
  return <div className="carregando" aria-busy="true" aria-label="Carregando">{Array.from({ length: linhas }, (_, i) => <span key={i} />)}</div>
}

// ── Busca ───────────────────────────────────────────────────────
export function BarraBusca({ valor, mudar, placeholder, id }: { valor: string; mudar: (v: string) => void; placeholder: string; id?: string }) {
  return (
    <label className="busca">
      <Icone nome="busca" tamanho={16} />
      <input id={id} value={valor} onChange={(e) => mudar(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </label>
  )
}

// ── Botão de ícone (ações) ──────────────────────────────────────
export function BotaoIcone({ icone, rotulo, aoClicar, perigo }: { icone: NomeIcone; rotulo: string; aoClicar: () => void; perigo?: boolean }) {
  return (
    <button type="button" className={`botao-icone${perigo ? ' perigo' : ''}`} aria-label={rotulo} data-dica={rotulo}
      onClick={(e) => { e.stopPropagation(); aoClicar() }}>
      <Icone nome={icone} tamanho={16} />
    </button>
  )
}

// ── Tabela ──────────────────────────────────────────────────────
export type ColunaTabela<T> = { titulo: string; render: (item: T) => ReactNode; classe?: string }
export type AcaoTabela<T> = { rotulo: string; icone: NomeIcone; aoClicar: (item: T) => void; mostrar?: (item: T) => boolean; perigo?: boolean }

type PropsTabela<T> = {
  itens: T[]
  colunas: ColunaTabela<T>[]
  chave: (item: T) => string
  acoes?: AcaoTabela<T>[]
  aoAbrir?: (item: T) => void
  destaque?: (item: T) => 'atrasado' | 'alerta' | null
  vazio?: string
}

export function Tabela<T>({ itens, colunas, chave, acoes, aoAbrir, destaque, vazio = 'Nada por aqui.' }: PropsTabela<T>) {
  if (!itens.length) return <Vazio texto={vazio} />
  return (
    <div className="tabela-rolagem">
      <table className="tabela">
        <thead><tr>{colunas.map((c) => <th key={c.titulo} className={c.classe}>{c.titulo}</th>)}{acoes?.length ? <th className="acoes">Ações</th> : null}</tr></thead>
        <tbody>
          {itens.map((item) => {
            const d = destaque?.(item)
            return (
              <tr key={chave(item)} className={`${aoAbrir ? 'clicavel' : ''}${d ? ` linha-${d}` : ''}`} onClick={aoAbrir ? () => aoAbrir(item) : undefined}>
                {colunas.map((c) => <td key={c.titulo} className={c.classe}>{c.render(item)}</td>)}
                {acoes?.length ? (
                  <td className="acoes"><span className="linha" style={{ gap: 2, flexWrap: 'nowrap' }}>
                    {acoes.filter((a) => !a.mostrar || a.mostrar(item)).map((a) => (
                      <BotaoIcone key={a.rotulo} icone={a.icone} rotulo={a.rotulo} perigo={a.perigo} aoClicar={() => a.aoClicar(item)} />
                    ))}
                  </span></td>
                ) : null}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Barra de progresso ──────────────────────────────────────────
export function Progresso({ feito, total, rotulo }: { feito: number; total: number | null; rotulo?: string }) {
  const pct = total ? Math.min(100, Math.round((feito / total) * 100)) : 0
  return (
    <span className="progresso-linha" title={rotulo}>
      <span className="trilho"><span style={{ width: `${pct}%` }} /></span>
      <span className="num pequeno">{feito}{total !== null ? `/${total}` : ''}</span>
    </span>
  )
}
