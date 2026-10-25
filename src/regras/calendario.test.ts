import { describe, expect, it } from 'vitest'
import { bloqueioDeReserva, textosCalendario, type DataCalendario, type Janela } from './calendario'

const janelas: Janela[] = [
  { ano: 2026, grupo: 'master_ouro', abre_em: '2026-10-20', fecha_em: '2026-11-04' },
  { ano: 2026, grupo: 'prata', abre_em: '2026-11-05', fecha_em: '2026-11-19' },
  { ano: 2026, grupo: 'bronze', abre_em: '2026-11-20', fecha_em: '2026-12-31' },
]
const sabadoA: DataCalendario = { id: '1', data: '2026-11-28', tipo: 'A', vespera_feriado: false, situacao: 'livre', tipo_acao: null }
const prata = { padrao_final: 'prata' as const, candidata_master: false, etapa: 'proposta' }

describe('calendário (REQ-012)', () => {
  it('Prata não reserva sábado A na janela de Master e Ouro, e vê quando abre', () => {
    expect(bloqueioDeReserva(sabadoA, prata, 'ativacao', janelas, [], '2026-10-25')).toBe('Datas A: agora escolhem Master e Ouro. A janela de Prata abre em 05/11.')
    expect(bloqueioDeReserva(sabadoA, prata, 'ativacao', janelas, [], '2026-11-05')).toBeNull()
  })
  it('data confirmada não aceita outra reserva', () => {
    expect(bloqueioDeReserva({ ...sabadoA, situacao: 'confirmada' }, prata, 'ativacao', janelas, [], '2026-11-10')).toBe(textosCalendario.ocupada)
  })
  it('véspera de feriado só Bronze e Prata', () => {
    const vespera = { ...sabadoA, tipo: 'C' as const, vespera_feriado: true }
    expect(bloqueioDeReserva(vespera, { ...prata, padrao_final: 'ouro' }, 'ativacao', janelas, [], '2026-10-25')).toBe(textosCalendario.vespera)
    expect(bloqueioDeReserva(vespera, prata, 'ativacao', janelas, [], '2026-10-25')).toBeNull()
  })
  it('limites do mês: um tipo de ação e 4 dias', () => {
    const c = { ...sabadoA, tipo: 'C' as const }
    const ocupada = (dia: string, acao: 'ativacao' | 'evento'): DataCalendario => ({ id: dia, data: `2026-11-${dia}`, tipo: 'C', vespera_feriado: false, situacao: 'reservada', tipo_acao: acao })
    expect(bloqueioDeReserva(c, prata, 'evento', janelas, [ocupada('06', 'ativacao')], '2026-11-01')).toBe(textosCalendario.outroTipo)
    const quatro = ['06', '13', '20', '27'].map((d) => ocupada(d, 'ativacao'))
    expect(bloqueioDeReserva(c, prata, 'ativacao', janelas, quatro, '2026-11-01')).toBe(textosCalendario.quatroDias)
  })
  it('empresa sem conversa não reserva', () => {
    expect(bloqueioDeReserva({ ...sabadoA, tipo: 'C' }, { ...prata, etapa: 'triagem2' }, 'ativacao', janelas, [], '2026-11-01')).toBe(textosCalendario.etapa)
  })
})
