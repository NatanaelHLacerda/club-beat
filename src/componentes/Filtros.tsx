import { useEffect, useRef, useState } from 'react'
import { segmentos } from '../dados/campos'
import { rotuloOrigem, rotuloPadrao, rotuloPorte, type FiltrosEmpresas, type Origem, type Padrao, type Perfil, type Porte } from '../dados/tipos'
import { Icone } from './ui'

type Props = { filtros: FiltrosEmpresas; mudar: (f: FiltrosEmpresas) => void; usuarios: Perfil[] }
type Chave = Exclude<keyof FiltrosEmpresas, 'busca'>

// REQ-027 — filtros num botão "Filtros · N" com flutuante; os ativos viram pills removíveis (FiltrosAtivos).
export function Filtros({ filtros, mudar, usuarios }: Props) {
  const [aberto, setAberto] = useState(false)
  const caixa = useRef<HTMLDivElement>(null)
  const gerentes = usuarios.filter((u) => u.papel === 'gerente')
  const n = ativos(filtros, usuarios).length

  useEffect(() => {
    if (!aberto) return
    const fora = (e: MouseEvent) => { if (!caixa.current?.contains(e.target as Node)) setAberto(false) }
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false) }
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', tecla)
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', tecla) }
  }, [aberto])

  return (
    <div className="filtros-botao" ref={caixa}>
      <button type="button" className={`botao${n ? ' com-filtro' : ''}`} aria-expanded={aberto} aria-haspopup="dialog" onClick={() => setAberto((a) => !a)}>
        <Icone nome="filtros" tamanho={16} />Filtros{n ? <span className="contador num">{n}</span> : null}
      </button>
      {aberto && (
        <div className="flutuante filtros-painel" role="dialog" aria-label="Filtros">
          <label className="campo"><span>Padrão</span>
            <select id="filtro-padrao" value={filtros.padrao ?? ''} onChange={(e) => mudar({ ...filtros, padrao: e.target.value as Padrao | '' })}>
              <option value="">Todos os padrões</option>
              {(Object.keys(rotuloPadrao) as Padrao[]).map((p) => <option key={p} value={p}>{rotuloPadrao[p]}</option>)}
            </select>
          </label>
          <label className="campo"><span>Porte</span>
            <select id="filtro-porte" value={filtros.porte ?? ''} onChange={(e) => mudar({ ...filtros, porte: e.target.value as Porte | '' })}>
              <option value="">Todos os portes</option>
              {(Object.keys(rotuloPorte) as Porte[]).map((p) => <option key={p} value={p}>{rotuloPorte[p]}</option>)}
            </select>
          </label>
          <label className="campo"><span>Segmento</span>
            <select id="filtro-segmento" value={filtros.segmento ?? ''} onChange={(e) => mudar({ ...filtros, segmento: e.target.value })}>
              <option value="">Todos os segmentos</option>
              {segmentos.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="campo"><span>Gerente</span>
            <select id="filtro-gerente" value={filtros.gerente ?? ''} onChange={(e) => mudar({ ...filtros, gerente: e.target.value })}>
              <option value="">Todas as Gerentes</option>
              {gerentes.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
            </select>
          </label>
          <label className="campo"><span>Origem</span>
            <select id="filtro-origem" value={filtros.origem ?? ''} onChange={(e) => mudar({ ...filtros, origem: e.target.value as Origem | '' })}>
              <option value="">Todas as origens</option>
              {(Object.keys(rotuloOrigem) as Origem[]).map((o) => <option key={o} value={o}>{rotuloOrigem[o]}</option>)}
            </select>
          </label>
          <div className="linha entre">
            <button type="button" className="botao leve" disabled={!n} onClick={() => mudar({ busca: filtros.busca })}>Limpar</button>
            <button type="button" className="botao primario" onClick={() => setAberto(false)}>Pronto</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ativos(f: FiltrosEmpresas, usuarios: Perfil[]): { chave: Chave; rotulo: string }[] {
  const r: { chave: Chave; rotulo: string }[] = []
  if (f.padrao) r.push({ chave: 'padrao', rotulo: rotuloPadrao[f.padrao] })
  if (f.porte) r.push({ chave: 'porte', rotulo: rotuloPorte[f.porte] })
  if (f.segmento) r.push({ chave: 'segmento', rotulo: f.segmento })
  if (f.gerente) r.push({ chave: 'gerente', rotulo: nomeDe(usuarios, f.gerente) })
  if (f.origem) r.push({ chave: 'origem', rotulo: rotuloOrigem[f.origem] })
  return r
}

export function FiltrosAtivos({ filtros, mudar, usuarios }: Props) {
  const lista = ativos(filtros, usuarios)
  if (!lista.length) return null
  return (
    <div className="filtros-ativos" role="group" aria-label="Filtros ativos">
      {lista.map((a) => (
        <button key={a.chave} type="button" className="pill removivel" aria-label={`Remover filtro ${a.rotulo}`} onClick={() => mudar({ ...filtros, [a.chave]: '' })}>
          {a.rotulo}<Icone nome="fechar" tamanho={12} />
        </button>
      ))}
      <button type="button" className="ver-todos limpar" onClick={() => mudar({ busca: filtros.busca })}>Limpar filtros</button>
    </div>
  )
}

export function nomeDe(usuarios: Perfil[] | null, id: string | null): string {
  if (!id) return '—'
  return usuarios?.find((u) => u.id === id)?.nome ?? '—'
}
