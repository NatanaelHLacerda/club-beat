import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { EtapaTag, NomeEmpresa, PadraoTag } from '../../componentes/Rotulos'
import { Carregando, CartaoNumero, DataComIcone, Pill, Tabela } from '../../componentes/ui'
import { listarEmpresas } from '../../dados/api'
import type { Empresa } from '../../dados/tipos'
import { formatarData, formatarDinheiro, hojeISO } from '../../regras/formato'
import { quandoLegivel, respostaAtrasada, rotuloAbaNegociacao, separarNegociacao, type AbaNegociacao } from '../../regras/negociacao'
import { useConsulta } from '../../lib/useConsulta'

const abas: AbaNegociacao[] = ['analise', 'negociacao', 'reunioes']
const vazio: Record<AbaNegociacao, string> = {
  analise: 'Nenhuma proposta em análise.',
  negociacao: 'Nenhuma proposta aguardando resposta da empresa.',
  reunioes: 'Nenhuma reunião agendada.',
}
const ajuda: Record<AbaNegociacao, string> = {
  analise: 'Propostas sendo montadas, confirmadas por Operações ou com a Direção. Ainda não estão com a empresa.',
  negociacao: 'Propostas já enviadas à empresa, sem aceite por escrito.',
  reunioes: 'Empresas com reunião marcada, da mais próxima para a mais distante.',
}

// REQ-044 — visão de Negociação: tudo sai do que já existe na ficha (etapa, proposta e reunião).
export function Negociacao() {
  const navegar = useNavigate()
  const [aba, setAba] = useState<AbaNegociacao>('analise')
  const empresas = useConsulta(() => listarEmpresas({ recorte: 'funil' }))
  const grupos = separarNegociacao(empresas.dado ?? [])
  const hoje = hojeISO()
  const itens = grupos[aba]

  return (
    <>
      <Topo eyebrow="Funil de parcerias" titulo="Negociação" />
      <div className="numeros">
        {abas.map((a) => <CartaoNumero key={a} rotulo={rotuloAbaNegociacao[a]} icone={a === 'reunioes' ? 'calendario' : 'mensagem'} valor={empresas.dado ? grupos[a].length : '—'} />)}
      </div>
      <div className="alternar" role="group" aria-label="Negociação">
        {abas.map((a) => (
          <button key={a} className={aba === a ? 'ativo' : ''} aria-pressed={aba === a} onClick={() => setAba(a)}>{rotuloAbaNegociacao[a]} ({empresas.dado ? grupos[a].length : '—'})</button>
        ))}
      </div>
      <p className="muted pequeno">{ajuda[aba]}</p>
      {empresas.erro && <div className="aviso perigo" role="alert">{empresas.erro}</div>}
      {empresas.carregando && !empresas.dado ? <Carregando /> : (
        <Tabela<Empresa> itens={itens} chave={(e) => e.id} vazio={vazio[aba]} aoAbrir={(e) => navegar(`/empresas/${e.id}`)}
          destaque={(e) => (respostaAtrasada(e, hoje) ? 'atrasado' : null)}
          colunas={[
            { titulo: 'Empresa', render: (e) => <NomeEmpresa marca={e.marca} exemplo={e.exemplo} /> },
            { titulo: 'Padrão', render: (e) => <PadraoTag padrao={e.padrao_final} /> },
            ...(aba === 'reunioes' ? [
              { titulo: 'Quando', render: (e: Empresa) => quandoLegivel(e.reuniao?.quando) ?? <span className="muted">—</span> },
              { titulo: 'Onde', render: (e: Empresa) => (e.reuniao?.local ? `${e.reuniao.local}${e.reuniao.presencial ? ' · presencial' : ''}` : <span className="muted">—</span>) },
            ] : [
              { titulo: 'Etapa', render: (e: Empresa) => <EtapaTag etapa={e.etapa} /> },
              { titulo: 'Valor mensal', classe: 'num', render: (e: Empresa) => (e.proposta?.troca ? 'Troca' : formatarDinheiro(e.proposta?.valor_mensal_centavos)) },
              ...(aba === 'negociacao' ? [
                { titulo: 'Enviada em', classe: 'num muted', render: (e: Empresa) => formatarData(e.proposta?.enviada_em) },
                { titulo: 'Resposta até', render: (e: Empresa) => (e.proposta?.prazo_resposta
                  ? <DataComIcone texto={formatarData(e.proposta.prazo_resposta)} erro={respostaAtrasada(e, hoje)} />
                  : <Pill>Sem prazo</Pill>) },
              ] : []),
            ]),
          ]}
          acoes={[{ rotulo: 'Abrir ficha', icone: 'ver', aoClicar: (e) => navegar(`/empresas/${e.id}`) }]} />
      )}
    </>
  )
}
