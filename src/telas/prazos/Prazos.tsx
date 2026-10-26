import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { EtapaTag } from '../../componentes/Rotulos'
import { Avatar, Carregando, CartaoNumero, DataComIcone, Pill, Tabela } from '../../componentes/ui'
import { listarPrazos, listarUsuarios } from '../../dados/api'
import { rotuloPapel, type PrazoAberto } from '../../dados/tipos'
import { formatarData } from '../../regras/formato'
import { ordemSituacao, rotuloSituacaoPrazo } from '../../regras/prazos'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

const tom = { atrasado: 'perigo', vence_hoje: 'alerta', no_prazo: 'neutro' } as const

export function Prazos() {
  const { perfil } = useSessao()
  const navegar = useNavigate()
  const prazos = useConsulta(listarPrazos)
  const usuarios = useConsulta(listarUsuarios)
  const [meus, setMeus] = useState(false)
  const ehMeu = (p: PrazoAberto) => p.responsavel_id === perfil?.id || (!p.responsavel_id && p.papel_responsavel === perfil?.papel)
  const lista = (prazos.dado ?? []).filter((p) => !meus || ehMeu(p)).sort((a, b) => ordemSituacao[a.situacao] - ordemSituacao[b.situacao] || a.prazo.localeCompare(b.prazo))
  const conta = (s: PrazoAberto['situacao']) => lista.filter((p) => p.situacao === s).length

  return (
    <>
      <Topo eyebrow="Acompanhamento" titulo="Prazos">
        <label className="marcar"><input type="checkbox" checked={meus} onChange={(e) => setMeus(e.target.checked)} /><span>Só os meus</span></label>
      </Topo>
      <div className="numeros">
        <CartaoNumero rotulo="Atrasados" icone="alerta" valor={prazos.dado ? conta('atrasado') : '—'} />
        <CartaoNumero rotulo="Vencem hoje" icone="prazos" valor={prazos.dado ? conta('vence_hoje') : '—'} />
        <CartaoNumero rotulo="No prazo" icone="check" valor={prazos.dado ? conta('no_prazo') : '—'} />
      </div>
      <p className="muted pequeno">Prazos em dias úteis (sem sábado, domingo e feriados cadastrados). Avisos e escalonamento saem todo dia às 6h10.</p>
      {prazos.erro && <div className="aviso perigo">{prazos.erro}</div>}
      {prazos.carregando && !prazos.dado ? <Carregando /> : (
        <Tabela<PrazoAberto> itens={lista} chave={(p) => `${p.empresa_id}-${p.descricao}`} vazio="Nenhum prazo aberto."
          aoAbrir={(p) => navegar(`/empresas/${p.empresa_id}`)}
          destaque={(p) => (p.situacao === 'atrasado' ? 'atrasado' : p.situacao === 'vence_hoje' ? 'alerta' : null)}
          colunas={[
            { titulo: 'Empresa', render: (p) => <span className="linha" style={{ gap: 10, flexWrap: 'nowrap' }}><Avatar nome={p.marca} tamanho={28} /><b style={{ color: 'var(--ink)', fontWeight: 500 }}>{p.marca}</b></span> },
            { titulo: 'O que falta', render: (p) => p.descricao },
            { titulo: 'Etapa', render: (p) => <EtapaTag etapa={p.etapa} /> },
            { titulo: 'Prazo', render: (p) => <DataComIcone texto={formatarData(p.prazo)} erro={p.situacao === 'atrasado'} /> },
            { titulo: 'Situação', render: (p) => <Pill tom={tom[p.situacao]}>{rotuloSituacaoPrazo[p.situacao]}</Pill> },
            { titulo: 'Com quem', render: (p) => p.responsavel_id ? <span className="linha" style={{ gap: 6, flexWrap: 'nowrap' }}><Avatar nome={nomeDe(usuarios.dado, p.responsavel_id)} pessoa={p.responsavel_id} tamanho={22} />{nomeDe(usuarios.dado, p.responsavel_id).replace(/\s*\(exemplo\)$/, '')}</span> : <span className="muted">{rotuloPapel[p.papel_responsavel]}</span> },
          ]}
          acoes={[{ rotulo: 'Abrir empresa', icone: 'ver', aoClicar: (p) => navegar(`/empresas/${p.empresa_id}`) }]} />
      )}
    </>
  )
}
