import { useState } from 'react'
import { SemAcesso, Topo } from '../../componentes/Casca'
import { EtapaTag, PadraoTag } from '../../componentes/Rotulos'
import { Avatar, BarraBusca, Carregando, CartaoNumero, Icone, PainelLateral, Pill, Progresso, SecaoCabecalho, Tabela, Vazio, type NomeIcone } from '../../componentes/ui'
import { pode } from '../../lib/permissoes'
import { useSessao } from '../../sessao'

const icones: NomeIcone[] = ['inicio', 'funil', 'empresas', 'fila', 'direcao', 'parcerias', 'calendario', 'operacoes', 'juridico', 'renovacoes', 'painel', 'prazos', 'avisos', 'usuarios', 'regras', 'importar', 'busca', 'ver', 'editar', 'excluir', 'mover', 'copiar', 'mensagem', 'anexo', 'ativacao', 'alerta', 'check']

type Exemplo = { id: string; marca: string; padrao: 'bronze' | 'prata' | 'ouro' | 'master'; situacao: 'atrasado' | 'no_prazo' }
const linhas: Exemplo[] = [
  { id: '1', marca: 'Marca Exemplo A', padrao: 'prata', situacao: 'atrasado' },
  { id: '2', marca: 'Marca Exemplo B', padrao: 'master', situacao: 'no_prazo' },
]

// REQ-018/032 — página de referência das peças visuais (só administradora).
export function Componentes() {
  const { perfil } = useSessao()
  const [busca, setBusca] = useState('')
  const [acao, setAcao] = useState('')
  const [modo, setModo] = useState<'quadro' | 'lista'>('quadro')
  const [painel, setPainel] = useState(false)
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

      <SecaoCabecalho titulo="Botões" />
      <div className="linha">
        <button type="button" className="botao primario">Salvar</button>
        <button type="button" className="botao primario"><Icone nome="mais" tamanho={14} />Nova empresa</button>
        <button type="button" className="botao">Contorno</button>
        <button type="button" className="botao leve">Leve</button>
        <button type="button" className="botao perigo">Recusar</button>
        <button type="button" className="botao primario" disabled>Desativado</button>
        <button type="button" className="botao primario grande">Grande</button>
      </div>

      <SecaoCabecalho titulo="Campos" />
      <div className="grade-3">
        <label className="campo"><span>Nome da marca <b>*</b></span><input defaultValue="Marca Exemplo" /></label>
        <label className="campo"><span>Segmento</span><select defaultValue=""><option value="">Escolha uma opção</option><option>tecnologia</option></select></label>
        <label className="campo invalido"><span>CNPJ <b>*</b></span><input defaultValue="11.111.111/1111-11" aria-invalid="true" aria-describedby="cnpj-erro" /><small id="cnpj-erro" className="msg">CNPJ inválido</small></label>
      </div>
      <label className="marcar"><input type="checkbox" defaultChecked /><span>Caixa de marcar</span></label>

      <SecaoCabecalho titulo="Alternador e painel lateral" />
      <div className="linha">
        <div className="alternar" role="group" aria-label="Modo de exibição">
          <button type="button" className={modo === 'quadro' ? 'ativo' : ''} aria-pressed={modo === 'quadro'} onClick={() => setModo('quadro')}><Icone nome="funil" tamanho={14} />Quadro</button>
          <button type="button" className={modo === 'lista' ? 'ativo' : ''} aria-pressed={modo === 'lista'} onClick={() => setModo('lista')}><Icone nome="fila" tamanho={14} />Lista</button>
        </div>
        <button type="button" className="botao" onClick={() => setPainel(true)}>Abrir painel lateral</button>
      </div>
      {painel && <PainelLateral titulo="Painel de exemplo" aoFechar={() => setPainel(false)}><p className="muted">Conteúdo do painel.</p></PainelLateral>}

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
