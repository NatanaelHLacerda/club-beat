import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buscarEmpresas } from '../../dados/api'
import type { Empresa } from '../../dados/tipos'
import { formatarCnpj } from '../../regras/formato'
import { EtapaTag } from '../Rotulos'
import { Avatar, Icone } from '../ui'

// REQ-019 — busca global por marca, razão social ou CNPJ.
export function BuscaGlobal() {
  const navegar = useNavigate()
  const [termo, setTermo] = useState('')
  const [itens, setItens] = useState<Empresa[]>([])
  const [aberta, setAberta] = useState(false)
  const [ativo, setAtivo] = useState(0)
  const caixa = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = termo.trim()
    if (t.length < 2) return
    let vivo = true
    const relogio = window.setTimeout(() => {
      buscarEmpresas(t).then((r) => { if (vivo) { setItens(r); setAtivo(0); setAberta(true) } }, () => {})
    }, 250)
    return () => { vivo = false; window.clearTimeout(relogio) }
  }, [termo])

  useEffect(() => {
    const fora = (e: MouseEvent) => { if (!caixa.current?.contains(e.target as Node)) setAberta(false) }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [])

  function abrir(e: Empresa) {
    setAberta(false); setTermo('')
    navegar(`/empresas/${e.id}`)
  }
  function verTodos() {
    setAberta(false)
    navegar(`/empresas?busca=${encodeURIComponent(termo.trim())}`)
  }

  const mostrar = aberta && termo.trim().length >= 2
  return (
    <div className="busca-global" ref={caixa}>
      <label className="busca">
        <Icone nome="busca" tamanho={16} />
        <input id="busca-global" value={termo} placeholder="Buscar empresa ou CNPJ" aria-label="Buscar empresa ou CNPJ" autoComplete="off"
          role="combobox" aria-expanded={mostrar} aria-controls="busca-resultados"
          onChange={(e) => { setTermo(e.target.value); if (e.target.value.trim().length < 2) setAberta(false) }}
          onFocus={() => itens.length && setAberta(true)}
          onKeyDown={(e) => {
            if (!mostrar) return
            if (e.key === 'ArrowDown') { e.preventDefault(); setAtivo((a) => Math.min(a + 1, itens.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setAtivo((a) => Math.max(a - 1, 0)) }
            if (e.key === 'Enter') { e.preventDefault(); if (itens[ativo]) abrir(itens[ativo]); else verTodos() }
            if (e.key === 'Escape') setAberta(false)
          }} />
      </label>
      {mostrar && (
        <div className="flutuante busca-resultados" id="busca-resultados" role="listbox">
          {itens.length === 0 ? <p className="muted pequeno" style={{ padding: 12 }}>Nenhuma empresa encontrada.</p> : itens.map((e, i) => (
            <button key={e.id} role="option" aria-selected={i === ativo} className={`resultado${i === ativo ? ' ativo' : ''}`} onMouseEnter={() => setAtivo(i)} onClick={() => abrir(e)}>
              <Avatar nome={e.marca} tamanho={28} />
              <span className="pilha" style={{ gap: 0, minWidth: 0 }}><b>{e.marca}</b><span className="muted pequeno num">{formatarCnpj(e.cnpj)}</span></span>
              <EtapaTag etapa={e.etapa} />
            </button>
          ))}
          <button className="ver-todos resultado-rodape" onClick={verTodos}>Ver todos os resultados</button>
        </div>
      )}
    </div>
  )
}
