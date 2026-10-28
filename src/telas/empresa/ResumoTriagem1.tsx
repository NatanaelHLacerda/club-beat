import { rotuloPorte, type Empresa } from '../../dados/tipos'
import { classificarPorte } from '../../regras/classificacao'
import { decisorConsolidado } from '../../regras/decisor'
import { formatarCnpj } from '../../regras/formato'

// REQ-042 — dados consolidados da Triagem 1 mostrados na Triagem 2, sem digitar de novo.
export function ResumoTriagem1({ empresa }: { empresa: Empresa }) {
  const d = decisorConsolidado(empresa)
  const ou = (v: string | null | undefined) => v || '—'
  // Porte oficial só existe após a Triagem 2 salvar; até lá, calcula o provisório (mesma regra de AbaClassificacao) em vez de rotular o faturamento como "Porte".
  const porte = empresa.porte ?? classificarPorte({
    faturamento: empresa.faixa_faturamento, funcionarios: empresa.faixa_funcionarios, receitaPorte: empresa.receita_porte,
  }).porte
  return (
    <section className="cartao">
      <h3>Dados da Triagem 1</h3>
      <dl className="grade-2" style={{ margin: 0 }}>
        <Linha rotulo="Empresa" valor={`${empresa.marca} · ${formatarCnpj(empresa.cnpj)}`} />
        <Linha rotulo="Porte" valor={porte ? rotuloPorte[porte] : '—'} />
        <Linha rotulo="Faturamento" valor={ou(empresa.faixa_faturamento)} />
        <Linha rotulo="Responsável" valor={`${ou(empresa.contato_nome)}${empresa.contato_cargo ? ` · ${empresa.contato_cargo}` : ''}`} />
        <Linha rotulo="Contato do responsável" valor={[empresa.contato_email, empresa.contato_whatsapp].filter(Boolean).join(' · ') || '—'} />
        <Linha rotulo="Quem decide a parceria"
          valor={d.quem === 'responsavel' ? 'O próprio responsável' : d.quem === 'outra_pessoa' ? ou(d.nome) : 'Não informado'} />
        <Linha rotulo="Contato do decisor" valor={[d.email, d.whatsapp].filter(Boolean).join(' · ') || '—'} />
      </dl>
    </section>
  )
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="pilha" style={{ gap: 2 }}>
      <dt className="muted pequeno">{rotulo}</dt>
      <dd style={{ margin: 0, overflowWrap: 'anywhere' }}>{valor}</dd>
    </div>
  )
}
