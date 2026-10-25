import { Link } from 'react-router-dom'
import { nomeDe } from '../../componentes/Filtros'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, Pill } from '../../componentes/ui'
import type { Empresa, Perfil, PrazoAberto } from '../../dados/tipos'
import { diasDesde, hojeISO } from '../../regras/formato'
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
}

// REQ-021 — cartão do funil: avatar, marca, segmento, padrão, responsável, dias na etapa e prazo.
export function CartaoEmpresa({ empresa: e, usuarios, prazo, arrastavel, aoArrastar, aoSoltar }: Props) {
  const hoje = hojeISO()
  const parado = e.etapa === 'triagem1' && semRetorno(e.pedido_info_em, hoje)
  const semResposta = e.etapa === 'proposta' && respostaVencida(e.proposta?.prazo_resposta, e.proposta?.aceite_em, hoje)
  const atrasado = parado || semResposta || prazo?.situacao === 'atrasado'
  const responsavel = e.responsavel_id ?? e.gerente1_id
  return (
    <Link to={`/empresas/${e.id}`} className={`cartao-empresa${atrasado ? ' atrasado' : prazo?.situacao === 'vence_hoje' ? ' vence' : ''}`}
      draggable={arrastavel} onDragStart={aoArrastar} onDragEnd={aoSoltar}>
      <div className="linha" style={{ gap: 10, flexWrap: 'nowrap' }}>
        <Avatar nome={e.marca} tamanho={34} />
        <span className="pilha" style={{ gap: 0, minWidth: 0 }}>
          <b style={{ overflowWrap: 'anywhere' }}>{e.marca}</b>
          <span className="muted pequeno">{e.segmento}</span>
        </span>
      </div>
      <div className="linha" style={{ gap: 6 }}>
        <PadraoTag padrao={e.padrao_final} />
        <Exemplo mostrar={e.exemplo} />
      </div>
      {parado && <span className="erro pequeno">Sem retorno há {diasDesdePedido(e.pedido_info_em, hoje)} dias</span>}
      {semResposta && <span className="erro pequeno">Prazo de resposta vencido</span>}
      <div className="rodape">
        {responsavel ? <span className="linha pequeno muted" style={{ gap: 6 }} title={nomeDe(usuarios, responsavel)}><Avatar nome={nomeDe(usuarios, responsavel)} tamanho={20} />{nomeDe(usuarios, responsavel).replace(/\s*\(exemplo\)$/, '')}</span> : <span className="muted pequeno">Sem responsável</span>}
        {prazo && prazo.situacao !== 'no_prazo' ? (
          <Pill tom={prazo.situacao === 'atrasado' ? 'perigo' : 'alerta'}>{rotuloSituacaoPrazo[prazo.situacao]}</Pill>
        ) : <span className="muted pequeno num">{diasDesde(e.etapa_desde)} d na etapa</span>}
      </div>
    </Link>
  )
}
