import { useState } from 'react'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, BotaoIcone, Icone } from '../../componentes/ui'
import { rotuloPorte, type Empresa } from '../../dados/tipos'
import { formatarCnpj } from '../../regras/formato'

// REQ-022 — cartão de perfil da empresa (estilo dos cartões de contato do kit).
export function PerfilEmpresa({ empresa: e }: { empresa: Empresa }) {
  const [copiado, setCopiado] = useState(false)
  async function copiar() {
    if (!e.contato_whatsapp) return
    try { await navigator.clipboard.writeText(e.contato_whatsapp); setCopiado(true); window.setTimeout(() => setCopiado(false), 2000) } catch {
      const alvo = document.getElementById('whatsapp-empresa')
      if (alvo) { const r = document.createRange(); r.selectNodeContents(alvo); window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(r) }
    }
  }
  return (
    <section className="cartao perfil-empresa">
      <div className="linha" style={{ gap: 14, flexWrap: 'nowrap' }}>
        <Avatar nome={e.marca} tamanho={56} />
        <div className="pilha" style={{ gap: 2, minWidth: 0 }}>
          <b className="perfil-nome">{e.marca} <Exemplo mostrar={e.exemplo} /></b>
          <span className="muted pequeno">{e.razao_social ?? '—'} · <span className="num">{formatarCnpj(e.cnpj)}</span></span>
          <span className="linha" style={{ gap: 6 }}><PadraoTag padrao={e.padrao_final} />{e.porte && <span className="pill">{rotuloPorte[e.porte]}</span>}{e.categoria && <span className="pill">{e.categoria}</span>}</span>
        </div>
      </div>
      <dl className="perfil-contato">
        <div><dt><Icone nome="usuarios" tamanho={14} /> Contato</dt><dd>{e.contato_nome}{e.contato_cargo ? ` · ${e.contato_cargo}` : ''}</dd></div>
        <div><dt><Icone nome="mensagem" tamanho={14} /> E-mail</dt><dd>{e.contato_email ?? '—'}</dd></div>
        <div><dt><Icone nome="mensagem" tamanho={14} /> WhatsApp</dt><dd className="linha" style={{ gap: 4 }}>
          <span id="whatsapp-empresa" className="num">{e.contato_whatsapp ?? '—'}</span>
          {e.contato_whatsapp && <BotaoIcone icone={copiado ? 'check' : 'copiar'} rotulo={copiado ? 'Copiado' : 'Copiar WhatsApp'} aoClicar={() => void copiar()} />}
          {copiado && <span className="ok pequeno" role="status">Copiado</span>}
        </dd></div>
        <div><dt><Icone nome="empresas" tamanho={14} /> Segmento</dt><dd>{e.segmento}{e.cidade ? ` · ${e.cidade}/${e.uf ?? ''}` : ''}</dd></div>
      </dl>
    </section>
  )
}
