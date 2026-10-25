import { useState, type FormEvent } from 'react'
import { nomeDe } from '../../componentes/Filtros'
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
  return (
    <div className="pilha">
      <form className="cartao" onSubmit={anotar}>
        <label className="campo"><span>Nova nota</span>
          <textarea id="nova-nota" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="O que aconteceu, o que foi combinado…" />
        </label>
        {erro && <p className="erro" role="alert">{erro}</p>}
        <div><button className="botao primario" disabled={!nota.trim()}>Salvar nota</button></div>
      </form>
      {historico.carregando && !historico.dado ? <p className="muted">Carregando…</p> : lista.length === 0 ? (
        <div className="vazio">Nada registrado ainda.</div>
      ) : (
        <ol className="tempo">
          {lista.map((i) => (
            <li key={i.id}>
              <time dateTime={i.em}>{formatarDataHora(i.em)}</time>
              <div className="pilha" style={{ gap: 2 }}>
                <span><span className="pill">{rotuloTipo[i.tipo]}</span> {descrever(i)}</span>
                <span className="muted pequeno">{i.autor_id ? nomeDe(usuarios, i.autor_id) : 'Sistema'}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
