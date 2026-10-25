import { useState } from 'react'
import { SemAcesso, Topo } from '../../componentes/Casca'
import { EtapaTag, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, BarraBusca, Carregando, CartaoNumero, Icone, Pill, Progresso, SecaoCabecalho, Tabela, Vazio, type NomeIcone } from '../../componentes/ui'
import { pode } from '../../lib/permissoes'
import { useSessao } from '../../sessao'

const icones: NomeIcone[] = ['inicio', 'funil', 'empresas', 'fila', 'direcao', 'parcerias', 'calendario', 'operacoes', 'juridico', 'renovacoes', 'painel', 'prazos', 'avisos', 'usuarios', 'regras', 'importar', 'busca', 'ver', 'editar', 'excluir', 'mover', 'copiar', 'mensagem', 'anexo', 'ativacao', 'alerta', 'check']

type Exemplo = { id: string; marca: string; padrao: 'bronze' | 'prata' | 'ouro' | 'master'; situacao: 'atrasado' | 'no_prazo' }
const linhas: Exemplo[] = [
  { id: '1', marca: 'Marca Exemplo A', padrao: 'prata', situacao: 'atrasado' },
  { id: '2', marca: 'Marca Exemplo B', padrao: 'master', situacao: 'no_prazo' },
]

// REQ-018 — página de referência das peças visuais (só administradora).
export function Componentes() {
  const { perfil } = useSessao()
  const [busca, setBusca] = useState('')
  const [acao, setAcao] = useState('')
  if (!pode(perfil, 'ver_componentes')) return (<><Topo titulo="Componentes" /><SemAcesso /></>)
  return (
    <>
      <Topo eyebrow="Configuração" titulo="Componentes" />
      <p className="muted">Referência das peças do novo visual. Dados desta página são de exemplo.</p>

      <SecaoCabecalho titulo="Cartões de número" para="/painel" />
      <div className="numeros">
        <CartaoNumero rotulo="Empresas que chegaram" valor="12" atual={12} anterior={10} icone="empresas" />
        <CartaoNumero rotulo="Dias até o contrato" valor="30" atual={30} anterior={25} menorEhMelhor icone="prazos" />
        <CartaoNumero rotulo="Receita mensal" valor="R$ …" atual={null} anterior={null} icone="painel" />
        <CartaoNumero rotulo="Sem mês anterior" valor="4" atual={4} anterior={0} />
      </div>

      <SecaoCabecalho titulo="Pills e padrões" />
      <div className="linha">
        <Pill>Neutra</Pill><Pill tom="ok" icone="check">No prazo</Pill><Pill tom="alerta">Vence hoje</Pill><Pill tom="perigo" icone="alerta">Atrasado</Pill>
        <Pill tom="ouro">Com a Direção</Pill><Pill tom="oceano">Oceano</Pill>
        <PadraoTag padrao="bronze" /><PadraoTag padrao="prata" /><PadraoTag padrao="ouro" /><PadraoTag padrao="master" />
        <EtapaTag etapa="triagem2" /><EtapaTag etapa="ativa" /><EtapaTag etapa="recusada" />
      </div>

      <SecaoCabecalho titulo="Avatar e busca" />
      <div className="linha"><Avatar nome="Fernanda (exemplo)" /><Avatar nome="Rede Verde" tamanho={40} /><Avatar nome="Clínica Brisa" tamanho={24} />
        <div style={{ width: 320 }}><BarraBusca valor={busca} mudar={setBusca} placeholder="Buscar empresa ou CNPJ" /></div></div>

      <SecaoCabecalho titulo="Tabela com ações" />
      <Tabela<Exemplo> itens={linhas} chave={(l) => l.id}
        destaque={(l) => (l.situacao === 'atrasado' ? 'atrasado' : null)}
        colunas={[
          { titulo: 'Marca', render: (l) => <span className="linha"><Avatar nome={l.marca} tamanho={26} />{l.marca}</span> },
          { titulo: 'Padrão', render: (l) => <PadraoTag padrao={l.padrao} /> },
          { titulo: 'Entregas', render: () => <Progresso feito={3} total={8} /> },
          { titulo: 'Prazo', render: (l) => <Pill tom={l.situacao === 'atrasado' ? 'perigo' : 'ok'}>{l.situacao === 'atrasado' ? 'Atrasado' : 'No prazo'}</Pill> },
        ]}
        acoes={[
          { rotulo: 'Ver', icone: 'ver', aoClicar: (l) => setAcao(`Ver ${l.marca}`) },
          { rotulo: 'Editar', icone: 'editar', aoClicar: (l) => setAcao(`Editar ${l.marca}`) },
          { rotulo: 'Excluir', icone: 'excluir', perigo: true, aoClicar: (l) => setAcao(`Excluir ${l.marca}`) },
        ]} />
      {acao && <p className="muted pequeno" role="status">Ação: {acao}</p>}

      <SecaoCabecalho titulo="Estados" />
      <div className="grade-2">
        <div className="cartao"><h3>Carregando</h3><Carregando /></div>
        <div className="cartao"><h3>Vazio</h3><Vazio texto="Nenhuma empresa encontrada." icone="empresas" /></div>
      </div>

      <SecaoCabecalho titulo="Ícones" />
      <div className="linha" style={{ color: 'var(--ink)' }}>
        {icones.map((i) => <span key={i} className="linha pequeno muted" style={{ gap: 4, width: 120 }}><Icone nome={i} />{i}</span>)}
      </div>
    </>
  )
}
