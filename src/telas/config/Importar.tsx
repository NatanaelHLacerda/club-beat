import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SemAcesso, Topo } from '../../componentes/Casca'
import { importarParceiros, type ResultadoImportacao } from '../../dados/api'
import { colunasImportacao, interpretarPlanilha, validarLinha, type LinhaImportacao, type ResultadoLeitura } from '../../regras/importacao'
import { rotuloEtapa } from '../../regras/etapas'
import { pode } from '../../lib/permissoes'
import { useSessao } from '../../sessao'

const exemploLinha = '11.222.333/0001-81;Marca Exemplo;Marca Exemplo Ltda;Ana;ana@exemplo.invalid;(31) 90000-0000;saúde e bem-estar;saúde e bem-estar;Prata;patrocinio;01/03/2026;28/02/2027;1.500,00;não;telas:1;ativacao_1d:4;ativacao_1d:2;;;fernanda@clubbeat.exemplo;sim'

export function Importar() {
  const { perfil } = useSessao()
  const [leitura, setLeitura] = useState<ResultadoLeitura | null>(null)
  const [nomeArquivo, setNomeArquivo] = useState('')
  const [resultado, setResultado] = useState<ResultadoImportacao[] | null>(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (!pode(perfil, 'editar_empresa')) return (<><Topo titulo="Importar parceiros" /><SemAcesso /></>)

  async function lerArquivo(arquivo: File | undefined) {
    if (!arquivo) return
    setErro(''); setResultado(null); setNomeArquivo(arquivo.name)
    setLeitura(interpretarPlanilha(await arquivo.text()))
  }

  async function importar(linhas: LinhaImportacao[]) {
    setErro(''); setEnviando(true)
    try { setResultado(await importarParceiros(linhas)) } catch (e) { setErro((e as Error).message) } finally { setEnviando(false) }
  }

  const recusadas = [...(leitura?.erros ?? []), ...(resultado ?? []).filter((r) => !r.ok).map((r) => ({ linha: r.linha, motivo: r.motivo ?? '' }))].sort((a, b) => a.linha - b.linha)
  const aceitas = (resultado ?? []).filter((r) => r.ok)

  return (
    <>
      <Topo eyebrow="Configuração" titulo="Importar parceiros atuais" />
      <p className="muted">Antes de o fluxo valer para novas empresas, a base atual entra no CRM na etapa real de cada parceiro: contrato assinado → Ativa (ou Em renovação se faltam menos de 90 dias); sem contrato → Em contrato, para regularizar com o Jurídico.</p>

      <section className="cartao">
        <h3>Planilha (CSV)</h3>
        <p className="pequeno">Primeira linha com as colunas abaixo, separadas por ponto e vírgula (do Excel: "Salvar como CSV"). Contrapartidas e entregas no formato <code>item:quantidade</code>, separados por ponto e vírgula dentro da célula entre aspas.</p>
        <pre className="codigo">{colunasImportacao.join(';')}{'\n'}{exemploLinha}</pre>
        <p className="muted pequeno">Itens: telas, marca_site, ativacao_1d, ativacao_3d, ativacao_4d, redes, eventos, beneficio_colaboradores, exclusividade, marca_recepcao, relatorio. Padrão vazio fica "a classificar". Sem CPF.</p>
        <label className="botao" style={{ alignSelf: 'flex-start' }}>Escolher arquivo CSV<input type="file" hidden accept=".csv,text/csv" onChange={(e) => { void lerArquivo(e.target.files?.[0]); e.target.value = '' }} /></label>
      </section>

      {leitura && !resultado && (
        <section className="cartao">
          <h3>{nomeArquivo}</h3>
          <p>{leitura.validas.length} linhas prontas · {leitura.erros.length} com erro</p>
          {leitura.validas.length > 0 && (
            <div className="tabela-rolagem">
              <table>
                <thead><tr><th>Linha</th><th>Marca</th><th>Padrão</th><th>Vigência</th><th>Contrato</th></tr></thead>
                <tbody>{leitura.validas.map((l) => (
                  <tr key={l.linha}><td className="num">{l.linha}</td><td>{l.marca}</td><td>{l.padrao || 'a classificar'}</td><td className="num">{l.inicio ?? '—'} a {l.fim ?? '—'}</td><td>{l.contrato_assinado ? 'assinado' : 'sem contrato'}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div><button className="botao primario" disabled={!leitura.validas.length || enviando} onClick={() => void importar(leitura.validas)}>{enviando ? 'Importando…' : `Importar ${leitura.validas.length} linhas`}</button></div>
        </section>
      )}

      {resultado && (
        <section className="cartao">
          <h3>Relatório da importação</h3>
          <p><b style={{ color: 'var(--ink)' }}>{aceitas.length} importadas</b> · {recusadas.length} recusadas</p>
          {aceitas.length > 0 && <p className="pequeno">{aceitas.map((a) => <span key={a.linha} style={{ marginRight: 10 }}>linha {a.linha}: <Link to={`/empresas/${a.empresa_id}`}>{a.etapa ? rotuloEtapa[a.etapa] : 'ok'}</Link></span>)}</p>}
        </section>
      )}

      {recusadas.length > 0 && (
        <section className="cartao">
          <h3>Linhas recusadas</h3>
          <div className="tabela-rolagem"><table><thead><tr><th>Linha</th><th>Motivo</th></tr></thead>
            <tbody>{recusadas.map((r) => <tr key={`${r.linha}-${r.motivo}`}><td className="num">{r.linha}</td><td className="erro">{r.motivo}</td></tr>)}</tbody></table></div>
        </section>
      )}

      <ParceriaManual aoImportar={(r) => setResultado(r)} erro={setErro} />
      {erro && <div className="aviso perigo" role="alert">{erro}</div>}
    </>
  )
}

// Uma parceria existente, sem planilha: o mesmo caminho da importação, com uma linha.
function ParceriaManual({ aoImportar, erro }: { aoImportar: (r: ResultadoImportacao[]) => void; erro: (m: string) => void }) {
  const [v, setV] = useState<Record<string, string>>({ contrato_assinado: 'sim' })
  const campo = (c: (typeof colunasImportacao)[number], rotulo: string, tipo = 'text') => (
    <label className="campo"><span>{rotulo}</span><input type={tipo} value={v[c] ?? ''} onChange={(e) => setV({ ...v, [c]: e.target.value })} /></label>
  )
  async function salvar() {
    const motivo = validarLinha((c) => (v[c] ?? '').trim())
    if (motivo) { erro(motivo); return }
    const texto = [colunasImportacao.join(';'), colunasImportacao.map((c) => `"${(v[c] ?? '').replace(/"/g, '""')}"`).join(';')].join('\n')
    try { aoImportar(await importarParceiros(interpretarPlanilha(texto).validas)) } catch (e) { erro((e as Error).message) }
  }
  return (
    <section className="cartao">
      <h3>Cadastrar uma parceria existente</h3>
      <div className="grade-3">
        {campo('cnpj', 'CNPJ')}{campo('marca', 'Marca')}{campo('razao_social', 'Razão social')}
        {campo('contato_nome', 'Contato')}{campo('contato_email', 'E-mail do contato', 'email')}{campo('categoria', 'Categoria')}
        {campo('padrao', 'Padrão (Bronze, Prata, Ouro, Master)')}{campo('inicio', 'Início', 'date')}{campo('fim', 'Fim', 'date')}
        {campo('valor_mensal', 'Valor mensal (R$)')}{campo('contrapartidas', 'Contrapartidas (item:qtd;…)')}{campo('entregas_feitas', 'Entregas já feitas (item:qtd;…)')}
        {campo('exclusividade_categoria', 'Exclusividade (categoria)')}{campo('responsavel_email', 'E-mail da Gerente responsável', 'email')}
      </div>
      <label className="marcar"><input type="checkbox" checked={v.contrato_assinado === 'sim'} onChange={(e) => setV({ ...v, contrato_assinado: e.target.checked ? 'sim' : 'não' })} /><span>Contrato assinado</span></label>
      <div><button className="botao primario" onClick={() => void salvar()}>Cadastrar parceria</button></div>
    </section>
  )
}
