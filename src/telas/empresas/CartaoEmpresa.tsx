import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { nomeDe } from '../../componentes/Filtros'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, Icone, Pill } from '../../componentes/ui'
import type { Empresa, Perfil, PrazoAberto } from '../../dados/tipos'
import { diasDesde, formatarData, hojeISO } from '../../regras/formato'
import { rotuloSituacaoPrazo } from '../../regras/prazos'
import { respostaVencida } from '../../regras/proposta'
import { diasDesdePedido, semRetorno } from '../../regras/triagem1'

type Props = {
  empresa: Empresa
  usuarios: Perfil[]
  prazo?: PrazoAberto
  arrastavel: boolean
  aoArrastar: () => void
  aoSoltar: () => void
  aoMover?: () => void
}

// REQ-021/029 — cartão do funil: avatar, marca, padrão e uma grade chave–valor; menu "⋯" com Abrir ficha e Mover etapa.
export function CartaoEmpresa({ empresa: e, usuarios, prazo, arrastavel, aoArrastar, aoSoltar, aoMover }: Props) {
  const hoje = hojeISO()
  const parado = e.etapa === 'triagem1' && semRetorno(e.pedido_info_em, hoje)
  const semResposta = e.etapa === 'proposta' && respostaVencida(e.proposta?.prazo_resposta, e.proposta?.aceite_em, hoje)
  const atrasado = parado || semResposta || prazo?.situacao === 'atrasado'
  const responsavel = e.responsavel_id ?? e.gerente1_id
  const marca = e.exemplo ? e.marca.replace(/\s*\(exemplo\)$/i, '') : e.marca
  const dias = diasDesde(e.etapa_desde)
  return (
    <article className={`cartao-empresa${atrasado ? ' atrasado' : prazo?.situacao === 'vence_hoje' ? ' vence' : ''}`}
      draggable={arrastavel} onDragStart={aoArrastar} onDragEnd={aoSoltar}>
      <div className="cartao-empresa-topo">
        <Avatar nome={e.marca} tamanho={32} />
        <span className="pilha" style={{ gap: 2, minWidth: 0 }}>
          <Link to={`/empresas/${e.id}`} className="cartao-link" title={e.marca} draggable={false}>{marca}</Link>
          <span className="linha" style={{ gap: 6 }}><PadraoTag padrao={e.padrao_final} /><Exemplo mostrar={e.exemplo} /></span>
        </span>
        <MenuCartao empresa={e.id} aoMover={aoMover} />
      </div>
      {parado && <span className="erro pequeno">Sem retorno há {diasDesdePedido(e.pedido_info_em, hoje)} dias</span>}
      {semResposta && <span className="erro pequeno">Prazo de resposta vencido</span>}
      <dl className="cartao-empresa-dados">
        <dt>Segmento</dt><dd title={e.segmento}>{e.segmento}</dd>
        <dt>Responsável</dt>
        <dd>{responsavel ? <span className="linha" style={{ gap: 6, flexWrap: 'nowrap' }}><Avatar nome={nomeDe(usuarios, responsavel)} pessoa={responsavel} tamanho={18} />{nomeDe(usuarios, responsavel).replace(/\s*\(exemplo\)$/, '')}</span> : <span className="muted">Sem responsável</span>}</dd>
        <dt>Na etapa</dt><dd className="num">{dias === 1 ? '1 dia' : `${dias} dias`}</dd>
        <dt>Prazo</dt>
        <dd>{prazo ? <span className="linha" style={{ gap: 6, flexWrap: 'nowrap' }}><Pill tom={prazo.situacao === 'atrasado' ? 'perigo' : prazo.situacao === 'vence_hoje' ? 'alerta' : 'neutro'}>{rotuloSituacaoPrazo[prazo.situacao]}</Pill><span className="num muted">{formatarData(prazo.prazo).slice(0, 5)}</span></span> : <span className="muted">—</span>}</dd>
      </dl>
    </article>
  )
}

function MenuCartao({ empresa, aoMover }: { empresa: string; aoMover?: () => void }) {
  const [aberto, setAberto] = useState(false)
  const caixa = useRef<HTMLDivElement>(null)
  const navegar = useNavigate()
  useEffect(() => {
    if (!aberto) return
    const fora = (ev: MouseEvent) => { if (!caixa.current?.contains(ev.target as Node)) setAberto(false) }
    const tecla = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setAberto(false) }
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', tecla)
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', tecla) }
  }, [aberto])
  return (
    <div className="menu-cartao" ref={caixa}>
      <button type="button" className="botao-icone" aria-label="Mais opções" aria-haspopup="menu" aria-expanded={aberto} onClick={() => setAberto((a) => !a)}>
        <Icone nome="opcoes" tamanho={18} />
      </button>
      {aberto && (
        <div className="flutuante menu-cartao-lista" role="menu">
          <button type="button" role="menuitem" className="resultado" onClick={() => navegar(`/empresas/${empresa}`)}><Icone nome="ver" tamanho={16} />Abrir ficha</button>
          {aoMover && <button type="button" role="menuitem" className="resultado" onClick={() => { setAberto(false); aoMover() }}><Icone nome="mover" tamanho={16} />Mover etapa</button>}
        </div>
      )}
    </div>
  )
}
