// REQ-025/034 — molduras das páginas de entrada e das páginas públicas, com a foto e a voz editorial do site de parcerias.
import type { ReactNode } from 'react'
import { Icone } from './ui'

export function MolduraEntrada({ children }: { children: ReactNode }) {
  return (
    <div className="moldura-entrada">
      <aside className="painel-foto">
        <img className="foto revela" src="/marca/fotos/hero-ciclismo-janela.jpg" width="2000" height="1125" fetchPriority="high" decoding="async"
          alt="Duas pessoas pedalando lado a lado em sala escura, com janela de folhagem dourada ao fundo" />
        <div className="painel-foto-texto">
          <img className="logo" src="/marca/logo-branco.png" width="1481" height="619" alt="The Beat Life Club" />
          <div className="painel-foto-frase revela">
            <span className="eyebrow">Belo Horizonte · Nova Lima</span>
            <p className="frase">Uma parceria boa começa <span className="acento">pelo membro.</span></p>
          </div>
        </div>
      </aside>
      <main className="area-entrada">
        <div className="marca-entrada">
          <img className="logo" src="/marca/logo-oceano.png" width="1481" height="619" alt="" />
          <span className="eyebrow">CRM de Parcerias</span>
        </div>
        {children}
      </main>
    </div>
  )
}

export function CabecalhoPublico({ subtitulo, titulo = 'Conte quem é', acento = 'a sua marca.', eyebrow = 'Ficha de parceria' }:
  { subtitulo?: string; titulo?: string; acento?: string; eyebrow?: string }) {
  return (
    <header className="cabecalho-publico">
      <img className="foto" src="/marca/fotos/casa-lounge-terraco.jpg" width="1400" height="932" alt="" decoding="async" />
      <div className="interno revela">
        <img className="logo" src="/marca/logo-branco.png" width="1481" height="619" alt="The Beat Life Club" />
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="frase">{titulo} <span className="acento">{acento}</span></h1>
        {subtitulo && <p className="frase-apoio">{subtitulo}</p>}
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
            {estado === 'feito' && <Icone nome="check" tamanho={12} />}
            <span className="nome-etapa">{t}</span>
          </li>
        )
      })}
    </ol>
  )
}
