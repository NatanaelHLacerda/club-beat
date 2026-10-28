// REQ-042 — quem decide a parceria. Quando é outra pessoa, nome, e-mail e WhatsApp do decisor são obrigatórios.
// O banco repete a regra (enviar_ficha, requisitos_triagem2); aqui ela serve a formulário, ficha e Triagem 2.
export const decideEuMesmo = 'eu mesmo'
export const decideOutraPessoa = 'outra pessoa'

export const textosDecisor = {
  obrigatorio: 'Preencha este campo.',
  escolha: 'Informe quem decide a parceria.',
  email: 'E-mail inválido.',
  whatsapp: 'WhatsApp inválido: use DDD e número.',
  pendente: 'Falta cadastrar o decisor (nome, e-mail e WhatsApp) para seguir para a Triagem 2.',
} as const

export type DadosDecisor = {
  quem_decide?: string | null
  decisor_nome?: string | null
  decisor_email?: string | null
  decisor_whatsapp?: string | null
}

export type ErrosDecisor = Partial<Record<'quem_decide' | 'decisor_nome' | 'decisor_email' | 'decisor_whatsapp', string>>

export const camposDecisor = ['decisor_nome', 'decisor_email', 'decisor_whatsapp'] as const

export const decideOutraPessoaSim = (d: DadosDecisor) => d.quem_decide?.trim().toLowerCase() === decideOutraPessoa

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const whatsappOk = (v: string) => { const n = v.replace(/\D/g, ''); return n.length >= 10 && n.length <= 13 }

// `exigirEscolha`: formulário público e entrada manual exigem a resposta; empresas antigas sem resposta seguem como estão.
export function validarDecisor(d: DadosDecisor, exigirEscolha = true): ErrosDecisor {
  const erros: ErrosDecisor = {}
  if (!d.quem_decide?.trim()) {
    if (exigirEscolha) erros.quem_decide = textosDecisor.escolha
    return erros
  }
  if (!decideOutraPessoaSim(d)) return erros
  if (!d.decisor_nome?.trim()) erros.decisor_nome = textosDecisor.obrigatorio
  if (!d.decisor_email?.trim()) erros.decisor_email = textosDecisor.obrigatorio
  else if (!emailOk(d.decisor_email)) erros.decisor_email = textosDecisor.email
  if (!d.decisor_whatsapp?.trim()) erros.decisor_whatsapp = textosDecisor.obrigatorio
  else if (!whatsappOk(d.decisor_whatsapp)) erros.decisor_whatsapp = textosDecisor.whatsapp
  return erros
}

export type ContatoEmpresa = DadosDecisor & {
  contato_nome?: string | null; contato_cargo?: string | null; contato_whatsapp?: string | null; contato_email?: string | null
}

export type Decisor = { nome: string | null; email: string | null; whatsapp: string | null; quem: 'responsavel' | 'outra_pessoa' | 'nao_informado' }

// "Eu mesmo": o decisor é o próprio responsável do formulário. "Outra pessoa": os dados do decisor.
// Sem resposta: nada é inventado — a Triagem 2 mostra "—".
export function decisorConsolidado(e: ContatoEmpresa): Decisor {
  if (decideOutraPessoaSim(e)) {
    return { nome: e.decisor_nome?.trim() || null, email: e.decisor_email?.trim() || null, whatsapp: e.decisor_whatsapp?.trim() || null, quem: 'outra_pessoa' }
  }
  if (e.quem_decide?.trim().toLowerCase() === decideEuMesmo) {
    return { nome: e.contato_nome ?? null, email: e.contato_email ?? null, whatsapp: e.contato_whatsapp ?? null, quem: 'responsavel' }
  }
  return { nome: null, email: null, whatsapp: null, quem: 'nao_informado' }
}

// Impede o avanço para a Triagem 2 só quando a empresa disse "outra pessoa" e faltam dados.
export function pendenciaDecisor(e: DadosDecisor): string | null {
  return decideOutraPessoaSim(e) && Object.keys(validarDecisor(e, false)).length ? textosDecisor.pendente : null
}
