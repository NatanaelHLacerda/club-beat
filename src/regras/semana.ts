// REQ-023 — datas das visões Semana e Mês do calendário (datas ISO aaaa-mm-dd, sem fuso).
const data = (iso: string) => new Date(`${iso}T12:00:00Z`)
const iso = (d: Date) => d.toISOString().slice(0, 10)

export function somarDias(dia: string, n: number): string {
  const d = data(dia)
  d.setUTCDate(d.getUTCDate() + n)
  return iso(d)
}

// Semana de domingo a sábado.
export function inicioDaSemana(dia: string): string {
  return somarDias(dia, -data(dia).getUTCDay())
}

export function diasDaSemana(dia: string): string[] {
  const ini = inicioDaSemana(dia)
  return Array.from({ length: 7 }, (_, i) => somarDias(ini, i))
}

export type DiaDaGrade = { data: string; doMes: boolean }

// Semanas completas (domingo a sábado) que cobrem o mês aaaa-mm.
export function gradeDoMes(mes: string): DiaDaGrade[][] {
  const primeiro = `${mes}-01`
  const ultimo = somarDias(`${somarMeses(mes, 1)}-01`, -1)
  const semanas: DiaDaGrade[][] = []
  for (let ini = inicioDaSemana(primeiro); ini <= ultimo; ini = somarDias(ini, 7)) {
    semanas.push(Array.from({ length: 7 }, (_, i) => { const d = somarDias(ini, i); return { data: d, doMes: d.slice(0, 7) === mes } }))
  }
  return semanas
}

export function somarMeses(mes: string, n: number): string {
  const [a, m] = mes.split('-').map(Number)
  const t = a * 12 + (m - 1) + n
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`
}

// "09:00" → 540; texto sem hora → null.
export function minutosDoHorario(h: string | null | undefined): number | null {
  const m = h?.match(/^(\d{1,2})[:h](\d{2})?/)
  if (!m) return null
  const horas = Number(m[1])
  return horas < 24 ? horas * 60 + Number(m[2] ?? 0) : null
}
