import type { Etapa } from '../regras/etapas'

export type Papel = 'primeira_pessoa' | 'gerente' | 'direcao' | 'juridico' | 'financeiro' | 'operacoes'

export const rotuloPapel: Record<Papel, string> = {
  primeira_pessoa: '1ª pessoa',
  gerente: 'Gerente',
  direcao: 'Direção',
  juridico: 'Jurídico',
  financeiro: 'Financeiro',
  operacoes: 'Operações',
}

export type Perfil = {
  id: string
  nome: string
  email: string
  papel: Papel
  admin: boolean
  disponivel: boolean
  ativo: boolean
}

// ── Empresas e funil (REQ-004) ────────────────────────────────────
export type { Etapa }

export type Origem = 'site' | 'indicacao_membro' | 'indicacao_funcionario' | 'indicacao_direcao' | 'whatsapp' | 'email' | 'contato_direto'
export const rotuloOrigem: Record<Origem, string> = {
  site: 'Site',
  indicacao_membro: 'Indicação de membro',
  indicacao_funcionario: 'Indicação de funcionário',
  indicacao_direcao: 'Indicação da Direção',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  contato_direto: 'Contato direto',
}

export type Porte = 'pequena' | 'media1' | 'media2' | 'grande'
export const rotuloPorte: Record<Porte, string> = { pequena: 'Pequena', media1: 'Média I', media2: 'Média II', grande: 'Grande' }

export type Padrao = 'bronze' | 'prata' | 'ouro' | 'master'
export const rotuloPadrao: Record<Padrao, string> = { bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro', master: 'Master' }

export type Empresa = {
  id: string
  cnpj: string
  razao_social: string
  marca: string
  cidade: string | null
  uf: string | null
  bairro: string | null
  segmento: string
  site: string | null
  instagram: string | null
  tempo_atuacao: string | null
  faixa_faturamento: string | null
  faixa_funcionarios: string | null
  unidades: number | null
  contato_nome: string
  contato_cargo: string | null
  contato_whatsapp: string | null
  contato_email: string | null
  quem_decide: string | null
  busca: string[]
  motivo_parceria: string | null
  objetivo: string | null
  publico: string | null
  parcerias_anteriores: string | null
  investimento_faixa: string | null
  inicio_desejado: string | null
  duracao: string | null
  datas_interesse: string | null
  origem: Origem
  indicado_por: string | null
  consentimento_em: string | null
  etapa: Etapa
  etapa_desde: string
  motivo_saida: string | null
  retomar_em: string | null
  gerente1_id: string | null
  gerente2_id: string | null
  responsavel_id: string | null
  porte: Porte | null
  padrao_final: Padrao | null
  exemplo: boolean
  criado_em: string
}

export type CamposEditaveis = Omit<Empresa,
  'id' | 'etapa' | 'etapa_desde' | 'motivo_saida' | 'retomar_em' | 'gerente1_id' | 'gerente2_id' | 'responsavel_id' |
  'porte' | 'padrao_final' | 'exemplo' | 'criado_em' | 'consentimento_em'>

export type ItemHistorico = {
  id: number
  empresa_id: string
  tipo: 'etapa' | 'nota' | 'edicao' | 'mensagem' | 'sistema'
  de_etapa: Etapa | null
  para_etapa: Etapa | null
  campos: string[] | null
  texto: string | null
  autor_id: string | null
  em: string
}

export type TipoAnexo = 'portfolio' | 'apresentacao' | 'logotipo' | 'aceite' | 'minuta' | 'contrato' | 'entrega' | 'outro'
export const rotuloAnexo: Record<TipoAnexo, string> = {
  portfolio: 'Portfólio', apresentacao: 'Apresentação', logotipo: 'Logotipo', aceite: 'Aceite',
  minuta: 'Minuta', contrato: 'Contrato', entrega: 'Entrega', outro: 'Outro',
}

export type Anexo = {
  id: string
  empresa_id: string
  tipo: TipoAnexo
  caminho: string
  nome: string
  tamanho: number
  autor_id: string | null
  criado_em: string
}

export type FiltrosEmpresas = {
  padrao?: Padrao | ''
  porte?: Porte | ''
  segmento?: string
  gerente?: string
  origem?: Origem | ''
  busca?: string
}
