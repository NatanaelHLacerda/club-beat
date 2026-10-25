import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CampoEmpresa } from '../../componentes/CampoEmpresa'
import { SemAcesso, Topo } from '../../componentes/Casca'
import { cadastrarEmpresa, conferirCnpj } from '../../dados/api'
import { blocosFicha } from '../../dados/campos'
import type { CamposEditaveis, Empresa } from '../../dados/tipos'
import { origensDeIndicacao, textoConferencia, validarEntradaManual, type Conferencia } from '../../regras/entrada'
import { soDigitos } from '../../regras/formato'
import { pode } from '../../lib/permissoes'
import { useSessao } from '../../sessao'

const obrigatorios: (keyof Empresa)[] = ['cnpj', 'marca', 'contato_nome', 'segmento', 'origem']

export function NovaEmpresa() {
  const { perfil } = useSessao()
  const navegar = useNavigate()
  const [dados, setDados] = useState<Partial<Empresa>>({ origem: 'whatsapp', busca: [] })
  const [erros, setErros] = useState<Record<string, string | undefined>>({})
  const [conferencia, setConferencia] = useState<Conferencia | null>(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const cnpj = soDigitos(String(dados.cnpj ?? ''))

  useEffect(() => {
    if (cnpj.length !== 14) return
    let vivo = true
    conferirCnpj(cnpj).then((c) => { if (vivo) setConferencia(c) }, () => {})
    return () => { vivo = false; setConferencia(null) }
  }, [cnpj])

  if (!pode(perfil, 'editar_empresa')) return (<><Topo titulo="Nova empresa" /><SemAcesso /></>)

  async function salvar() {
    setErro('')
    const e = validarEntradaManual(dados as Record<string, string>)
    setErros(e)
    if (Object.values(e).some(Boolean) || conferencia?.situacao === 'ativa') return
    setSalvando(true)
    try {
      const id = await cadastrarEmpresa(dados as Partial<CamposEditaveis>)
      navegar(`/empresas/${id}`)
    } catch (err) { setErro((err as Error).message) } finally { setSalvando(false) }
  }

  const indicacao = dados.origem ? origensDeIndicacao.includes(dados.origem) : false
  return (
    <>
      <Topo eyebrow="Funil de parcerias" titulo="Nova empresa" />
      <p className="muted">Mesma ficha do formulário do site. Obrigatórios: CNPJ, nome da marca, responsável, segmento e origem. O resto se completa na triagem.</p>
      {conferencia && (
        <div className={`aviso ${conferencia.situacao === 'ativa' ? 'perigo' : 'alerta'}`} role="status">
          {textoConferencia(conferencia)} <Link to={`/empresas/${conferencia.id}`}>Abrir {conferencia.marca}</Link>
        </div>
      )}
      {blocosFicha.map((b) => (
        <section key={b.titulo} className="cartao">
          <h3>{b.titulo}</h3>
          <div className="grade-2">
            {b.campos.filter((c) => c !== 'indicado_por' || indicacao).map((c) => (
              <CampoEmpresa key={c} campo={c} valor={dados[c]} obrigatorio={obrigatorios.includes(c) || (c === 'indicado_por' && indicacao)}
                erro={erros[c]} mudar={(v) => { setDados({ ...dados, [c]: v }); setErros({ ...erros, [c]: undefined }) }} />
            ))}
          </div>
        </section>
      ))}
      {erro && <div className="aviso perigo" role="alert">{erro}</div>}
      <div className="linha">
        <button className="botao primario" disabled={salvando || conferencia?.situacao === 'ativa'} onClick={() => void salvar()}>{salvando ? 'Cadastrando…' : 'Cadastrar empresa'}</button>
        <Link className="botao leve" to="/empresas">Cancelar</Link>
      </div>
    </>
  )
}
