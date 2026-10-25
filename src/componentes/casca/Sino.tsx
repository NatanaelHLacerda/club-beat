import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { contarAvisosNaoLidos, listarAvisosRecentes, marcarAvisoLido } from '../../dados/api'
import type { Aviso } from '../../dados/tipos'
import { formatarDataHora } from '../../regras/formato'
import { Icone } from '../ui'

// REQ-019 — sino com contador e os 5 avisos mais recentes.
export function Sino() {
  const [naoLidos, setNaoLidos] = useState(0)
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [aberto, setAberto] = useState(false)
  const caixa = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let vivo = true
    const contar = () => { contarAvisosNaoLidos().then((n) => { if (vivo) setNaoLidos(n) }, () => {}) }
    contar()
    const relogio = window.setInterval(contar, 60_000)
    window.addEventListener('avisos-mudaram', contar)
    const fora = (e: MouseEvent) => { if (!caixa.current?.contains(e.target as Node)) setAberto(false) }
    document.addEventListener('mousedown', fora)
    return () => { vivo = false; window.clearInterval(relogio); window.removeEventListener('avisos-mudaram', contar); document.removeEventListener('mousedown', fora) }
  }, [])

  async function abrir() {
    const novo = !aberto
    setAberto(novo)
    if (novo) setAvisos(await listarAvisosRecentes().catch(() => []))
  }

  async function ler(a: Aviso) {
    await marcarAvisoLido(a.id)
    setAvisos(await listarAvisosRecentes().catch(() => []))
    window.dispatchEvent(new Event('avisos-mudaram'))
  }

  return (
    <div className="sino" ref={caixa}>
      <button className="botao-icone grande" aria-label={`Avisos${naoLidos ? `: ${naoLidos} não lidos` : ''}`} aria-expanded={aberto} onClick={() => void abrir()}>
        <Icone nome="avisos" tamanho={20} />
        {naoLidos > 0 && <span className="bolinha num">{naoLidos > 99 ? '99+' : naoLidos}</span>}
      </button>
      {aberto && (
        <div className="flutuante sino-lista">
          <div className="linha entre" style={{ padding: '10px 14px' }}><b style={{ color: 'var(--ink)' }}>Avisos</b><span className="muted pequeno">{naoLidos} não lidos</span></div>
          {avisos.length === 0 ? <p className="muted pequeno" style={{ padding: 14 }}>Nenhum aviso.</p> : avisos.map((a) => (
            <div key={a.id} className={`sino-item${a.lido_em ? ' lido' : ''}`}>
              <span className="icone-redondo"><Icone nome={a.tipo.includes('prazo') || a.tipo.includes('parada') ? 'prazos' : a.tipo.includes('renov') ? 'renovacoes' : 'avisos'} tamanho={14} /></span>
              <div className="pilha" style={{ gap: 2, minWidth: 0 }}>
                <span className="pequeno">{a.texto}</span>
                <span className="muted pequeno">{formatarDataHora(a.em)}{a.empresa_id && <> · <Link to={`/empresas/${a.empresa_id}`} onClick={() => setAberto(false)}>Abrir</Link></>}</span>
              </div>
              {!a.lido_em && <button className="botao-icone" aria-label="Marcar como lido" data-dica="Marcar como lido" onClick={() => void ler(a)}><Icone nome="check" tamanho={14} /></button>}
            </div>
          ))}
          <Link className="ver-todos resultado-rodape" to="/avisos" onClick={() => setAberto(false)}>Ver todos os avisos</Link>
        </div>
      )}
    </div>
  )
}
