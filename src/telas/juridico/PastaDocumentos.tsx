import { useRef, useState } from 'react'
import { Carregando, Tabela } from '../../componentes/ui'
import { apagarDocumentoJuridico, enviarDocumentoJuridico, lerPontuacao, listarDocumentosJuridicos, urlDocumentoJuridico } from '../../dados/api'
import { rotuloPasta, type DocumentoJuridico, type PastaJuridica } from '../../dados/tipos'
import { configPontuacaoPadrao, faixasDePontos, rotuloFaixaInvestimento } from '../../regras/classificacao'
import { formatarData } from '../../regras/formato'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'

const textoPasta: Record<PastaJuridica, string> = {
  minutas: 'Modelos de contrato para baixar e usar. A minuta de cada parceria segue o que foi aceito na proposta.',
  diretrizes: 'Critérios e pontos que separam Bronze, Prata e Ouro. Os números abaixo vêm da configuração viva do sistema; os documentos guardam o texto de referência.',
}

const tamanhoLegivel = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

export function PastaDocumentos({ pasta }: { pasta: PastaJuridica }) {
  const { perfil } = useSessao()
  const docs = useConsulta(() => listarDocumentosJuridicos(pasta), [pasta])
  const podeGerir = pode(perfil, 'gerir_documentos_juridicos')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const arquivo = useRef<HTMLInputElement>(null)

  async function enviar() {
    setErro('')
    const f = arquivo.current?.files?.[0]
    if (!titulo.trim()) { setErro('Dê um título ao documento.'); return }
    if (!f) { setErro('Escolha o arquivo.'); return }
    setEnviando(true)
    try {
      await enviarDocumentoJuridico(pasta, titulo, descricao, f)
      setTitulo(''); setDescricao(''); if (arquivo.current) arquivo.current.value = ''
      await docs.recarregar()
    } catch (e) { setErro((e as Error).message) } finally { setEnviando(false) }
  }

  async function baixar(d: DocumentoJuridico) {
    setErro('')
    try { window.open(await urlDocumentoJuridico(d.caminho, d.nome_arquivo), '_blank', 'noopener') } catch (e) { setErro((e as Error).message) }
  }

  async function apagar(d: DocumentoJuridico) {
    if (!window.confirm(`Apagar "${d.titulo}"? Não dá para desfazer.`)) return
    setErro('')
    try { await apagarDocumentoJuridico(d); await docs.recarregar() } catch (e) { setErro((e as Error).message) }
  }

  return (
    <section className="pilha">
      <h2>{rotuloPasta[pasta]}</h2>
      <p className="muted">{textoPasta[pasta]}</p>
      {pasta === 'diretrizes' && <RegrasVivas />}
      {podeGerir && (
        <div className="cartao pilha">
          <h3>Enviar documento</h3>
          <label className="campo"><span>Título <b>*</b></span><input value={titulo} maxLength={120} onChange={(e) => setTitulo(e.target.value)} /></label>
          <label className="campo"><span>Descrição</span><input value={descricao} maxLength={500} onChange={(e) => setDescricao(e.target.value)} /></label>
          <label className="campo"><span>Arquivo (PDF, Word, Excel, ODT ou TXT, até 20 MB) <b>*</b></span>
            <input ref={arquivo} type="file" accept=".pdf,.doc,.docx,.odt,.xls,.xlsx,.txt" /></label>
          <div className="linha"><button className="botao primario" disabled={enviando} onClick={() => void enviar()}>{enviando ? 'Enviando…' : 'Enviar'}</button></div>
        </div>
      )}
      {erro && <div className="aviso perigo" role="alert">{erro}</div>}
      {docs.erro && <div className="aviso perigo">{docs.erro}</div>}
      {docs.carregando && !docs.dado ? <Carregando /> : (
        <Tabela<DocumentoJuridico> itens={docs.dado ?? []} chave={(d) => d.id} vazio="Nenhum documento nesta pasta ainda."
          colunas={[
            { titulo: 'Documento', render: (d) => <div><b>{d.titulo}</b>{d.descricao && <div className="muted pequeno">{d.descricao}</div>}</div> },
            { titulo: 'Arquivo', render: (d) => <span className="pequeno">{d.nome_arquivo} · {tamanhoLegivel(d.tamanho)}</span> },
            { titulo: 'Enviado em', render: (d) => formatarData(d.criado_em) },
          ]}
          acoes={[
            { rotulo: 'Baixar', icone: 'importar', aoClicar: (d) => void baixar(d) },
            ...(podeGerir ? [{ rotulo: 'Apagar', icone: 'excluir' as const, aoClicar: (d: DocumentoJuridico) => void apagar(d) }] : []),
          ]} />
      )}
    </section>
  )
}

function RegrasVivas() {
  const pontuacao = useConsulta(lerPontuacao)
  const c = pontuacao.dado ?? configPontuacaoPadrao
  return (
    <div className="cartao pilha">
      <h3>Regras em vigor</h3>
      <p>{faixasDePontos(c).map((f) => `${f.padrao[0].toUpperCase()}${f.padrao.slice(1)}: ${f.de} a ${f.ate} pontos`).join(' · ')}. Abaixo de {c.cortes.minimo} pontos, a empresa fica sem padrão.</p>
      <p className="muted pequeno">{(['bronze', 'prata', 'ouro'] as const).map((f) => rotuloFaixaInvestimento(f, c.investimento)).join(' · ')}</p>
      <div className="tabela-rolagem">
        <table>
          <thead><tr><th>Critério</th><th>Opção 1</th><th>Opção 2</th><th>Opção 3</th></tr></thead>
          <tbody>
            {c.criterios.map((cr) => (
              <tr key={cr.id}><td>{cr.rotulo}</td>{cr.opcoes.map((o) => <td key={o.rotulo} className="pequeno">{o.rotulo} <span className="muted">({o.pontos})</span></td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
