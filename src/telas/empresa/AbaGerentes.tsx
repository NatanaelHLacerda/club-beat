import { useEffect, useState } from 'react'
import { nomeDe } from '../../componentes/Filtros'
import { definirGerente2, passarAGerente, sugerirGerente } from '../../dados/api'
import { formatarDataHora } from '../../regras/formato'
import { camposPassagem, pendenciasPassagem, rotuloPrecisaDirecao, textosPassagem, type FichaPassagem, type PrecisaDirecao } from '../../regras/passagem'
import { pode } from '../../lib/permissoes'
import { useSessao } from '../../sessao'
import type { PropsAba } from './Ficha'

export function AbaGerentes({ empresa, usuarios, atualizar }: PropsAba) {
  const { perfil } = useSessao()
  const gerentes = usuarios.filter((u) => u.papel === 'gerente' && u.ativo)
  const [sugerida, setSugerida] = useState<string | null>(null)
  const [escolhida, setEscolhida] = useState('')
  const [motivo, setMotivo] = useState('')
  const [ficha, setFicha] = useState<FichaPassagem>(empresa.passagem ?? {})
  const [gerente2, setGerente2] = useState(empresa.gerente2_id ?? '')
  const [responsavel, setResponsavel] = useState(empresa.responsavel_id ?? '')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const podeMexer = pode(perfil, 'triar')

  useEffect(() => {
    if (empresa.passada_em || !empresa.triagem2_concluida_em) return
    let vivo = true
    sugerirGerente().then((g) => { if (vivo) { setSugerida(g); setEscolhida(g ?? '') } }, () => {})
    return () => { vivo = false }
  }, [empresa.passada_em, empresa.triagem2_concluida_em])

  async function passar() {
    setErro(''); setAviso('')
    if (escolhida && escolhida !== sugerida && !motivo.trim()) { setErro(textosPassagem.motivoTroca); return }
    try { await passarAGerente(empresa.id, escolhida || null, motivo); await atualizar() } catch (e) { setErro((e as Error).message) }
  }

  async function salvarGerente2() {
    setErro(''); setAviso('')
    if (gerente2 && gerente2 !== empresa.gerente1_id && pendenciasPassagem(ficha).length) { setErro(textosPassagem.fichaIncompleta); return }
    try {
      await definirGerente2(empresa.id, gerente2, ficha, responsavel || empresa.gerente1_id!)
      setAviso('Gerente 2 e responsável final salvos.')
      await atualizar()
    } catch (e) { setErro((e as Error).message) }
  }

  const faltam = pendenciasPassagem(ficha)
  return (
    <div className="pilha">
      <section className="cartao">
        <h3>Passagem à Gerente 1</h3>
        {empresa.passada_em ? (
          <p>Passada a <b style={{ color: 'var(--ink)' }}>{nomeDe(usuarios, empresa.gerente1_id)}</b> em {formatarDataHora(empresa.passada_em)} · {empresa.distribuicao === 'manual' ? 'troca manual' : 'revezamento'}.</p>
        ) : !empresa.triagem2_concluida_em ? (
          <p className="muted">{textosPassagem.semTriagem}</p>
        ) : !podeMexer ? (
          <p className="muted">Aguardando a passagem pela 1ª pessoa.</p>
        ) : (
          <>
            <p>Pelo revezamento, a próxima é <b style={{ color: 'var(--ink)' }}>{sugerida ? nomeDe(usuarios, sugerida) : '—'}</b>.{!sugerida && <span className="erro"> {textosPassagem.semGerente}</span>}</p>
            <div className="grade-2">
              <label className="campo"><span>Gerente que conduz</span>
                <select id="g-gerente1" value={escolhida} onChange={(e) => setEscolhida(e.target.value)}>
                  {gerentes.map((g) => <option key={g.id} value={g.id}>{g.nome}{g.disponivel ? '' : ' (indisponível)'}</option>)}
                </select>
              </label>
              {escolhida && escolhida !== sugerida && (
                <label className="campo"><span>Motivo da troca <b>*</b></span><input id="g-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} /></label>
              )}
            </div>
            <p className="muted pequeno">Ao passar, a empresa recebe a mensagem A2 com o nome da Gerente, e a Gerente recebe um aviso.</p>
            <div><button className="botao primario" onClick={() => void passar()}>Passar à Gerente</button></div>
          </>
        )}
      </section>

      {empresa.passada_em && (
        <section className="cartao">
          <h3>Ficha de passagem (Gerente 1 → Gerente 2)</h3>
          <p className="muted pequeno">Obrigatória quando outra Gerente vai finalizar. Uma Gerente pode conduzir e finalizar sozinha.</p>
          <div className="grade-2">
            {camposPassagem.map((c) => (
              <label key={c.id} className="campo"><span>{c.rotulo}</span>
                <textarea id={`p-${c.id}`} disabled={!podeMexer} value={ficha[c.id] ?? ''} onChange={(e) => setFicha({ ...ficha, [c.id]: e.target.value })} />
              </label>
            ))}
            <div className="pilha">
              <label className="campo"><span>Precisa da Direção?</span>
                <select id="p-direcao" disabled={!podeMexer} value={ficha.precisa_direcao ?? ''} onChange={(e) => setFicha({ ...ficha, precisa_direcao: (e.target.value || undefined) as PrecisaDirecao })}>
                  <option value="">Escolha</option>
                  {(Object.keys(rotuloPrecisaDirecao) as PrecisaDirecao[]).map((k) => <option key={k} value={k}>{rotuloPrecisaDirecao[k]}</option>)}
                </select>
              </label>
              <label className="campo"><span>Prazo combinado para o retorno</span>
                <input id="p-prazo" type="date" disabled={!podeMexer} value={ficha.prazo_retorno ?? ''} onChange={(e) => setFicha({ ...ficha, prazo_retorno: e.target.value })} />
              </label>
            </div>
          </div>
          <div className="grade-2">
            <label className="campo"><span>Gerente 2 (finaliza)</span>
              <select id="g-gerente2" disabled={!podeMexer} value={gerente2} onChange={(e) => setGerente2(e.target.value)}>
                <option value="">Escolha</option>
                {gerentes.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
              </select>
            </label>
            <label className="campo"><span>Responsável final</span>
              <select id="g-responsavel" disabled={!podeMexer} value={responsavel} onChange={(e) => setResponsavel(e.target.value)}>
                {[empresa.gerente1_id, gerente2].filter((v, i, a) => v && a.indexOf(v) === i).map((id) => <option key={id!} value={id!}>{nomeDe(usuarios, id)}</option>)}
              </select>
            </label>
          </div>
          {gerente2 && gerente2 !== empresa.gerente1_id && faltam.length > 0 && <p className="muted pequeno">Falta: {faltam.join(', ')}</p>}
          {podeMexer && <div><button className="botao primario" disabled={!gerente2} onClick={() => void salvarGerente2()}>Salvar Gerente 2</button></div>}
        </section>
      )}
      {erro && <div className="aviso perigo" role="alert">{erro}</div>}
      {aviso && <div className="aviso" role="status">{aviso}</div>}
    </div>
  )
}
