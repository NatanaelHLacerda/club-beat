import { useState } from 'react'
import { CampoEmpresa, valorLegivel } from '../../componentes/CampoEmpresa'
import { atualizarEmpresa } from '../../dados/api'
import { blocosFicha, rotuloCampo } from '../../dados/campos'
import type { CamposEditaveis, Empresa } from '../../dados/tipos'
import { cnpjValido, formatarCnpj, formatarDataHora, soDigitos } from '../../regras/formato'
import { pode } from '../../lib/permissoes'
import { useSessao } from '../../sessao'
import type { PropsAba } from './Ficha'

export function AbaResumo({ empresa, atualizar }: PropsAba) {
  const { perfil } = useSessao()
  const [editando, setEditando] = useState<string | null>(null)
  const [rascunho, setRascunho] = useState<Partial<Empresa>>({})
  const [erro, setErro] = useState('')
  const podeEditar = pode(perfil, 'editar_empresa')

  async function salvar() {
    setErro('')
    if (rascunho.cnpj !== undefined && !cnpjValido(rascunho.cnpj ?? '')) { setErro('CNPJ inválido'); return }
    const campos = { ...rascunho } as Partial<CamposEditaveis>
    if (campos.cnpj) campos.cnpj = soDigitos(campos.cnpj)
    try {
      await atualizarEmpresa(empresa.id, campos)
      setEditando(null); setRascunho({})
      await atualizar()
    } catch (err) { setErro((err as Error).message) }
  }

  return (
    <div className="pilha">
      {blocosFicha.map((b) => {
        const emEdicao = editando === b.titulo
        return (
          <section key={b.titulo} className="cartao">
            <div className="linha entre">
              <h3>{b.titulo}</h3>
              {podeEditar && !emEdicao && <button className="botao leve" onClick={() => { setEditando(b.titulo); setRascunho({}); setErro('') }}>Editar</button>}
            </div>
            {emEdicao ? (
              <>
                <div className="grade-2">
                  {b.campos.map((c) => (
                    <CampoEmpresa key={c} campo={c} valor={c in rascunho ? rascunho[c] : c === 'cnpj' ? formatarCnpj(empresa.cnpj) : empresa[c]}
                      mudar={(v) => setRascunho({ ...rascunho, [c]: v })} />
                  ))}
                </div>
                {erro && <p className="erro" role="alert">{erro}</p>}
                <div className="linha">
                  <button className="botao primario" onClick={() => void salvar()}>Salvar</button>
                  <button className="botao leve" onClick={() => { setEditando(null); setRascunho({}) }}>Cancelar</button>
                </div>
              </>
            ) : (
              <dl className="grade-2" style={{ margin: 0 }}>
                {b.campos.map((c) => (
                  <div key={c} className="pilha" style={{ gap: 2 }}>
                    <dt className="muted pequeno">{rotuloCampo[c]}</dt>
                    <dd style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{c === 'cnpj' ? formatarCnpj(empresa.cnpj) : valorLegivel(c, empresa[c])}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        )
      })}
      <p className="muted pequeno">Consentimento de privacidade: {empresa.consentimento_em ? `aceito em ${formatarDataHora(empresa.consentimento_em)}` : '—'}</p>
    </div>
  )
}
