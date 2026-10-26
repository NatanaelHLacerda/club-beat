import { useState, type FormEvent } from 'react'
import { Topo } from '../../componentes/Casca'
import { Avatar, SecaoCabecalho } from '../../componentes/ui'
import { useFotos } from '../../componentes/FotosEquipe'
import { alterarDisponibilidade, atualizarMeuNome, enviarMinhaFoto, removerMinhaFoto, trocarMinhaSenha } from '../../dados/api'
import { fotoQuadrada } from '../../lib/imagem'
import { erroArquivoFoto, tiposFoto } from '../../regras/foto'
import { rotuloPapel } from '../../dados/tipos'
import { erroNome, erroNovaSenha, normalizarNome } from '../../regras/perfil'
import { useSessao } from '../../sessao'

type Retorno = { ok?: string; erro?: string }

// REQ-039 — Meu perfil: cada pessoa muda o próprio nome, a própria senha e (Gerente) a disponibilidade.
export function MeuPerfil() {
  const { perfil, recarregar } = useSessao()
  const { recarregarFotos } = useFotos()
  const [retornoFoto, setRetornoFoto] = useState<Retorno>({})
  const [salvandoFoto, setSalvandoFoto] = useState(false)
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

  async function escolherFoto(arquivo: File | undefined) {
    if (!arquivo || !perfil) return
    const problema = erroArquivoFoto(arquivo)
    if (problema) { setRetornoFoto({ erro: problema }); return }
    setSalvandoFoto(true); setRetornoFoto({})
    try {
      await enviarMinhaFoto(perfil.id, await fotoQuadrada(arquivo), perfil.foto_caminho)
      await Promise.all([recarregar(), recarregarFotos()])
      setRetornoFoto({ ok: 'Foto salva.' })
    } catch (err) { setRetornoFoto({ erro: (err as Error).message }) } finally { setSalvandoFoto(false) }
  }

  async function tirarFoto() {
    if (!perfil) return
    setSalvandoFoto(true); setRetornoFoto({})
    try {
      await removerMinhaFoto(perfil.foto_caminho)
      await Promise.all([recarregar(), recarregarFotos()])
      setRetornoFoto({ ok: 'Foto removida.' })
    } catch (err) { setRetornoFoto({ erro: (err as Error).message }) } finally { setSalvandoFoto(false) }
  }

  const mudouNome = normalizarNome(nome) !== perfil.nome

  return (
    <>
      <Topo eyebrow="Conta" titulo="Meu" acento="perfil" />

      <div className="grade-perfil">
        <section className="cartao">
          <SecaoCabecalho titulo="Dados" />
          <div className="perfil-identidade">
            <div className="perfil-foto">
              <Avatar nome={perfil.nome} tamanho={96} pessoa={perfil.id} />
              <div className="pilha" style={{ gap: 8 }}>
                <label className={`botao${salvandoFoto ? ' desativado' : ''}`} aria-disabled={salvandoFoto}>
                  {salvandoFoto ? 'Enviando…' : perfil.foto_caminho ? 'Trocar foto' : 'Enviar foto'}
                  <input type="file" accept={tiposFoto.join(',')} className="sr-only" disabled={salvandoFoto}
                    onChange={(e) => { void escolherFoto(e.target.files?.[0]); e.target.value = '' }} />
                </label>
                {perfil.foto_caminho && <button type="button" className="botao leve" disabled={salvandoFoto} onClick={() => void tirarFoto()}>Remover foto</button>}
                <span className="muted pequeno">JPG, PNG ou WebP, até 5 MB.</span>
              </div>
            </div>
            {retornoFoto.erro && <p className="erro pequeno" role="alert">{retornoFoto.erro}</p>}
            {retornoFoto.ok && <p className="ok pequeno" role="status">{retornoFoto.ok}</p>}
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
