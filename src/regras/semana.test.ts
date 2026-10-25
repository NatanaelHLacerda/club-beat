import { describe, expect, it } from 'vitest'
import { diasDaSemana, gradeDoMes, inicioDaSemana, minutosDoHorario, somarMeses } from './semana'

describe('visões do calendário (REQ-023)', () => {
  it('semana de domingo a sábado', () => {
    expect(inicioDaSemana('2026-10-28')).toBe('2026-10-25')
    expect(diasDaSemana('2026-10-25')).toEqual(['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'])
  })
  it('grade do mês com semanas completas', () => {
    const g = gradeDoMes('2026-11')
    expect(g[0][0]).toEqual({ data: '2026-11-01', doMes: true })
    expect(g.at(-1)!.at(-1)!.data).toBe('2026-12-05')
    expect(g.flat().filter((d) => d.doMes)).toHaveLength(30)
  })
  it('dezembro fecha certo na virada do ano', () => {
    expect(gradeDoMes('2026-12').flat().filter((d) => d.doMes)).toHaveLength(31)
    expect(somarMeses('2026-12', 1)).toBe('2027-01')
    expect(somarMeses('2027-01', -1)).toBe('2026-12')
  })
  it('horário em minutos', () => {
    expect(minutosDoHorario('09:00')).toBe(540)
    expect(minutosDoHorario('18:30')).toBe(1110)
    expect(minutosDoHorario('')).toBeNull()
  })
})
