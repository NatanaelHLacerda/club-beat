import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, Carregando, CartaoNumero, DataComIcone, Pill, Progresso, Tabela } from '../../componentes/ui'
import { listarEntregas, listarParcerias, listarRelatorios, listarUsuarios } from '../../dados/api'
import type { ParceriaComEmpresa } from '../../dados/tipos'
import { contratadoFeito, proximoBalanco, proximoRelatorio, textosAcompanhamento } from '../../regras/acompanhamento'
import { formatarData, hojeISO } from '../../regras/formato'
import { useConsulta } from '../../lib/useConsulta'

export function Parcerias() {
  const navegar = useNavigate()
  const hoje = hojeISO()
  const parcerias = useConsulta(() => listarParcerias('vigente'))
  const entregas = useConsulta(() => listarEntregas())
  const relatorios = useConsulta(() => listarRelatorios())
  const usuarios = useConsulta(listarUsuarios)
  const lista = parcerias.dado ?? []
  const nasTelas = lista.filter((p) => p.contrapartidas.some((c) => c.item === 'telas') && p.inicio <= hoje && p.fim >= hoje).length
  const relDe = (p: ParceriaComEmpresa) => proximoRelatorio(p.padrao, p.inicio, (relatorios.dado ?? []).filter((r) => r.parceria_id === p.id), hoje)
  const balDe = (p: ParceriaComEmpresa) => proximoBalanco(p.inicio, (relatorios.dado ?? []).filter((r) => r.parceria_id === p.id), hoje)
  const ativacoes = (p: ParceriaComEmpresa) => {
    const r = contratadoFeito(p.contrapartidas, (entregas.dado ?? []).filter((e) => e.parceria_id === p.id)).filter((x) => x.item.startsWith('ativacao'))
    return { feito: r.reduce((s, x) => s + x.feito, 0), total: r.some((x) => x.contratado === null) ? null : r.reduce((s, x) => s + (x.contratado ?? 0), 0) }
  }
  const atrasados = lista.filter((p) => relDe(p)?.atrasado).length

  return (
    <>
      <Topo eyebrow="Parcerias" titulo="Parcerias ativas" />
      <div className="numeros">
        <CartaoNumero rotulo="Parcerias vigentes" icone="parcerias" valor={parcerias.dado ? lista.length : '—'} />
        <CartaoNumero rotulo="Marcas nas telas agora" icone="painel" valor={parcerias.dado ? `${nasTelas} de 8` : '—'} />
        <CartaoNumero rotulo="Relatórios atrasados" icone="alerta" valor={parcerias.dado && relatorios.dado ? atrasados : '—'} />
        <CartaoNumero rotulo="Por padrão" icone="ativacao" valor={parcerias.dado ? <span className="linha pequeno" style={{ gap: 8 }}>{(['bronze', 'prata', 'ouro', 'master'] as const).map((x) => <span key={x}><PadraoTag padrao={x} /> {lista.filter((p) => p.padrao === x).length}</span>)}</span> : '—'} />
      </div>
      {parcerias.erro && <div className="aviso perigo">{parcerias.erro}</div>}
      {parcerias.carregando && !parcerias.dado ? <Carregando /> : (
        <Tabela<ParceriaComEmpresa> itens={lista} chave={(p) => p.id} vazio="Nenhuma parceria ativa."
          aoAbrir={(p) => navegar(`/empresas/${p.empresa_id}`)}
          destaque={(p) => (relDe(p)?.atrasado ? 'atrasado' : balDe(p)?.atrasado ? 'alerta' : null)}
          colunas={[
            { titulo: 'Parceira', render: (p) => <span className="linha" style={{ gap: 10, flexWrap: 'nowrap' }}><Avatar nome={p.empresas.marca} tamanho={28} /><span className="pilha" style={{ gap: 0 }}><b style={{ color: 'var(--ink)', fontWeight: 500 }}>{p.empresas.marca}</b><Exemplo mostrar={p.empresas.exemplo} /></span></span> },
            { titulo: 'Padrão', render: (p) => <PadraoTag padrao={p.padrao} /> },
            { titulo: 'Ativações', render: (p) => { const a = ativacoes(p); return <Progresso feito={a.feito} total={a.total} rotulo="Ativações feitas / contratadas" /> } },
            { titulo: 'Próximo relatório', render: (p) => { const r = relDe(p); return r ? <span className="pilha" style={{ gap: 2 }}><DataComIcone texto={formatarData(r.prazo)} erro={r.atrasado} />{r.atrasado && <Pill tom="perigo">{textosAcompanhamento.atrasado}</Pill>}</span> : <Pill tom="ok">em dia</Pill> } },
            { titulo: 'Balanço', render: (p) => { const b = balDe(p); return b ? <DataComIcone texto={formatarData(b.prazo)} erro={b.atrasado} /> : <Pill tom="ok">em dia</Pill> } },
            { titulo: 'Fim', render: (p) => <DataComIcone texto={formatarData(p.fim)} /> },
            { titulo: 'Responsável', render: (p) => p.responsavel_id ? <span className="linha" style={{ gap: 6, flexWrap: 'nowrap' }}><Avatar nome={nomeDe(usuarios.dado, p.responsavel_id)} tamanho={22} />{nomeDe(usuarios.dado, p.responsavel_id).replace(/\s*\(exemplo\)$/, '')}</span> : '—' },
          ]}
          acoes={[{ rotulo: 'Abrir parceria', icone: 'ver', aoClicar: (p) => navegar(`/empresas/${p.empresa_id}`) }]} />
      )}
    </>
  )
}
