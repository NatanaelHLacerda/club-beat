import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { definirNovaSenha } from '../../dados/api'
import { MolduraEntrada } from '../../componentes/Moldura'

export function RedefinirSenha() {
  const navegar = useNavigate()
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [erro, setErro] = useState('')

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha.length < 8) { setErro('A senha precisa ter pelo menos 8 caracteres.'); return }
    if (senha !== confirma) { setErro('As duas senhas não são iguais.'); return }
    try {
      await definirNovaSenha(senha)
      navegar('/inicio', { replace: true })
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <MolduraEntrada>
      <form className="form-entrada" onSubmit={aoEnviar}>
        <div className="pilha" style={{ gap: 4 }}><h1>Crie a sua <span className="acento">nova senha.</span></h1><p className="muted">Pelo menos 8 caracteres.</p></div>
        <label className="campo"><span>Nova senha</span>
          <input id="nova-senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        <label className="campo"><span>Repita a nova senha</span>
          <input id="confirma-senha" type="password" autoComplete="new-password" value={confirma} onChange={(e) => setConfirma(e.target.value)} />
        </label>
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button className="botao primario">Salvar senha</button>
      </form>
    </MolduraEntrada>
  )
}
