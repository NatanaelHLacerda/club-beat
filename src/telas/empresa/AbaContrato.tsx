import { useEffect, useState } from 'react'
import { conferirContrato, enviarAnexo, enviarAoJuridico, listarAnexos, obterPacote, registrarAssinatura } from '../../dados/api'
import { rotuloAnexo, type TipoAnexo } from '../../dados/tipos'
import {
  itensConferencia, mascararCpf, pendenciasConferencia, pendenciasPacote, validarAssinatura,
  type Conferencia, type Pacote, type TipoMinuta,
} from '../../regras/contrato'
import { formatarData, formatarDataHora, hojeISO } from '../../regras/formato'
import { rotuloTipoParceria } from '../../regras/proposta'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'
import type { PropsAba } from './Ficha'

export function AbaContrato({ empresa, atualizar }: PropsAba) {
  const { perfil } = useSessao()
  const c = empresa.contrato ?? {}
  const anexos = useConsulta(() => listarAnexos(empresa.id), [empresa.id])
  const [pacote, setPacote] = useState<Pacote>({ endereco: '', signatario_nome: '', signatario_cpf: '', email_assinatura: empresa.contato_email ?? '' })
  const [errosPacote, setErrosPacote] = useState<Partial<Record<keyof Pacote, string>>>({})
  const [minuta, setMinuta] = useState<TipoMinuta | ''>(c.minuta_tipo ?? (empresa.tipo_parceria ?? ''))
  const [conferencia, setConferencia] = useState<Conferencia>(c.conferencia ?? {})
  const [divergencia, setDivergencia] = useState(c.divergencia ?? '')
  const [inicio, setInicio] = useState(empresa.proposta?.inicio ?? '')
  const [fim, setFim] = useState('')
  const [testemunhas, setTestemunhas] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const ehGerente = pode(perfil, 'conduzir')
  const ehJuridico = pode(perfil, 'juridico')
  const emContrato = empresa.etapa === 'contrato'
  const podeVerPacote = ehGerente || ehJuridico || pode(perfil, 'decidir_direcao')

  useEffect(() => {
    if (!podeVerPacote) return
    let vivo = true
    obterPacote(empresa.id).then((p) => { if (vivo && p) setPacote(p) }, () => {})
    return () => { vivo = false }
  }, [empresa.id, podeVerPacote])

  const tem = (t: TipoAnexo) => (anexos.dado ?? []).filter((a) => a.tipo === t)
  const agir = async (f: () => Promise<unknown>, ok: string) => {
    setErro(''); setAviso('')
    try { await f(); setAviso(ok); await anexos.recarregar(); await atualizar() } catch (e) { setErro((e as Error).message) }
  }
  const anexar = (t: TipoAnexo) => (
    <label className="botao">Anexar {rotuloAnexo[t].toLowerCase()}<input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void agir(() => enviarAnexo(empresa.id, t, f), `${rotuloAnexo[t]} anexada.`) }} /></label>
  )

  function enviarPacote() {
    const e = pendenciasPacote(pacote)
    setErrosPacote(e)
    if (Object.values(e).some(Boolean)) return
    void agir(() => enviarAoJuridico(empresa.id, pacote), 'Pacote enviado ao Jurídico. Minuta em até 5 dias úteis.')
  }

  function conferir(pronto: boolean) {
    if (!minuta) { setErro('Escolha o tipo de minuta.'); return }
    void agir(() => conferirContrato(empresa.id, minuta, conferencia, divergencia, pronto), pronto ? 'Contrato pronto para assinar. A Gerente foi avisada.' : 'Conferência salva.')
  }

  function assinar() {
    const v = validarAssinatura(inicio, fim, testemunhas)
    if (v) { setErro(v); return }
    void agir(() => registrarAssinatura(empresa.id, inicio, fim, testemunhas), 'Contrato assinado. A parceria está ativa.')
  }

  if (!c.enviado_juridico_em && !emContrato && !c.assinado_em) return <div className="vazio">O contrato começa depois do aceite da proposta.</div>
  const faltamConferencia = pendenciasConferencia(conferencia)

  return (
    <div className="pilha">
      <div className="numeros">
        <div className="numero"><small>Pacote ao Jurídico</small><b className="pequeno">{c.enviado_juridico_em ? formatarDataHora(c.enviado_juridico_em) : '—'}</b>{c.prazo_juridico && !c.pronto_em && <small className={hojeISO() > c.prazo_juridico ? 'erro' : 'muted'}>minuta até {formatarData(c.prazo_juridico)}</small>}</div>
        <div className="numero"><small>Pronto para assinar</small><b className="pequeno">{c.pronto_em ? formatarDataHora(c.pronto_em) : '—'}</b>{c.prazo_assinatura && !c.assinado_em && <small className="muted">assinatura até {formatarData(c.prazo_assinatura)}</small>}</div>
        <div className="numero"><small>Assinado</small><b className="pequeno">{c.assinado_em ? formatarDataHora(c.assinado_em) : '—'}</b></div>
      </div>
      {c.divergencia && <div className="aviso perigo">Divergência apontada pelo Jurídico: {c.divergencia}</div>}

      <section className="cartao">
        <h3>Pacote para o Jurídico</h3>
        <p className="muted pequeno">Proposta aceita, ficha e: razão social ({empresa.razao_social ?? '—'}), CNPJ, endereço, quem assina e e-mail da assinatura digital. {empresa.tipo_parceria ? `Tipo: ${rotuloTipoParceria[empresa.tipo_parceria]}.` : ''}</p>
        {podeVerPacote ? (
          <div className="grade-2">
            <label className={`campo${errosPacote.endereco ? ' invalido' : ''}`}><span>Endereço da empresa</span><input id="c-endereco" disabled={!ehGerente || !emContrato} value={pacote.endereco} onChange={(e) => setPacote({ ...pacote, endereco: e.target.value })} />{errosPacote.endereco && <small className="msg">{errosPacote.endereco}</small>}</label>
            <label className={`campo${errosPacote.signatario_nome ? ' invalido' : ''}`}><span>Nome de quem assina</span><input id="c-nome" disabled={!ehGerente || !emContrato} value={pacote.signatario_nome} onChange={(e) => setPacote({ ...pacote, signatario_nome: e.target.value })} />{errosPacote.signatario_nome && <small className="msg">{errosPacote.signatario_nome}</small>}</label>
            <label className={`campo${errosPacote.signatario_cpf ? ' invalido' : ''}`}><span>CPF de quem assina</span>
              {ehGerente && emContrato ? <input id="c-cpf" autoComplete="off" value={pacote.signatario_cpf} onChange={(e) => setPacote({ ...pacote, signatario_cpf: e.target.value })} /> : <input disabled value={ehJuridico ? pacote.signatario_cpf : mascararCpf(pacote.signatario_cpf)} />}
              {errosPacote.signatario_cpf && <small className="msg">{errosPacote.signatario_cpf}</small>}
            </label>
            <label className={`campo${errosPacote.email_assinatura ? ' invalido' : ''}`}><span>E-mail para a assinatura digital</span><input id="c-email" type="email" disabled={!ehGerente || !emContrato} value={pacote.email_assinatura} onChange={(e) => setPacote({ ...pacote, email_assinatura: e.target.value })} />{errosPacote.email_assinatura && <small className="msg">{errosPacote.email_assinatura}</small>}</label>
          </div>
        ) : <p className="muted">Os dados de quem assina só aparecem para Jurídico, Gerentes e Direção.</p>}
        {ehGerente && emContrato && !c.pronto_em && <div><button className="botao primario" onClick={enviarPacote}>{c.enviado_juridico_em ? 'Reenviar pacote' : 'Enviar ao Jurídico'}</button></div>}
      </section>

      <section className="cartao">
        <div className="linha entre"><h3>Minuta e conferência (Jurídico)</h3>{ehJuridico && emContrato && anexar('minuta')}</div>
        <p className="pequeno">Minutas anexadas: {tem('minuta').map((a) => a.nome).join(', ') || '—'}</p>
        <label className="campo" style={{ maxWidth: 320 }}><span>Tipo de minuta</span>
          <select id="c-minuta" disabled={!ehJuridico || !emContrato} value={minuta} onChange={(e) => setMinuta(e.target.value as TipoMinuta)}>
            <option value="">Escolha</option>
            <option value="patrocinio">Patrocínio</option><option value="industria">Parceria com indústria</option>
            <option value="servico">Parceria de serviço</option><option value="troca">Troca de serviços</option>
          </select>
        </label>
        <div className="grade-2" style={{ gap: 6 }}>
          {itensConferencia.map((i) => (
            <label key={i.id} className="marcar"><input type="checkbox" disabled={!ehJuridico || !emContrato} checked={Boolean(conferencia[i.id])} onChange={(e) => setConferencia({ ...conferencia, [i.id]: e.target.checked })} /><span>{i.rotulo}</span></label>
          ))}
        </div>
        {ehJuridico && emContrato && (
          <>
            <label className="campo"><span>Diferença entre a minuta e a proposta aceita (volta à Gerente)</span><textarea id="c-divergencia" value={divergencia} onChange={(e) => setDivergencia(e.target.value)} /></label>
            {faltamConferencia.length > 0 && <p className="muted pequeno">Faltam {faltamConferencia.length} itens.</p>}
            <div className="linha">
              <button className="botao" onClick={() => conferir(false)}>Salvar conferência</button>
              <button className="botao primario" onClick={() => conferir(true)}>Pronto para assinar</button>
            </div>
          </>
        )}
      </section>

      <section className="cartao">
        <div className="linha entre"><h3>Assinatura</h3>{ehGerente && emContrato && anexar('contrato')}</div>
        <p className="pequeno">Contrato assinado anexado: {tem('contrato').map((a) => a.nome).join(', ') || '—'}. Só vale com todas as páginas e assinaturas.</p>
        {ehGerente && emContrato && (
          <>
            <div className="grade-2">
              <label className="campo"><span>Início do contrato</span><input id="c-inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></label>
              <label className="campo"><span>Fim do contrato</span><input id="c-fim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} /></label>
            </div>
            <label className="marcar"><input type="checkbox" checked={testemunhas} onChange={(e) => setTestemunhas(e.target.checked)} /><span>Assinado pelas duas partes e por duas testemunhas</span></label>
            <div><button className="botao primario" disabled={!c.pronto_em} onClick={assinar}>Registrar assinatura</button>{!c.pronto_em && <span className="muted pequeno" style={{ marginLeft: 8 }}>O contrato ainda não está pronto para assinar.</span>}</div>
          </>
        )}
      </section>

      {erro && <div className="aviso perigo" role="alert">{erro}</div>}
      {aviso && <div className="aviso" role="status">{aviso}</div>}
    </div>
  )
}
