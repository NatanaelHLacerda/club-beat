import { useState, type FormEvent } from 'react'
import { moverEtapa } from '../dados/api'
import { bloqueioDeMudanca, destinosPossiveis, exigeMotivo, exigeRetomar, rotuloEtapa, validarSaida, type Etapa } from '../regras/etapas'

type Props = {
  empresa: string
  de: Etapa
  paraInicial?: Etapa
  aoConcluir: () => void
  aoCancelar?: () => void
}

// Troca de etapa pela ficha ou ao soltar um card. Mesmas regras do banco (mover_etapa).
export function TrocaEtapa({ empresa, de, paraInicial, aoConcluir, aoCancelar }: Props) {
  const [para, setPara] = useState<Etapa | ''>(paraInicial ?? '')
  const [motivo, setMotivo] = useState('')
  const [retomar, setRetomar] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    if (!para) return
    const bloqueio = bloqueioDeMudanca(de, para) ?? validarSaida(para, motivo, retomar)
    if (bloqueio) { setErro(bloqueio); return }
    setSalvando(true); setErro('')
    try {
      await moverEtapa(empresa, para, motivo, retomar)
      aoConcluir()
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="pilha" onSubmit={aoEnviar}>
      <label className="campo"><span>Mover para</span>
        <select id="troca-para" value={para} onChange={(e) => { setPara(e.target.value as Etapa); setErro('') }}>
          <option value="">Escolha a etapa</option>
          {destinosPossiveis(de).map((e) => <option key={e} value={e}>{rotuloEtapa[e]}</option>)}
        </select>
      </label>
      {para && exigeMotivo(para) && (
        <label className="campo"><span>Motivo <b>*</b></span>
          <textarea id="troca-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </label>
      )}
      {para && exigeRetomar(para) && (
        <label className="campo"><span>Retomar em <b>*</b></span>
          <input id="troca-retomar" type="date" value={retomar} onChange={(e) => setRetomar(e.target.value)} />
        </label>
      )}
      {erro && <p className="erro" role="alert">{erro}</p>}
      <div className="linha">
        <button className="botao primario" disabled={!para || salvando}>{salvando ? 'Salvando…' : 'Mover'}</button>
        {aoCancelar && <button type="button" className="botao leve" onClick={aoCancelar}>Cancelar</button>}
      </div>
    </form>
  )
}
