// REQ-025 — molduras das páginas de entrada e das páginas públicas, na identidade do Club.
import type { ReactNode } from 'react'
import { Icone } from './ui'

const frase = 'Parcerias com curadoria. O membro primeiro.'

export function MolduraEntrada({ children }: { children: ReactNode }) {
  return (
    <div className="moldura-entrada">
      <aside className="painel-marca" aria-hidden="true">
        <div className="marca-grande"><img className="logo" src="/marca/logo-branco.png" width="1481" height="619" alt="" /><span>Parcerias</span></div>
        <div className="pilha" style={{ gap: 16 }}>
          <span className="filete" />
          <p className="frase">{frase}</p>
          <p className="frase-apoio">CRM de parcerias do Club: do primeiro contato à renovação.</p>
        </div>
      </aside>
      <main className="area-entrada">
        <div className="marca-movel"><img className="logo" src="/marca/logo-oceano.png" width="1481" height="619" alt="The Beat Life Club" /><span>Parcerias</span></div>
        {children}
      </main>
    </div>
  )
}

export function CabecalhoPublico({ subtitulo }: { subtitulo?: string }) {
  return (
    <header className="cabecalho-publico">
      <div className="interno">
        <div className="marca-grande"><img className="logo" src="/marca/logo-branco.png" width="1481" height="619" alt="The Beat Life Club" /><span>Parcerias</span></div>
        <span className="filete" />
        <p className="frase">{subtitulo ?? frase}</p>
      </div>
    </header>
  )
}

export function IndicadorEtapas({ etapas, atual }: { etapas: string[]; atual: number }) {
  return (
    <ol className="indicador-etapas" aria-label={`Etapa ${atual} de ${etapas.length}`}>
      {etapas.map((t, i) => {
        const n = i + 1
        const estado = n < atual ? 'feito' : n === atual ? 'atual' : 'futuro'
        return (
          <li key={t} className={estado} aria-current={estado === 'atual' ? 'step' : undefined}>
            <span className="bola">{estado === 'feito' ? <Icone nome="check" tamanho={12} /> : n}</span>
            <span className="pequeno nome-etapa">{t}</span>
          </li>
        )
      })}
    </ol>
  )
}
