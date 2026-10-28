// Formatação e validação de dados brasileiros usados no CRM.

export const soDigitos = (v: string) => v.replace(/\D/g, '')

export function formatarCnpj(v: string | null | undefined): string {
  const d = soDigitos(v ?? '')
  if (d.length !== 14) return v ?? '—'
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

// Dígitos verificadores do CNPJ (Receita Federal).
export function cnpjValido(v: string): boolean {
  const d = soDigitos(v)
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false
  const dv = (base: string) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const soma = base.split('').reduce((s, c, i) => s + Number(c) * pesos[i], 0)
    const r = soma % 11
    return r < 2 ? 0 : 11 - r
  }
  return dv(d.slice(0, 12)) === Number(d[12]) && dv(d.slice(0, 13)) === Number(d[13])
}

const fusoClub = 'America/Sao_Paulo'

export function formatarData(v: string | Date | null | undefined): string {
  if (!v) return '—'
  const data = typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00Z`) : new Date(v)
  return data.toLocaleDateString('pt-BR', { timeZone: fusoClub })
}

export function formatarDataHora(v: string | Date | null | undefined): string {
  if (!v) return '—'
  return new Date(v).toLocaleString('pt-BR', { timeZone: fusoClub, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatarDinheiro(centavos: number | null | undefined): string {
  if (centavos === null || centavos === undefined) return 'R$ …'
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function diasDesde(v: string | Date, hoje = new Date()): number {
  return Math.max(0, Math.floor((hoje.getTime() - new Date(v).getTime()) / 86_400_000))
}

export function hojeISO(hoje = new Date()): string {
  return hoje.toLocaleDateString('en-CA', { timeZone: fusoClub })
}

// "1.234,56" ou "1234,5" → centavos; vazio → null; inválido → undefined.
export function reaisParaCentavos(v: string): number | null | undefined {
  const t = v.replace(/^R\$\s*/, '').trim()
  if (!t) return null
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(t)) return undefined
  const [inteiro, dec = ''] = t.replace(/\./g, '').split(',')
  return Number(inteiro) * 100 + Number(dec.padEnd(2, '0'))
}

export function centavosParaReais(c: number | null | undefined): string {
  return c === null || c === undefined ? '' : (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
