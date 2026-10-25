import { segmentos } from '../dados/campos'
import { rotuloOrigem, rotuloPadrao, rotuloPorte, type FiltrosEmpresas, type Origem, type Padrao, type Perfil, type Porte } from '../dados/tipos'

type Props = { filtros: FiltrosEmpresas; mudar: (f: FiltrosEmpresas) => void; usuarios: Perfil[]; busca?: boolean; total?: number }

export function Filtros({ filtros, mudar, usuarios, busca, total }: Props) {
  const gerentes = usuarios.filter((u) => u.papel === 'gerente')
  return (
    <div className="filtros-linha" role="group" aria-label="Filtros">
      {busca && (
        <input className="entrada" style={{ maxWidth: 260 }} id="filtro-busca" placeholder="Buscar por marca, razão social ou CNPJ"
          value={filtros.busca ?? ''} onChange={(e) => mudar({ ...filtros, busca: e.target.value })} />
      )}
      <select className="entrada" style={{ width: 'auto' }} id="filtro-padrao" aria-label="Padrão" value={filtros.padrao ?? ''} onChange={(e) => mudar({ ...filtros, padrao: e.target.value as Padrao | '' })}>
        <option value="">Todos os padrões</option>
        {(Object.keys(rotuloPadrao) as Padrao[]).map((p) => <option key={p} value={p}>{rotuloPadrao[p]}</option>)}
      </select>
      <select className="entrada" style={{ width: 'auto' }} id="filtro-porte" aria-label="Porte" value={filtros.porte ?? ''} onChange={(e) => mudar({ ...filtros, porte: e.target.value as Porte | '' })}>
        <option value="">Todos os portes</option>
        {(Object.keys(rotuloPorte) as Porte[]).map((p) => <option key={p} value={p}>{rotuloPorte[p]}</option>)}
      </select>
      <select className="entrada" style={{ width: 'auto' }} id="filtro-segmento" aria-label="Segmento" value={filtros.segmento ?? ''} onChange={(e) => mudar({ ...filtros, segmento: e.target.value })}>
        <option value="">Todos os segmentos</option>
        {segmentos.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="entrada" style={{ width: 'auto' }} id="filtro-gerente" aria-label="Gerente" value={filtros.gerente ?? ''} onChange={(e) => mudar({ ...filtros, gerente: e.target.value })}>
        <option value="">Todas as Gerentes</option>
        {gerentes.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
      </select>
      <select className="entrada" style={{ width: 'auto' }} id="filtro-origem" aria-label="Origem" value={filtros.origem ?? ''} onChange={(e) => mudar({ ...filtros, origem: e.target.value as Origem | '' })}>
        <option value="">Todas as origens</option>
        {(Object.keys(rotuloOrigem) as Origem[]).map((o) => <option key={o} value={o}>{rotuloOrigem[o]}</option>)}
      </select>
      {Object.values(filtros).some(Boolean) && <button className="botao leve" onClick={() => mudar({})}>Limpar filtros</button>}
      {total !== undefined && <span className="muted pequeno num">{total} {total === 1 ? 'resultado' : 'resultados'}</span>}
    </div>
  )
}

export function nomeDe(usuarios: Perfil[] | null, id: string | null): string {
  if (!id) return '—'
  return usuarios?.find((u) => u.id === id)?.nome ?? '—'
}
