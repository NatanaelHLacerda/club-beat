// REQ-010 — pacote, conferência do contrato (cap. 12) e assinatura. O banco repete as travas.
import { soDigitos } from './formato'

export function cpfValido(v: string): boolean {
  const d = soDigitos(v)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const dv = (n: number) => {
    const soma = d.slice(0, n).split('').reduce((s, c, i) => s + Number(c) * (n + 1 - i), 0)
    const r = (soma * 10) % 11
    return r === 10 ? 0 : r
  }
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10])
}

export const mascararCpf = (v: string) => {
  const d = soDigitos(v)
  return d.length === 11 ? `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**` : '—'
}

export const itensConferencia = [
  { id: 'partes', rotulo: 'Partes: razão social, CNPJ e quem assina' },
  { id: 'objeto', rotulo: 'Objeto: tipo de parceria e padrão' },
  { id: 'prazo', rotulo: 'Prazo: início e fim, sem renovação automática' },
  { id: 'entregas', rotulo: 'O que cada lado entrega, em lista numerada' },
  { id: 'valor', rotulo: 'Valor e forma de pagamento (ou valor de referência da troca)' },
  { id: 'datas', rotulo: 'Datas dos eventos e regra para mudar' },
  { id: 'aprovacao_material', rotulo: 'Aprovação de material pelo Club; custos do parceiro' },
  { id: 'fornecedor_reserva', rotulo: 'Fornecedor reserva (categorias de consumo) ou "não se aplica"' },
  { id: 'exclusividade', rotulo: 'Exclusividade descrita, ou "não há"' },
  { id: 'nao_promete', rotulo: 'O que o Club não promete: público, vendas, retorno' },
  { id: 'privacidade', rotulo: 'Privacidade: sem gravar membros, sem dados deles (LGPD)' },
  { id: 'uso_marca', rotulo: 'Uso de marca só para a parceria' },
  { id: 'fim_antecipado', rotulo: 'Fim antecipado: casos, aviso, entregas e dinheiro' },
  { id: 'responsabilidade', rotulo: 'Responsabilidade por danos, acidentes e produtos' },
  { id: 'beneficio_colaboradores', rotulo: 'Benefício a colaboradores: taxa de entrada sim, mensalidade não' },
  { id: 'foro', rotulo: 'Foro' },
  { id: 'tipo_minuta', rotulo: 'Minuta do tipo certo e igual à proposta aceita' },
] as const

export type ItemConferencia = (typeof itensConferencia)[number]['id']
export type Conferencia = Partial<Record<ItemConferencia, boolean>>
export type TipoMinuta = 'patrocinio' | 'industria' | 'servico' | 'troca'

export type RegistroContrato = {
  enviado_juridico_em?: string; prazo_juridico?: string; minuta_tipo?: TipoMinuta; conferencia?: Conferencia
  divergencia?: string | null; pronto_em?: string | null; pronto_por?: string | null; prazo_assinatura?: string | null
  assinado_em?: string; assinado_por?: string
}

export type Pacote = { endereco: string; signatario_nome: string; signatario_cpf: string; email_assinatura: string }

export const textosContrato = {
  semCpf: 'Informe o CPF de quem assina.',
  cpfInvalido: 'CPF inválido.',
  conferencia: 'Confira todos os itens da lista antes de marcar pronto para assinar.',
  testemunhas: 'Marque a assinatura das duas testemunhas.',
  datas: 'Informe início e fim do contrato (o fim depois do início).',
} as const

export function pendenciasPacote(p: Partial<Pacote>): Partial<Record<keyof Pacote, string>> {
  const e: Partial<Record<keyof Pacote, string>> = {}
  if (!p.endereco?.trim()) e.endereco = 'Informe o endereço da empresa.'
  if (!p.signatario_nome?.trim()) e.signatario_nome = 'Informe o nome de quem assina.'
  if (!p.signatario_cpf?.trim()) e.signatario_cpf = textosContrato.semCpf
  else if (!cpfValido(p.signatario_cpf)) e.signatario_cpf = textosContrato.cpfInvalido
  if (!p.email_assinatura?.trim()) e.email_assinatura = 'Informe o e-mail para a assinatura digital.'
  return e
}

export const pendenciasConferencia = (c: Conferencia) => itensConferencia.filter((i) => !c[i.id]).map((i) => i.rotulo)

export function validarAssinatura(inicio: string, fim: string, testemunhas: boolean): string | null {
  if (!inicio || !fim || fim < inicio) return textosContrato.datas
  if (!testemunhas) return textosContrato.testemunhas
  return null
}
