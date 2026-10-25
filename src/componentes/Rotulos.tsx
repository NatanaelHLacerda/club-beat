import { Avatar, Pill } from './ui'
import { rotuloPadrao, type Padrao } from '../dados/tipos'
import { rotuloEtapa, type Etapa } from '../regras/etapas'

export function PadraoTag({ padrao }: { padrao: Padrao | null }) {
  if (!padrao) return <span className="muted">—</span>
  return <span className={`padrao ${padrao}`}>{rotuloPadrao[padrao]}</span>
}

export function EtapaTag({ etapa }: { etapa: Etapa }) {
  const tom = etapa === 'recusada' ? 'perigo' : etapa === 'espera' ? 'alerta' : etapa === 'ativa' ? 'ok' : etapa === 'direcao' ? 'ouro' : 'neutro'
  return <Pill tom={tom}>{rotuloEtapa[etapa]}</Pill>
}

export function Exemplo({ mostrar }: { mostrar: boolean }) {
  return mostrar ? <span className="exemplo" title="Dado de exemplo">exemplo</span> : null
}

// REQ-028 — célula de empresa nas tabelas: avatar, nome sem "(exemplo)" e a pill ao lado, numa linha.
export function NomeEmpresa({ marca, exemplo, tamanho = 28 }: { marca: string; exemplo: boolean; tamanho?: number }) {
  return (
    <span className="linha" style={{ gap: 10, flexWrap: 'nowrap' }}>
      <Avatar nome={marca} tamanho={tamanho} />
      <b style={{ color: 'var(--ink)', fontWeight: 500 }} title={marca}>{exemplo ? marca.replace(/\s*\(exemplo\)$/i, '') : marca}</b>
      <Exemplo mostrar={exemplo} />
    </span>
  )
}
