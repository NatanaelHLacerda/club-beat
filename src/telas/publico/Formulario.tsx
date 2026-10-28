import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { enviarFicha, whatsappDoClub, type ArquivoFicha } from '../../dados/api'
import { duracoes, faixasFaturamento, faixasFuncionarios, objetivos, opcoesBusca, quemDecideOpcoes, segmentos, temposAtuacao, ufs } from '../../dados/campos'
import type { TipoAnexo } from '../../dados/tipos'
import { CabecalhoPublico, IndicadorEtapas } from '../../componentes/Moldura'
import { decideOutraPessoaSim } from '../../regras/decisor'
import { fichaVazia, limiteArquivo, textosFormulario, tiposAceitos, titulosEtapas, validarEtapa, type Erros, type Ficha } from '../../regras/formulario'

type CampoTexto = { [K in keyof Ficha]: Ficha[K] extends string ? K : never }[keyof Ficha]

export function Formulario() {
  const [etapa, setEtapa] = useState(1)
  const [ficha, setFicha] = useState<Ficha>(fichaVazia)
  const [arquivos, setArquivos] = useState<ArquivoFicha[]>([])
  const [erros, setErros] = useState<Erros>({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [whatsapp, setWhatsapp] = useState<string | null>(null)
  const [isca, setIsca] = useState('')
  const inicio = useRef(0)
  const topo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inicio.current = Date.now()
    void whatsappDoClub().then(setWhatsapp)
  }, [])

  const mudar = <K extends keyof Ficha>(c: K, v: Ficha[K]) => { setFicha((f) => ({ ...f, [c]: v })); setErros((e) => ({ ...e, [c]: undefined })) }

  function avancar() {
    const e = validarEtapa(etapa, ficha, arquivos.map((a) => ({ tamanho: a.arquivo.size })))
    setErros(e)
    if (Object.values(e).some(Boolean)) return
    setEtapa(etapa + 1)
    topo.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function enviar() {
    const e = validarEtapa(5, ficha)
    setErros(e); setErroGeral('')
    if (Object.values(e).some(Boolean)) return
    setEnviando(true)
    try {
      await enviarFicha(ficha, arquivos, Math.round((Date.now() - inicio.current) / 1000), isca)
      setEnviado(true)
    } catch (err) {
      setErroGeral((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  function adicionarArquivo(arquivo: File | undefined, tipo: TipoAnexo) {
    if (!arquivo) return
    if (arquivo.size > limiteArquivo) { setErros((e) => ({ ...e, arquivos: textosFormulario.arquivoGrande })); return }
    setErros((e) => ({ ...e, arquivos: undefined }))
    setArquivos((l) => [...l.filter((a) => a.tipo !== tipo || tipo === 'portfolio'), { arquivo, tipo }])
  }

  const texto = (c: CampoTexto, rotulo: string, obrig = false, props: { tipo?: string; ajuda?: string; placeholder?: string; longo?: boolean; max?: number } = {}) => (
    <Campo rotulo={rotulo} obrig={obrig} erro={erros[c]} ajuda={props.ajuda}>
      {props.longo ? (
        <textarea id={`f-${c}`} value={ficha[c]} maxLength={props.max} onChange={(e) => mudar(c, e.target.value)} />
      ) : (
        <input id={`f-${c}`} type={props.tipo ?? 'text'} placeholder={props.placeholder} value={ficha[c]} onChange={(e) => mudar(c, e.target.value)} />
      )}
    </Campo>
  )
  const lista = (c: CampoTexto, rotulo: string, opcoes: string[], obrig = false) => (
    <Campo rotulo={rotulo} obrig={obrig} erro={erros[c]}>
      <select id={`f-${c}`} value={ficha[c]} onChange={(e) => mudar(c, e.target.value)}>
        <option value="">Escolha uma opção</option>
        {opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </Campo>
  )

  if (enviado) {
    return (
      <Pagina>
        <div className="cartao destaque confirmacao">
          <img className="estrela" src="/marca/estrela-oceano.png" width="521" height="521" alt="" />
          <h2 className="titulo-etapa">Ficha <span className="acento">enviada.</span></h2>
          <p role="status">{textosFormulario.enviado}</p>
          {whatsapp && <a className="botao primario" style={{ textAlign: 'center', textDecoration: 'none' }} href={`https://wa.me/55${whatsapp}`} target="_blank" rel="noreferrer">Falar com o Club no WhatsApp</a>}
        </div>
      </Pagina>
    )
  }

  return (
    <Pagina>
      <div ref={topo} className="pilha" style={{ gap: 14 }}>
        <IndicadorEtapas etapas={titulosEtapas} atual={etapa} />
        <div className="pilha" style={{ gap: 2 }}>
          <span className="eyebrow">Etapa {etapa} de 5</span>
          <h2 className="titulo-etapa">{titulosEtapas[etapa - 1]}</h2>
        </div>
      </div>

      <div className="cartao">
        {etapa === 1 && (
          <>
            {texto('cnpj', 'CNPJ', true, { placeholder: '00.000.000/0000-00' })}
            {texto('razao_social', 'Razão social', true)}
            {texto('marca', 'Nome da marca', true, { ajuda: 'Como a marca é conhecida pelo público.' })}
            <div className="grade-cidade">
              {texto('cidade', 'Cidade', true)}
              {lista('uf', 'Estado', ufs, true)}
            </div>
            {lista('segmento', 'Segmento de atuação', segmentos, true)}
            {texto('site', 'Site', false, { placeholder: 'https://' })}
            {texto('instagram', 'Instagram', false, { placeholder: '@suamarca', ajuda: 'Informe pelo menos um: site ou Instagram.' })}
            {lista('tempo_atuacao', 'Tempo de atuação (anos)', temposAtuacao, true)}
            {lista('faixa_faturamento', 'Faturamento anual aproximado', faixasFaturamento, true)}
            {lista('faixa_funcionarios', 'Número de funcionários', faixasFuncionarios, true)}
            {texto('unidades', 'Unidades ou lojas', false, { tipo: 'number' })}
          </>
        )}
        {etapa === 2 && (
          <>
            {texto('contato_nome', 'Nome completo', true)}
            {texto('contato_cargo', 'Cargo', true)}
            {texto('contato_whatsapp', 'WhatsApp', true, { tipo: 'tel', placeholder: '(31) 90000-0000' })}
            {texto('contato_email', 'E-mail', true, { tipo: 'email' })}
            {lista('quem_decide', 'Quem decide a parceria?', quemDecideOpcoes, true)}
            {decideOutraPessoaSim(ficha) && (
              <>
                {texto('decisor_nome', 'Nome completo de quem decide', true)}
                {texto('decisor_email', 'E-mail de quem decide', true, { tipo: 'email' })}
                {texto('decisor_whatsapp', 'Telefone / WhatsApp de quem decide', true, { tipo: 'tel', placeholder: '(31) 90000-0000' })}
              </>
            )}
          </>
        )}
        {etapa === 3 && (
          <>
            <fieldset className={`campo${erros.busca ? ' invalido' : ''}`} style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="legenda">O que a empresa busca <b>*</b></legend>
              <div className="grade-2" style={{ gap: 8 }}>
                {opcoesBusca.map((o) => (
                  <label key={o} className="marcar">
                    <input type="checkbox" checked={ficha.busca.includes(o)} onChange={(e) => mudar('busca', e.target.checked ? [...ficha.busca, o] : ficha.busca.filter((x) => x !== o))} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              {erros.busca && <small className="msg">{erros.busca}</small>}
            </fieldset>
            {texto('motivo_parceria', 'Por que busca a parceria com o Club', true, { longo: true, max: 800, ajuda: `${ficha.motivo_parceria.length}/800` })}
            {lista('objetivo', 'Objetivo principal', objetivos, true)}
            {texto('publico', 'Quem é o público da marca', true)}
            {texto('parcerias_anteriores', 'Já fez parcerias ou patrocínios parecidos? Quais?', false, { longo: true })}
            {lista('investimento_faixa', 'Investimento previsto', ['ainda não sei'])}
            {texto('inicio_desejado', 'Quando quer começar (mês e ano)', false, { placeholder: 'ex.: março de 2027' })}
            {lista('duracao', 'Duração pretendida', duracoes)}
            {texto('datas_interesse', 'Datas de interesse', false)}
            {texto('indicado_por', 'Foi indicada por alguém? Quem?', false)}
          </>
        )}
        {etapa === 4 && (
          <>
            <p className="muted">Envie só material que a empresa pode compartilhar. Até 20 MB por arquivo, em PDF, PPT, PPTX, PNG, JPG ou SVG.</p>
            <Upload rotulo="Portfólio de parcerias (incentivado)" tipo="portfolio" arquivos={arquivos} adicionar={adicionarArquivo} remover={(a) => setArquivos((l) => l.filter((x) => x !== a))} />
            <Upload rotulo="Apresentação da empresa" tipo="apresentacao" arquivos={arquivos} adicionar={adicionarArquivo} remover={(a) => setArquivos((l) => l.filter((x) => x !== a))} />
            <Upload rotulo="Logotipo (só será usado depois do acordo)" tipo="logotipo" arquivos={arquivos} adicionar={adicionarArquivo} remover={(a) => setArquivos((l) => l.filter((x) => x !== a))} />
            {erros.arquivos && <p className="erro" role="alert">{erros.arquivos}</p>}
          </>
        )}
        {etapa === 5 && (
          <>
            <label className="marcar">
              <input id="f-aceite" type="checkbox" checked={ficha.aceite_nao_proposta} onChange={(e) => mudar('aceite_nao_proposta', e.target.checked)} />
              <span>Entendo que o envio não é uma proposta.</span>
            </label>
            {erros.aceite_nao_proposta && <small className="msg erro">{erros.aceite_nao_proposta}</small>}
            <label className="marcar">
              <input id="f-consentimento" type="checkbox" checked={ficha.consentimento} onChange={(e) => mudar('consentimento', e.target.checked)} />
              <span>Autorizo o Club Beat a usar as informações enviadas para avaliar a parceria e entrar em contato comigo. Meus dados não serão compartilhados com terceiros. Li a <Link to="/seja-parceiro/privacidade" target="_blank">política de privacidade</Link>.</span>
            </label>
            {erros.consentimento && <small className="msg erro">{erros.consentimento}</small>}
            <label className="isca" aria-hidden="true">Não preencha<input tabIndex={-1} autoComplete="off" value={isca} onChange={(e) => setIsca(e.target.value)} /></label>
            {erroGeral && <p className="erro" role="alert">{erroGeral}</p>}
          </>
        )}
      </div>

      <div className="linha entre">
        {etapa > 1 ? <button className="botao" onClick={() => setEtapa(etapa - 1)}>Voltar</button> : <span />}
        {etapa < 5 ? (
          <button className="botao primario" onClick={avancar}>Continuar</button>
        ) : (
          <button className="botao primario" disabled={enviando} onClick={() => void enviar()}>{enviando ? 'Enviando…' : 'Enviar ficha'}</button>
        )}
      </div>
    </Pagina>
  )
}

function Pagina({ children }: { children: ReactNode }) {
  return (
    <div className="pagina-publica">
      <CabecalhoPublico subtitulo="Conte o que a sua marca quer construir com a Beat. O time de parcerias responde em até 1 dia útil." />
      <div className="publico">{children}</div>
    </div>
  )
}

function Campo({ rotulo, obrig, erro, ajuda, children }: { rotulo: string; obrig?: boolean; erro?: string; ajuda?: string; children: ReactNode }) {
  return (
    <label className={`campo${erro ? ' invalido' : ''}`}>
      <span>{rotulo}{obrig && <b> *</b>}</span>
      {children}
      {ajuda && !erro && <small className="ajuda">{ajuda}</small>}
      {erro && <small className="msg">{erro}</small>}
    </label>
  )
}

function Upload({ rotulo, tipo, arquivos, adicionar, remover }: {
  rotulo: string; tipo: TipoAnexo; arquivos: ArquivoFicha[]; adicionar: (f: File | undefined, t: TipoAnexo) => void; remover: (a: ArquivoFicha) => void
}) {
  const meus = arquivos.filter((a) => a.tipo === tipo)
  return (
    <div className="campo">
      <span>{rotulo}</span>
      <label className="botao" style={{ alignSelf: 'flex-start' }}>
        Escolher arquivo
        <input type="file" hidden accept={tiposAceitos} onChange={(e) => { adicionar(e.target.files?.[0], tipo); e.target.value = '' }} />
      </label>
      {meus.map((a) => (
        <div key={a.arquivo.name + a.arquivo.size} className="linha pequeno">
          <span>{a.arquivo.name}</span>
          <span className="muted">{(a.arquivo.size / 1024 / 1024).toFixed(1)} MB</span>
          <button className="botao leve" onClick={() => remover(a)}>Remover</button>
        </div>
      ))}
    </div>
  )
}
