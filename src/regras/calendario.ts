// REQ-012 — regras do calendário. O banco repete as mesmas em reservar_data.
import type { Padrao } from '../dados/tipos'

export type TipoData = 'A' | 'B' | 'C'
export type SituacaoData = 'livre' | 'reservada' | 'confirmada'
export type TipoAcao = 'ativacao' | 'evento' | 'aula_fechada'
export type GrupoJanela = 'master_ouro' | 'prata' | 'bronze'

export const rotuloTipoData: Record<TipoData, string> = { A: 'A · alta procura', B: 'B · procura média', C: 'C · livre' }
export const rotuloTipoAcao: Record<TipoAcao, string> = { ativacao: 'Ativação', evento: 'Evento', aula_fechada: 'Aula fechada' }
export const rotuloGrupo: Record<GrupoJanela, string> = { master_ouro: 'Master e Ouro', prata: 'Prata', bronze: 'Bronze' }

export type DataCalendario = { id: string; data: string; tipo: TipoData; vespera_feriado: boolean; situacao: SituacaoData; tipo_acao: TipoAcao | null }
export type Janela = { ano: number; grupo: GrupoJanela; abre_em: string; fecha_em: string }

export const textosCalendario = {
  vespera: 'Véspera de feriado: só empresas Bronze e Prata.',
  ocupada: 'Esta data já está reservada ou confirmada.',
  outroTipo: 'Este mês já tem outro tipo de ação.',
  quatroDias: 'Este mês já tem 4 dias de ação.',
  etapa: 'A empresa precisa estar em conversa (reunião, proposta, Direção ou contrato) para reservar.',
} as const

export const limiteDiasMes = 4

export function grupoDoPadrao(padrao: Padrao | null, candidataMaster = false): GrupoJanela {
  if (candidataMaster || padrao === 'master' || padrao === 'ouro') return 'master_ouro'
  return padrao === 'prata' ? 'prata' : 'bronze'
}

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// Mensagem de bloqueio da janela para datas A, ou null se pode escolher.
export function bloqueioDeJanela(janelas: Janela[], ano: number, grupo: GrupoJanela, hoje: string): string | null {
  const minha = janelas.find((j) => j.ano === ano && j.grupo === grupo)
  if (!minha || hoje >= minha.abre_em) return null
  const aberta = janelas.find((j) => j.ano === ano && hoje >= j.abre_em && hoje <= j.fecha_em)
  return `Datas A: agora escolhem ${aberta ? rotuloGrupo[aberta.grupo] : 'ninguém'}. A janela de ${rotuloGrupo[grupo]} abre em ${ddmm(minha.abre_em)}.`
}

export type EmpresaReserva = { padrao_final: Padrao | null; candidata_master: boolean; etapa: string }
const etapasQueReservam = ['reuniao', 'proposta', 'direcao', 'contrato', 'ativa', 'renovacao']

export function bloqueioDeReserva(d: DataCalendario, e: EmpresaReserva, acao: TipoAcao, janelas: Janela[], mesmoMes: DataCalendario[], hoje: string): string | null {
  if (d.situacao !== 'livre') return textosCalendario.ocupada
  if (!etapasQueReservam.includes(e.etapa)) return textosCalendario.etapa
  if (d.vespera_feriado && e.padrao_final !== 'bronze' && e.padrao_final !== 'prata') return textosCalendario.vespera
  if (d.tipo === 'A') {
    const b = bloqueioDeJanela(janelas, Number(d.data.slice(0, 4)), grupoDoPadrao(e.padrao_final, e.candidata_master), hoje)
    if (b) return b
  }
  const ocupadas = mesmoMes.filter((x) => x.situacao !== 'livre' && x.data.slice(0, 7) === d.data.slice(0, 7))
  if (ocupadas.some((x) => x.tipo_acao && x.tipo_acao !== acao)) return textosCalendario.outroTipo
  if (ocupadas.length >= limiteDiasMes) return textosCalendario.quatroDias
  return null
}

// Padrão com prioridade numa data, para a coluna do modelo do cap. 10.
export function prioridadeDaData(d: Pick<DataCalendario, 'tipo' | 'vespera_feriado'>): string {
  if (d.vespera_feriado) return 'Bronze e Prata'
  if (d.tipo === 'A') return 'Master / Ouro'
  return d.tipo === 'B' ? 'Ordem de chegada' : 'Qualquer padrão'
}
