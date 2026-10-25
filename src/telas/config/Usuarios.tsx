import { useState, type FormEvent } from 'react'
import { SemAcesso, Topo } from '../../componentes/Casca'
import { alterarDisponibilidade, alterarPapel, criarUsuario, listarUsuarios } from '../../dados/api'
import { rotuloPapel, type Papel, type Perfil } from '../../dados/tipos'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

const papeis = Object.keys(rotuloPapel) as Papel[]

export function Usuarios() {
  const { perfil } = useSessao()
  const consulta = useConsulta(listarUsuarios)
  const usuarios = consulta.carregando && !consulta.dado ? null : consulta.dado ?? []
  const [erro, setErro] = useState('')
  const [novo, setNovo] = useState({ nome: '', email: '', papel: 'gerente' as Papel, senha: '' })
  const [aviso, setAviso] = useState('')

  const carregar = consulta.recarregar

  if (!pode(perfil, 'gerir_usuarios')) return (<><Topo titulo="Usuários" /><SemAcesso /></>)

  async function criar(e: FormEvent) {
    e.preventDefault(); setErro(''); setAviso('')
    try {
      await criarUsuario({ ...novo, email: novo.email.trim(), nome: novo.nome.trim() })
      setAviso(`Usuário ${novo.nome} criado.`)
      setNovo({ nome: '', email: '', papel: 'gerente', senha: '' })
      await carregar()
    } catch (err) { setErro((err as Error).message) }
  }

  async function mudar(u: Perfil, papel: Papel, admin: boolean) {
    setErro('')
    try { await alterarPapel(u.id, papel, admin); await carregar() } catch (err) { setErro((err as Error).message) }
  }

  async function disponibilidade(u: Perfil) {
    setErro('')
    try { await alterarDisponibilidade(u.id, !u.disponivel); await carregar() } catch (err) { setErro((err as Error).message) }
  }

  return (
    <>
      <Topo eyebrow="Configuração" titulo="Usuários" />
      {(erro || consulta.erro) && <div className="aviso perigo" role="alert">{erro || consulta.erro}</div>}
      {aviso && <div className="aviso">{aviso}</div>}
      {usuarios === null ? <p className="muted">Carregando…</p> : usuarios.length === 0 ? (
        <div className="vazio">Nenhum usuário cadastrado.</div>
      ) : (
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Administrador</th><th>Disponível</th></tr></thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td className="muted">{u.email}</td>
                  <td>
                    <select className="entrada" aria-label={`Papel de ${u.nome}`} value={u.papel} onChange={(e) => void mudar(u, e.target.value as Papel, u.admin)}>
                      {papeis.map((p) => <option key={p} value={p}>{rotuloPapel[p]}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="checkbox" aria-label={`${u.nome} é administrador`} checked={u.admin} disabled={u.id === perfil?.id} onChange={(e) => void mudar(u, u.papel, e.target.checked)} />
                  </td>
                  <td>
                    <button className="botao leve" onClick={() => void disponibilidade(u)}>{u.disponivel ? 'Sim' : 'Não'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form className="cartao" onSubmit={criar}>
        <h2>Novo usuário</h2>
        <div className="grade-2">
          <label className="campo"><span>Nome</span><input id="novo-nome" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} required /></label>
          <label className="campo"><span>E-mail</span><input id="novo-email" type="email" value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} required /></label>
          <label className="campo"><span>Papel</span>
            <select id="novo-papel" value={novo.papel} onChange={(e) => setNovo({ ...novo, papel: e.target.value as Papel })}>
              {papeis.map((p) => <option key={p} value={p}>{rotuloPapel[p]}</option>)}
            </select>
          </label>
          <label className="campo"><span>Senha inicial</span><input id="novo-senha" type="password" autoComplete="new-password" minLength={8} value={novo.senha} onChange={(e) => setNovo({ ...novo, senha: e.target.value })} required /><small className="ajuda">Pelo menos 8 caracteres. A pessoa troca depois em "Esqueci a senha".</small></label>
        </div>
        <div><button className="botao primario">Criar usuário</button></div>
      </form>
    </>
  )
}
