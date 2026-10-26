import { useState, type FormEvent } from 'react'
import { Topo } from '../../componentes/Casca'
import { Avatar, SecaoCabecalho } from '../../componentes/ui'
import { alterarDisponibilidade, atualizarMeuNome, trocarMinhaSenha } from '../../dados/api'
import { rotuloPapel } from '../../dados/tipos'
import { erroNome, erroNovaSenha, normalizarNome } from '../../regras/perfil'
import { useSessao } from '../../sessao'

type Retorno = { ok?: string; erro?: string }

// REQ-039 — Meu perfil: cada pessoa muda o próprio nome, a própria senha e (Gerente) a disponibilidade.
export function MeuPerfil() {
  const { perfil, recarregar } = useSessao()
  const [nome, setNome] = useState(perfil?.nome ?? '')
  const [retornoNome, setRetornoNome] = useState<Retorno>({})
  const [salvandoNome, setSalvandoNome] = useState(false)
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [retornoSenha, setRetornoSenha] = useState<Retorno>({})
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [retornoDisp, setRetornoDisp] = useState<Retorno>({})
  const [salvandoDisp, setSalvandoDisp] = useState(false)
  if (!perfil) return null

  async function salvarNome(e: FormEvent) {
    e.preventDefault()
    const problema = erroNome(nome)
    if (problema) { setRetornoNome({ erro: problema }); return }
    setSalvandoNome(true); setRetornoNome({})
    try {
      await atualizarMeuNome(normalizarNome(nome))
      await recarregar()
      setNome(normalizarNome(nome))
      setRetornoNome({ ok: 'Nome salvo.' })
    } catch (err) { setRetornoNome({ erro: (err as Error).message }) } finally { setSalvandoNome(false) }
  }

  async function salvarSenha(e: FormEvent) {
    e.preventDefault()
    const problema = erroNovaSenha(senha, confirma)
    if (problema) { setRetornoSenha({ erro: problema }); return }
    setSalvandoSenha(true); setRetornoSenha({})
    try {
      await trocarMinhaSenha(senha)
      setSenha(''); setConfirma('')
      setRetornoSenha({ ok: 'Senha trocada. Use a nova senha na próxima entrada.' })
    } catch (err) { setRetornoSenha({ erro: (err as Error).message }) } finally { setSalvandoSenha(false) }
  }

  async function trocarDisponibilidade() {
    if (!perfil) return
    setSalvandoDisp(true); setRetornoDisp({})
    try { await alterarDisponibilidade(perfil.id, !perfil.disponivel); await recarregar() } catch (err) { setRetornoDisp({ erro: (err as Error).message }) } finally { setSalvandoDisp(false) }
  }

  const mudouNome = normalizarNome(nome) !== perfil.nome

  return (
    <>
      <Topo eyebrow="Conta" titulo="Meu" acento="perfil" />

      <div className="grade-perfil">
        <section className="cartao">
          <SecaoCabecalho titulo="Dados" />
          <div className="perfil-identidade">
            <Avatar nome={perfil.nome} tamanho={56} />
            <dl className="perfil-leitura">
              <div><dt>E-mail</dt><dd>{perfil.email}</dd></div>
              <div><dt>Papel</dt><dd>{rotuloPapel[perfil.papel]}{perfil.admin ? ' · administradora' : ''}</dd></div>
            </dl>
          </div>
          <form className="pilha" onSubmit={(e) => void salvarNome(e)} noValidate>
            <label className={`campo${retornoNome.erro ? ' invalido' : ''}`}>
              <span>Nome</span>
              <input value={nome} onChange={(e) => { setNome(e.target.value); setRetornoNome({}) }} maxLength={120} autoComplete="name"
                aria-invalid={Boolean(retornoNome.erro)} aria-describedby={retornoNome.erro ? 'erro-nome' : undefined} />
              {retornoNome.erro && <small id="erro-nome" className="msg" role="alert">{retornoNome.erro}</small>}
            </label>
            {retornoNome.ok && <p className="ok pequeno" role="status">{retornoNome.ok}</p>}
            <p className="muted pequeno">Papel, e-mail e acesso de administradora só mudam pela administradora, em Usuários.</p>
            <div><button className="botao primario" disabled={salvandoNome || !mudouNome}>{salvandoNome ? 'Salvando…' : 'Salvar nome'}</button></div>
          </form>
        </section>

        <div className="pilha-g">
          {perfil.papel === 'gerente' && (
            <section className="cartao">
              <SecaoCabecalho titulo="Disponibilidade" />
              <button type="button" role="switch" aria-checked={perfil.disponivel} className="menu-pessoa-interruptor perfil-interruptor" disabled={salvandoDisp} onClick={() => void trocarDisponibilidade()}>
                <span className="pilha" style={{ gap: 2 }}>
                  <span>Disponível para novas empresas</span>
                  <span className="muted pequeno">{perfil.disponivel ? 'Você entra no revezamento de novas empresas.' : 'Você está fora do revezamento.'}</span>
                </span>
                <span className="trilho-interruptor" aria-hidden="true"><span /></span>
              </button>
              {retornoDisp.erro && <p className="erro pequeno" role="alert">{retornoDisp.erro}</p>}
            </section>
          )}

          <section className="cartao">
            <SecaoCabecalho titulo="Senha" />
            <form className="pilha" onSubmit={(e) => void salvarSenha(e)} noValidate>
              <label className="campo"><span>Nova senha</span>
                <input type="password" value={senha} onChange={(e) => { setSenha(e.target.value); setRetornoSenha({}) }} autoComplete="new-password" />
              </label>
              <label className="campo"><span>Repita a nova senha</span>
                <input type="password" value={confirma} onChange={(e) => { setConfirma(e.target.value); setRetornoSenha({}) }} autoComplete="new-password" />
              </label>
              <p className="muted pequeno">Pelo menos 8 caracteres.</p>
              {retornoSenha.erro && <p className="erro pequeno" role="alert">{retornoSenha.erro}</p>}
              {retornoSenha.ok && <p className="ok pequeno" role="status">{retornoSenha.ok}</p>}
              <div><button className="botao primario" disabled={salvandoSenha || !senha}>{salvandoSenha ? 'Trocando…' : 'Trocar senha'}</button></div>
            </form>
          </section>
        </div>
      </div>
    </>
  )
}
