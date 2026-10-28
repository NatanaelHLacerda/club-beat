import type { Etapa } from '../regras/etapas'
import type { MarcasTriagem1, SituacaoCategoria, SituacaoReceita } from '../regras/triagem1'
import type { Aderencia, FaixaInvestimento, Pontos } from '../regras/classificacao'
import type { FichaPassagem } from '../regras/passagem'
import type { SituacaoData, TipoAcao, TipoData } from '../regras/calendario'
import type { ConfirmacaoOperacoes, Formato, Proposta, Reuniao, TipoParceria } from '../regras/proposta'
import type { RegistroDirecao } from '../regras/direcao'
import type { RegistroContrato } from '../regras/contrato'
import type { Renovacao } from '../regras/renovacao'

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
  /* REQ-040 — caminho da foto no bucket fotos-perfil; null sem foto. */
  foto_caminho: string | null
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
  decisor_nome: string | null
  decisor_email: string | null
  decisor_whatsapp: string | null
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
  categoria: string | null
  triagem1: MarcasTriagem1
  receita_situacao: SituacaoReceita | null
  receita_porte: 'ME' | 'EPP' | 'demais' | null
  pedido_info_em: string | null
  classificacao: FichaClassificacao
  estudo: string | null
  candidata_master: boolean
  triagem2_concluida_em: string | null
  passada_em: string | null
  distribuicao: 'revezamento' | 'manual' | null
  passagem: FichaPassagem
  reuniao: Reuniao
  formato: Formato | null
  tipo_parceria: TipoParceria | null
  proposta: Proposta
  operacoes: ConfirmacaoOperacoes
  direcao: RegistroDirecao
  fila_master: boolean
  contrato: RegistroContrato
  exemplo: boolean
  criado_em: string
}

export type PastaJuridica = 'minutas' | 'diretrizes'
export const rotuloPasta: Record<PastaJuridica, string> = { minutas: 'Minutas Contratuais', diretrizes: 'Regras de Classificação (Diretrizes)' }

export type DocumentoJuridico = {
  id: string; pasta: PastaJuridica; titulo: string; descricao: string | null; caminho: string
  nome_arquivo: string; tamanho: number; enviado_por: string | null; criado_em: string
}

export type CamposEditaveis = Omit<Empresa,
  'id' | 'etapa' | 'etapa_desde' | 'motivo_saida' | 'retomar_em' | 'gerente1_id' | 'gerente2_id' | 'responsavel_id' |
  'porte' | 'padrao_final' | 'exemplo' | 'criado_em' | 'consentimento_em' |
  'categoria' | 'triagem1' | 'receita_situacao' | 'receita_porte' | 'pedido_info_em' |
  'classificacao' | 'estudo' | 'candidata_master' | 'triagem2_concluida_em' | 'passada_em' | 'distribuicao' | 'passagem' |
  'reuniao' | 'formato' | 'tipo_parceria' | 'proposta' | 'operacoes' | 'direcao' | 'fila_master' | 'contrato'>

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
  /* Empresas › Geral (sem recusadas) ou Empresas › Recusadas; sem valor, todas (Funil). */
  recorte?: 'geral' | 'recusadas' | 'funil' | 'historico'
}

// ── Mensagens (REQ-015) ───────────────────────────────────────────
export type ModeloMensagem = { codigo: string; titulo: string; texto: string; automatico: boolean; interno: boolean; ordem: number; atualizado_em: string }
export type Canal = 'email' | 'whatsapp' | 'interno'
export type Mensagem = {
  id: number; empresa_id: string; modelo: string | null; canal: Canal; destinatario: string | null; texto: string
  situacao: 'aguardando_envio' | 'copiada' | 'registrada'; autor_id: string | null; em: string
}
export const rotuloSituacaoMensagem: Record<Mensagem['situacao'], string> = { aguardando_envio: 'Aguardando envio', copiada: 'Copiada', registrada: 'Registrada' }

// ── Avisos (REQ-002, completados no REQ-014) ──────────────────────
export type Aviso = { id: number; usuario_id: string; empresa_id: string | null; tipo: string; texto: string; lido_em: string | null; em: string }

// ── Primeira triagem (REQ-005) ────────────────────────────────────
export type Categoria = { nome: string; situacao: SituacaoCategoria; ordem: number }

// ── Classificação (REQ-006) ───────────────────────────────────────
export type FichaClassificacao = {
  industria?: boolean
  grupo?: boolean
  grupo_faixa?: string | null
  nota_porte?: string | null
  provisorio?: boolean
  aderencia?: Aderencia
  pontos?: Pontos
  faixa_investimento?: FaixaInvestimento | null
  padrao_pontos?: Padrao | null
}
export type Conflito = { marca: string; fim: string }

// ── Calendário (REQ-012) ──────────────────────────────────────────
export type DataDoCalendario = {
  id: string; data: string; tipo: TipoData; vespera_feriado: boolean; aula: string | null; horario: string | null
  media_alunos: number | null; tema: string | null; situacao: SituacaoData; empresa_id: string | null; tipo_acao: TipoAcao | null
  reservada_em: string | null; reservada_ate: string | null; reservada_por: string | null; exemplo: boolean
}

// ── Parcerias ativas (REQ-011) ────────────────────────────────────
export type Parceria = {
  id: string; empresa_id: string; situacao: 'vigente' | 'encerrada'; inicio: string; fim: string
  exclusividade_categoria: string | null; exclusividade_inicio: string | null; exclusividade_fim: string | null; nao_renovar: boolean
  padrao: Padrao | null; tipo_parceria: string | null; valor_mensal_centavos: number | null; troca: boolean
  contrapartidas: { item: string; quantidade: number | null }[]; promessa_revisao: string | null; responsavel_id: string | null
  medidas_informadas_em: string | null; criado_em: string; renovacao: Renovacao
}
export type ParceriaComEmpresa = Parceria & { empresas: Pick<Empresa, 'id' | 'marca' | 'etapa' | 'exemplo' | 'categoria'> }
export type Entrega = { id: string; parceria_id: string; item: string; data: string; descricao: string | null; privacidade_ok: boolean; nota_membros: number | null; autor_id: string | null; criado_em: string }
export type Material = { id: string; parceria_id: string; descricao: string; situacao: 'aguardando' | 'aprovado' | 'recusado'; motivo: string | null; decidido_por: string | null; decidido_em: string | null; criado_em: string }
export type Relatorio = { id: string; parceria_id: string; tipo: 'relatorio' | 'balanco'; referencia: string; resumo: string; enviado_em: string; autor_id: string | null }

// ── Prazos (REQ-014) ──────────────────────────────────────────────
export type PrazoAberto = {
  empresa_id: string; marca: string; etapa: Etapa; descricao: string; prazo: string
  responsavel_id: string | null; papel_responsavel: Papel; situacao: 'no_prazo' | 'vence_hoje' | 'atrasado'
}
