// REQ-001 — cria usuário do CRM. Só administrador. A chave de serviço fica aqui, nunca no front.
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const papeis = ['primeira_pessoa', 'gerente', 'direcao', 'juridico', 'financeiro', 'operacoes']

function resposta(status: number, corpo: Record<string, unknown>) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return resposta(405, { erro: 'Método não permitido.' })

  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return resposta(401, { erro: 'Entre no CRM para continuar.' })

  const servico = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: quem } = await servico.auth.getUser(token)
  if (!quem.user) return resposta(401, { erro: 'Entre no CRM para continuar.' })

  const { data: perfil } = await servico.from('perfis').select('admin, ativo').eq('id', quem.user.id).single()
  if (!perfil?.admin || !perfil.ativo) return resposta(403, { erro: 'Você não tem acesso a esta área.' })

  const { email, nome, papel, senha } = await req.json().catch(() => ({}))
  if (!email || !nome || !papeis.includes(papel) || !senha || String(senha).length < 8) {
    return resposta(400, { erro: 'Preencha nome, e-mail, papel e uma senha com pelo menos 8 caracteres.' })
  }

  const { data: criado, error } = await servico.auth.admin.createUser({
    email, password: senha, email_confirm: true, user_metadata: { nome },
  })
  if (error || !criado.user) {
    const existe = /already|registered|exists/i.test(error?.message ?? '')
    return resposta(existe ? 409 : 400, { erro: existe ? 'Já existe um usuário com este e-mail.' : 'Não foi possível criar o usuário.' })
  }

  const { error: erroPerfil } = await servico.from('perfis').insert({ id: criado.user.id, nome, email, papel })
  if (erroPerfil) {
    await servico.auth.admin.deleteUser(criado.user.id)
    return resposta(400, { erro: 'Não foi possível criar o usuário.' })
  }
  return resposta(201, { id: criado.user.id })
})
