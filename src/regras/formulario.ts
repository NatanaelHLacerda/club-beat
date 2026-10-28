// REQ-002 — validação das 5 etapas do formulário público. O banco repete a validação em enviar_ficha.
import { validarDecisor } from './decisor'
import { cnpjValido } from './formato'

export type Ficha = {
  cnpj: string; razao_social: string; marca: string; cidade: string; uf: string; bairro: string; segmento: string
  site: string; instagram: string; tempo_atuacao: string; faixa_faturamento: string; faixa_funcionarios: string; unidades: string
  contato_nome: string; contato_cargo: string; contato_whatsapp: string; contato_email: string; quem_decide: string
  decisor_nome: string; decisor_email: string; decisor_whatsapp: string
  busca: string[]; motivo_parceria: string; objetivo: string; publico: string; parcerias_anteriores: string
  investimento_faixa: string; inicio_desejado: string; duracao: string; datas_interesse: string; indicado_por: string
  aceite_nao_proposta: boolean; consentimento: boolean
}

export const fichaVazia: Ficha = {
  cnpj: '', razao_social: '', marca: '', cidade: '', uf: '', bairro: '', segmento: '', site: '', instagram: '',
  tempo_atuacao: '', faixa_faturamento: '', faixa_funcionarios: '', unidades: '', contato_nome: '', contato_cargo: '',
  contato_whatsapp: '', contato_email: '', quem_decide: '', decisor_nome: '', decisor_email: '', decisor_whatsapp: '', busca: [], motivo_parceria: '', objetivo: '', publico: '',
  parcerias_anteriores: '', investimento_faixa: '', inicio_desejado: '', duracao: '', datas_interesse: '', indicado_por: '',
  aceite_nao_proposta: false, consentimento: false,
}

export const textosFormulario = {
  obrigatorio: 'Preencha este campo.',
  cnpj: 'CNPJ inválido',
  arquivoGrande: 'Arquivo acima de 20 MB',
  consentimento: 'Marque o consentimento de privacidade para enviar.',
  aceite: 'Marque que o envio não é uma proposta.',
  siteOuInstagram: 'Informe o site ou o Instagram.',
  email: 'E-mail inválido.',
  motivoLongo: 'O motivo pode ter até 800 caracteres.',
  enviado: 'Recebemos a sua ficha. Nossa equipe responde em até 1 dia útil. Este envio ainda não é uma proposta.',
} as const

export const titulosEtapas = ['Sobre a empresa', 'Quem é o responsável', 'Sobre a parceria', 'Portfólio e materiais', 'Envio']

export const limiteArquivo = 20 * 1024 * 1024
export const tiposAceitos = '.pdf,.ppt,.pptx,.png,.jpg,.jpeg,.svg'

export type Erros = Partial<Record<keyof Ficha | 'arquivos', string>>

const exigir = (erros: Erros, f: Ficha, campos: (keyof Ficha)[]) => {
  for (const c of campos) {
    const v = f[c]
    if (typeof v === 'string' && !v.trim()) erros[c] = textosFormulario.obrigatorio
  }
}

export function validarEtapa(etapa: number, f: Ficha, arquivos: { tamanho: number }[] = []): Erros {
  const erros: Erros = {}
  if (etapa === 1) {
    exigir(erros, f, ['cnpj', 'razao_social', 'marca', 'cidade', 'uf', 'segmento', 'tempo_atuacao', 'faixa_faturamento', 'faixa_funcionarios'])
    if (f.cnpj.trim() && !cnpjValido(f.cnpj)) erros.cnpj = textosFormulario.cnpj
    if (!f.site.trim() && !f.instagram.trim()) erros.site = textosFormulario.siteOuInstagram
  }
  if (etapa === 2) {
    exigir(erros, f, ['contato_nome', 'contato_cargo', 'contato_whatsapp', 'contato_email'])
    if (f.contato_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contato_email.trim())) erros.contato_email = textosFormulario.email
    Object.assign(erros, validarDecisor(f))
  }
  if (etapa === 3) {
    exigir(erros, f, ['motivo_parceria', 'objetivo', 'publico'])
    if (!f.busca.length) erros.busca = textosFormulario.obrigatorio
    if (f.motivo_parceria.length > 800) erros.motivo_parceria = textosFormulario.motivoLongo
  }
  if (etapa === 4) {
    if (arquivos.some((a) => a.tamanho > limiteArquivo)) erros.arquivos = textosFormulario.arquivoGrande
  }
  if (etapa === 5) {
    if (!f.aceite_nao_proposta) erros.aceite_nao_proposta = textosFormulario.aceite
    if (!f.consentimento) erros.consentimento = textosFormulario.consentimento
  }
  return erros
}
