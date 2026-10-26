import { useState, type FormEvent } from 'react'
import { nomeDe } from '../../componentes/Filtros'
import { Avatar, Icone } from '../../componentes/ui'
import { adicionarNota, listarHistorico } from '../../dados/api'
import { rotuloCampo } from '../../dados/campos'
import type { ItemHistorico } from '../../dados/tipos'
import { rotuloEtapa } from '../../regras/etapas'
import { formatarDataHora } from '../../regras/formato'
import { useConsulta } from '../../lib/useConsulta'
import type { PropsAba } from './Ficha'

function descrever(i: ItemHistorico): string {
  switch (i.tipo) {
    case 'etapa': return `${i.de_etapa ? rotuloEtapa[i.de_etapa] : '—'} → ${i.para_etapa ? rotuloEtapa[i.para_etapa] : '—'}${i.texto ? ` · ${i.texto}` : ''}`
    case 'edicao': return `Alterou: ${(i.campos ?? []).map((c) => rotuloCampo[c] ?? c).join(', ')}`
    default: return i.texto ?? ''
  }
}

const rotuloTipo: Record<ItemHistorico['tipo'], string> = { etapa: 'Etapa', nota: 'Nota', edicao: 'Edição', mensagem: 'Mensagem', sistema: 'Sistema' }

export function AbaTempo({ empresa, usuarios }: PropsAba) {
  const historico = useConsulta(() => listarHistorico(empresa.id), [empresa.id])
  const [nota, setNota] = useState('')
  const [erro, setErro] = useState('')

  async function anotar(e: FormEvent) {
    e.preventDefault()
    if (!nota.trim()) return
    setErro('')
    try { await adicionarNota(empresa.id, nota.trim()); setNota(''); await historico.recarregar() } catch (err) { setErro((err as Error).message) }
  }

  const lista = historico.dado ?? []
  // REQ-030 — linha do tempo com avatar, autor e data; campo de anotação fixo no pé.
  return (
    <div className="aba-tempo">
      {historico.carregando && !historico.dado ? <p className="muted">Carregando…</p> : lista.length === 0 ? (
        <div className="vazio">Nada registrado ainda.</div>
      ) : (
        <ol className="tempo">
          {lista.map((i) => {
            const autor = i.autor_id ? nomeDe(usuarios, i.autor_id).replace(/\s*\(exemplo\)$/, '') : 'Sistema'
            return (
              <li key={i.id}>
                {i.autor_id ? <Avatar nome={autor} tamanho={34} pessoa={i.autor_id} /> : <span className="icone-redondo"><Icone nome="regras" tamanho={16} /></span>}
                <div className="pilha" style={{ gap: 4, minWidth: 0 }}>
                  <span className="tempo-cabeca"><b>{autor}</b><span className="pill">{rotuloTipo[i.tipo]}</span><time dateTime={i.em}>{formatarDataHora(i.em)}</time></span>
                  <p className="tempo-texto">{descrever(i)}</p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
      <form className="anotar" onSubmit={anotar}>
        <label className="sr-only" htmlFor="nova-nota">Nova nota</label>
        <textarea id="nova-nota" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Escreva uma nota: o que aconteceu, o que foi combinado…" />
        <button className="botao primario" disabled={!nota.trim()}>Salvar nota</button>
        {erro && <p className="erro" role="alert">{erro}</p>}
      </form>
    </div>
  )
}
