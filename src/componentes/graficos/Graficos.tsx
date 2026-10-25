// REQ-020 — gráficos do painel inicial em SVG próprio, com resumo em texto para leitores de tela.
import { arcosDaRosca, barrasDoFunil, pontoNoCirculo, pontosDaColuna, type PontoDia } from '../../regras/graficos'

// ── Barras em pontos (kit: "Analytics") ─────────────────────────
export function GraficoPontos({ dias, titulo }: { dias: PontoDia[]; titulo: string }) {
  const maximo = Math.max(0, ...dias.map((d) => d.quantidade))
  const linhas = 8
  const larguraCol = 18
  const largura = dias.length * larguraCol + 20
  const altura = linhas * 14 + 40
  const pico = dias.reduce((m, d) => (d.quantidade > m.quantidade ? d : m), { dia: 0, quantidade: 0 })
  const total = dias.reduce((s, d) => s + d.quantidade, 0)
  return (
    <figure className="grafico">
      <svg viewBox={`0 0 ${largura} ${altura}`} role="img" aria-label={`${titulo}: ${total} no mês${pico.quantidade ? `, maior dia ${pico.dia} com ${pico.quantidade}` : ''}.`}>
        {dias.map((d, i) => {
          const n = pontosDaColuna(d.quantidade, maximo, linhas)
          const x = 14 + i * larguraCol
          return (
            <g key={d.dia}>
              {Array.from({ length: linhas }, (_, j) => (
                <circle key={j} cx={x} cy={altura - 26 - j * 14} r={4.5}
                  fill={j < n ? (d.dia === pico.dia && pico.quantidade ? '#142540' : '#3F5A8A') : '#E8DFCC'} />
              ))}
              {(d.dia === 1 || d.dia % 5 === 0) && <text x={x} y={altura - 6} textAnchor="middle" className="eixo">{d.dia}</text>}
              {d.dia === pico.dia && pico.quantidade > 0 && (
                <text x={x} y={altura - 34 - linhas * 14 + 6} textAnchor="middle" className="valor-grafico">{d.quantidade}</text>
              )}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

// ── Funil em barras (guia da marca: degradê de azul) ────────────
export function FunilBarras({ etapas }: { etapas: { chave: string; rotulo: string; quantidade: number }[] }) {
  const barras = barrasDoFunil(etapas)
  return (
    <div className="funil-barras" role="img" aria-label={`Funil: ${etapas.map((e) => `${e.rotulo} ${e.quantidade}`).join(', ')}.`}>
      {barras.map((b) => (
        <div key={b.chave} className="funil-linha">
          <span className="pequeno muted funil-rotulo">{b.rotulo}</span>
          <span className="funil-trilho"><span style={{ width: `${b.largura}%`, background: b.cor }} /></span>
          <b className="num funil-num">{b.quantidade}</b>
        </div>
      ))}
    </div>
  )
}

// ── Rosca (kit: "Projects Summary") ─────────────────────────────
const corPadrao: Record<string, string> = { bronze: '#8C5A2B', prata: '#9AA1AD', ouro: '#D2AE6A', master: '#142540' }
const rotuloPadrao: Record<string, string> = { bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro', master: 'Master' }

export function Rosca({ valores, centro }: { valores: { chave: string; valor: number }[]; centro: string }) {
  const arcos = arcosDaRosca(valores)
  const total = valores.reduce((s, v) => s + v.valor, 0)
  const cx = 70, cy = 70, r = 54
  const caminho = (inicio: number, fim: number) => {
    if (fim - inicio >= 359.99) return null
    const [x1, y1] = pontoNoCirculo(cx, cy, r, inicio)
    const [x2, y2] = pontoNoCirculo(cx, cy, r, fim)
    return `M ${x1} ${y1} A ${r} ${r} 0 ${fim - inicio > 180 ? 1 : 0} 1 ${x2} ${y2}`
  }
  return (
    <div className="rosca">
      <svg viewBox="0 0 140 140" role="img" aria-label={`${centro}: ${valores.map((v) => `${rotuloPadrao[v.chave] ?? v.chave} ${v.valor}`).join(', ')}.`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8DFCC" strokeWidth={14} />
        {arcos.map((a) => {
          const d = caminho(a.inicio, a.fim)
          return d
            ? <path key={a.chave} d={d} fill="none" stroke={corPadrao[a.chave] ?? '#3F5A8A'} strokeWidth={14} />
            : <circle key={a.chave} cx={cx} cy={cy} r={r} fill="none" stroke={corPadrao[a.chave] ?? '#3F5A8A'} strokeWidth={14} />
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" className="rosca-total">{total}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="eixo">{centro}</text>
      </svg>
      <ul className="legenda">
        {valores.map((v) => (
          <li key={v.chave}><span className="ponto" style={{ background: corPadrao[v.chave] ?? '#3F5A8A' }} />{rotuloPadrao[v.chave] ?? v.chave}<b className="num">{v.valor}</b>
            <span className="muted pequeno">{total ? `${Math.round((v.valor / total) * 100)}%` : '—'}</span></li>
        ))}
      </ul>
    </div>
  )
}
