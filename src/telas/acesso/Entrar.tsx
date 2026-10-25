import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { entrar, pedirNovaSenha } from '../../dados/api'
import { useSessao } from '../../sessao'
import { MolduraEntrada } from '../../componentes/Moldura'

export function Entrar() {
  const { perfil, carregando } = useSessao()
  const local = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [info, setInfo] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (!carregando && perfil) {
    const de = (local.state as { de?: string } | null)?.de
    return <Navigate to={de && de !== '/entrar' ? de : '/inicio'} replace />
  }

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    setErro(''); setInfo(''); setEnviando(true)
    try {
      await entrar(email.trim(), senha)
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  async function esqueci() {
    setErro(''); setInfo('')
    if (!email.trim()) { setErro('Digite o seu e-mail para receber o link.'); return }
    try {
      await pedirNovaSenha(email.trim())
      setInfo('Se o e-mail estiver cadastrado, o link para criar uma nova senha chega em alguns minutos.')
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <MolduraEntrada>
      <form className="form-entrada" onSubmit={aoEnviar}>
        <div className="pilha" style={{ gap: 4 }}><h1>Entrar</h1><p className="muted">Use o e-mail e a senha do CRM de Parcerias.</p></div>
        <label className="campo"><span>E-mail</span>
          <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="campo"><span>Senha</span>
          <input id="senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </label>
        {erro && <p className="erro" role="alert">{erro}</p>}
        {info && <p className="muted">{info}</p>}
        <button className="botao primario" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        <button type="button" className="botao leve" onClick={() => void esqueci()}>Esqueci a senha</button>
      </form>
    </MolduraEntrada>
  )
}
