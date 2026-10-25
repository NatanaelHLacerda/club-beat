import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { definirNovaSenha } from '../../dados/api'

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
      navegar('/funil', { replace: true })
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <div className="tela-solta">
      <form className="cartao" onSubmit={aoEnviar}>
        <h2>Criar nova senha</h2>
        <label className="campo"><span>Nova senha</span>
          <input id="nova-senha" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        <label className="campo"><span>Repita a nova senha</span>
          <input id="confirma-senha" type="password" autoComplete="new-password" value={confirma} onChange={(e) => setConfirma(e.target.value)} />
        </label>
        {erro && <p className="erro" role="alert">{erro}</p>}
        <button className="botao primario">Salvar senha</button>
      </form>
    </div>
  )
}
