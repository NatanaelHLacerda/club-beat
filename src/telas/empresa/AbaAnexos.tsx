import { useState } from 'react'
import { nomeDe } from '../../componentes/Filtros'
import { enviarAnexo, listarAnexos, urlAnexo } from '../../dados/api'
import { rotuloAnexo, type Anexo, type TipoAnexo } from '../../dados/tipos'
import { formatarDataHora } from '../../regras/formato'
import { useConsulta } from '../../lib/useConsulta'
import type { PropsAba } from './Ficha'

const tamanhoLegivel = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

export function AbaAnexos({ empresa, usuarios }: PropsAba) {
  const anexos = useConsulta(() => listarAnexos(empresa.id), [empresa.id])
  const [tipo, setTipo] = useState<TipoAnexo>('outro')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(arquivo: File | undefined) {
    if (!arquivo) return
    setErro(''); setEnviando(true)
    try { await enviarAnexo(empresa.id, tipo, arquivo); await anexos.recarregar() } catch (e) { setErro((e as Error).message) } finally { setEnviando(false) }
  }

  async function abrir(a: Anexo) {
    try { window.open(await urlAnexo(a.caminho), '_blank', 'noopener') } catch (e) { setErro((e as Error).message) }
  }

  const lista = anexos.dado ?? []
  return (
    <div className="pilha">
      <div className="cartao">
        <div className="linha">
          <select className="entrada" style={{ width: 'auto' }} id="anexo-tipo" aria-label="Tipo de anexo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoAnexo)}>
            {(Object.keys(rotuloAnexo) as TipoAnexo[]).map((t) => <option key={t} value={t}>{rotuloAnexo[t]}</option>)}
          </select>
          <label className="botao">
            {enviando ? 'Enviando…' : 'Anexar arquivo'}
            <input type="file" hidden onChange={(e) => { void enviar(e.target.files?.[0]); e.target.value = '' }} />
          </label>
          <span className="muted pequeno">Até 20 MB.</span>
        </div>
        {erro && <p className="erro" role="alert">{erro}</p>}
      </div>
      {anexos.carregando && !anexos.dado ? <p className="muted">Carregando…</p> : lista.length === 0 ? (
        <div className="vazio">Nenhum anexo.</div>
      ) : (
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Arquivo</th><th>Tipo</th><th>Tamanho</th><th>Enviado</th><th>Por</th></tr></thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.id}>
                  <td><button className="botao leve" style={{ padding: 0, border: 0 }} onClick={() => void abrir(a)}>{a.nome}</button></td>
                  <td>{rotuloAnexo[a.tipo]}</td>
                  <td className="num muted">{tamanhoLegivel(a.tamanho)}</td>
                  <td className="num muted">{formatarDataHora(a.criado_em)}</td>
                  <td className="muted">{a.autor_id ? nomeDe(usuarios, a.autor_id) : 'Empresa (formulário)'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
