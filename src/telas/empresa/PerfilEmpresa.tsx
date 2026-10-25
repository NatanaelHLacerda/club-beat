import { useState } from 'react'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, BotaoIcone } from '../../componentes/ui'
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
  const marca = e.exemplo ? e.marca.replace(/\s*\(exemplo\)$/i, '') : e.marca
  return (
    <section className="cartao perfil-empresa">
      <div className="linha" style={{ gap: 14, flexWrap: 'nowrap' }}>
        <Avatar nome={e.marca} tamanho={56} />
        <div className="pilha" style={{ gap: 6, minWidth: 0 }}>
          <span className="linha" style={{ gap: 8 }}><b className="perfil-nome">{marca}</b><Exemplo mostrar={e.exemplo} /></span>
          <span className="linha" style={{ gap: 6 }}><PadraoTag padrao={e.padrao_final} />{e.porte && <span className="pill">{rotuloPorte[e.porte]}</span>}{e.categoria && <span className="pill">{e.categoria}</span>}</span>
        </div>
      </div>
      {/* REQ-030 — dados em grade chave–valor dentro de um painel tingido. */}
      <dl className="painel-dados">
        <dt>Razão social</dt><dd>{e.razao_social ?? '—'}</dd>
        <dt>CNPJ</dt><dd className="num">{formatarCnpj(e.cnpj)}</dd>
        <dt>Contato</dt><dd>{e.contato_nome}{e.contato_cargo ? ` · ${e.contato_cargo}` : ''}</dd>
        <dt>E-mail</dt><dd>{e.contato_email ?? '—'}</dd>
        <dt>WhatsApp</dt><dd className="linha" style={{ gap: 4, flexWrap: 'nowrap' }}>
          <span id="whatsapp-empresa" className="num">{e.contato_whatsapp ?? '—'}</span>
          {e.contato_whatsapp && <BotaoIcone icone={copiado ? 'check' : 'copiar'} rotulo={copiado ? 'Copiado' : 'Copiar WhatsApp'} aoClicar={() => void copiar()} />}
          {copiado && <span className="ok pequeno" role="status">Copiado</span>}
        </dd>
        <dt>Segmento</dt><dd>{e.segmento}</dd>
        <dt>Cidade</dt><dd>{e.cidade ? `${e.cidade}/${e.uf ?? ''}` : '—'}</dd>
      </dl>
    </section>
  )
}
