// REQ-020 — cálculos dos gráficos do painel inicial (SVG próprio).

export type PontoDia = { dia: number; quantidade: number }

// Quantas empresas chegaram em cada dia do mês (aaaa-mm), a partir das datas de chegada (ISO).
export function agruparPorDia(datas: string[], mes: string): PontoDia[] {
  const [ano, m] = mes.split('-').map(Number)
  const dias = new Date(Date.UTC(ano, m, 0)).getUTCDate()
  const contagem = new Array<number>(dias).fill(0)
  for (const d of datas) {
    const local = new Date(d).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
    if (local.slice(0, 7) === mes) contagem[Number(local.slice(8, 10)) - 1]++
  }
  return contagem.map((quantidade, i) => ({ dia: i + 1, quantidade }))
}

// Número de pontos empilhados por coluna: no máximo 8; com mais de 8 por dia, cada ponto vale mais de 1.
export function pontosDaColuna(quantidade: number, maximo: number, linhas = 8): number {
  if (quantidade <= 0 || maximo <= 0) return 0
  if (maximo <= linhas) return quantidade
  return Math.max(1, Math.round((quantidade / maximo) * linhas))
}

export type Arco = { chave: string; valor: number; percentual: number; inicio: number; fim: number }

// Arcos da rosca em graus (0 = topo, sentido horário). Valores zero não geram arco.
export function arcosDaRosca(valores: { chave: string; valor: number }[]): Arco[] {
  const total = valores.reduce((s, v) => s + Math.max(0, v.valor), 0)
  if (!total) return []
  let inicio = 0
  return valores.filter((v) => v.valor > 0).map((v) => {
    const graus = (v.valor / total) * 360
    const arco = { chave: v.chave, valor: v.valor, percentual: Math.round((v.valor / total) * 100), inicio, fim: inicio + graus }
    inicio += graus
    return arco
  })
}

const degrade = ['#142540', '#1E3358', '#2C4570', '#3F5A8A', '#56719F', '#6E89B5', '#86A0C8']

export type BarraFunil = { chave: string; rotulo: string; quantidade: number; largura: number; cor: string }

// Barras do funil: largura proporcional à maior etapa (mínimo 8% quando há empresa; etapa vazia não tem barra), degradê de azul.
export function barrasDoFunil(etapas: { chave: string; rotulo: string; quantidade: number }[]): BarraFunil[] {
  const maior = Math.max(0, ...etapas.map((e) => e.quantidade))
  return etapas.map((e, i) => ({
    ...e,
    largura: e.quantidade > 0 && maior ? Math.max(8, Math.round((e.quantidade / maior) * 100)) : 0,
    cor: degrade[Math.min(i, degrade.length - 1)],
  }))
}

export function pontoNoCirculo(cx: number, cy: number, r: number, graus: number): [number, number] {
  const rad = ((graus - 90) * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}
