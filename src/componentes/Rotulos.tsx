import { Pill } from './ui'
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
  return mostrar ? <span className="exemplo">exemplo</span> : null
}
