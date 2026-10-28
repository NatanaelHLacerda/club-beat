import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { nomeDe } from '../../componentes/Filtros'
import { NomeEmpresa, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, BarraBusca, Carregando, Pill, Tabela } from '../../componentes/ui'
import { listarEmpresas, listarUsuarios } from '../../dados/api'
import type { Empresa } from '../../dados/tipos'
import { situacaoArquivada } from '../../regras/etapas'
import { formatarCnpj, formatarData } from '../../regras/formato'
import { useConsulta } from '../../lib/useConsulta'

type Recorte = 'todas' | 'encerrada' | 'recusada'
const rotulos: Record<Recorte, string> = { todas: 'Todas', encerrada: 'Encerradas', recusada: 'Perdidas (recusadas)' }

// REQ-044 — Histórico / Arquivadas / Encerradas: o que saiu do funil ativo, com o motivo.
export function Historico() {
  const navegar = useNavigate()
  const [busca, setBusca] = useState('')
  const [recorte, setRecorte] = useState<Recorte>('todas')
  const empresas = useConsulta(() => listarEmpresas({ recorte: 'historico', busca }), [busca])
  const usuarios = useConsulta(listarUsuarios)
  const todas = empresas.dado ?? []
  const lista = recorte === 'todas' ? todas : todas.filter((e) => e.etapa === recorte)
  const conta = (r: Recorte) => (r === 'todas' ? todas.length : todas.filter((e) => e.etapa === r).length)

  return (
    <>
      <Topo eyebrow="Empresas" titulo="Histórico" acento="e arquivadas" />
      <p className="muted">Empresas que saíram do funil ativo: parcerias encerradas e leads perdidos. Cada uma guarda o motivo do fechamento.</p>
      <div className="linha">
        <BarraBusca id="historico-busca" valor={busca} mudar={setBusca} placeholder="Buscar por marca, razão social ou CNPJ" />
        <div className="alternar" role="group" aria-label="Situação">
          {(Object.keys(rotulos) as Recorte[]).map((r) => (
            <button key={r} className={recorte === r ? 'ativo' : ''} aria-pressed={recorte === r} onClick={() => setRecorte(r)}>{rotulos[r]} ({empresas.dado ? conta(r) : '—'})</button>
          ))}
        </div>
      </div>
      {empresas.erro && <div className="aviso perigo" role="alert">{empresas.erro}</div>}
      {empresas.carregando && !empresas.dado ? <Carregando linhas={4} /> : (
        <Tabela<Empresa> itens={lista} chave={(e) => e.id} aoAbrir={(e) => navegar(`/empresas/${e.id}`)} vazio="Nada arquivado por aqui."
          colunas={[
            { titulo: 'Marca', render: (e) => <NomeEmpresa marca={e.marca} exemplo={e.exemplo} /> },
            { titulo: 'CNPJ', classe: 'num muted', largo: true, render: (e) => formatarCnpj(e.cnpj) },
            { titulo: 'Situação', render: (e) => <Pill tom={e.etapa === 'recusada' ? 'perigo' : 'neutro'}>{situacaoArquivada(e.etapa)}</Pill> },
            { titulo: 'Padrão', render: (e) => <PadraoTag padrao={e.padrao_final} /> },
            { titulo: 'Motivo do fechamento', quebra: true, render: (e) => e.motivo_saida ?? <span className="muted">Não registrado</span> },
            { titulo: 'Responsável', render: (e) => { const r = e.responsavel_id ?? e.gerente1_id; return r ? <span className="linha" style={{ gap: 6, flexWrap: 'nowrap' }}><Avatar nome={nomeDe(usuarios.dado, r)} pessoa={r} tamanho={22} />{nomeDe(usuarios.dado, r).replace(/\s*\(exemplo\)$/, '')}</span> : <span className="muted">—</span> } },
            { titulo: 'Fechada em', classe: 'num muted', render: (e) => formatarData(e.etapa_desde) },
          ]}
          acoes={[{ rotulo: 'Ver', icone: 'ver', aoClicar: (e) => navegar(`/empresas/${e.id}`) }]} />
      )}
    </>
  )
}
