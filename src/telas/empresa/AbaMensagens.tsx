import { useEffect, useState } from 'react'
import { nomeDe } from '../../componentes/Filtros'
import { listarMensagens, listarModelos, registrarMensagem } from '../../dados/api'
import { rotuloPadrao, rotuloSituacaoMensagem } from '../../dados/tipos'
import { formatarDataHora } from '../../regras/formato'
import { bloqueioDeEnvio, camposAbertos, mensagensModelo, preencherModelo } from '../../regras/mensagens'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'
import type { PropsAba } from './Ficha'

export function AbaMensagens({ empresa, usuarios, modeloInicial }: PropsAba) {
  const { perfil } = useSessao()
  const modelos = useConsulta(listarModelos)
  const mensagens = useConsulta(() => listarMensagens(empresa.id), [empresa.id])
  const [codigo, setCodigo] = useState('')
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const podeEnviar = pode(perfil, 'triar') || pode(perfil, 'decidir_direcao')

  function escolher(c: string) {
    setCodigo(c); setErro(''); setAviso('')
    const m = modelos.dado?.find((x) => x.codigo === c)
    if (!m) { setTexto(''); return }
    setTexto(preencherModelo(m.texto, {
      nome: empresa.contato_nome,
      empresa: empresa.marca,
      gerente: nomeDe(usuarios, empresa.responsavel_id ?? empresa.gerente1_id).replace('—', '') || null,
      padrao: empresa.padrao_final ? rotuloPadrao[empresa.padrao_final] : null,
    }))
  }

  async function enviar(canal: 'email' | 'whatsapp') {
    setErro(''); setAviso('')
    const bloqueio = bloqueioDeEnvio(empresa.etapa, texto)
    if (bloqueio) { setErro(bloqueio); return }
    try {
      if (canal === 'whatsapp') {
        try { await navigator.clipboard.writeText(texto) } catch { /* o texto segue visível para copiar à mão */ }
      }
      await registrarMensagem(empresa.id, codigo || null, canal, texto)
      setAviso(canal === 'email' ? mensagensModelo.caixaDeSaida : mensagensModelo.copiada)
      await mensagens.recarregar()
    } catch (err) { setErro((err as Error).message) }
  }

  const prontos = Boolean(modelos.dado)
  useEffect(() => {
    if (prontos && modeloInicial) escolher(modeloInicial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prontos, modeloInicial])

  const abertos = camposAbertos(texto)
  const lista = mensagens.dado ?? []
  const manuais = (modelos.dado ?? []).filter((m) => !m.interno)
  return (
    <div className="pilha">
      {podeEnviar && (
        <div className="cartao">
          <h3>Nova mensagem</h3>
          <label className="campo"><span>Modelo</span>
            <select id="mensagem-modelo" value={codigo} onChange={(e) => escolher(e.target.value)}>
              <option value="">Escolha um modelo</option>
              {manuais.map((m) => <option key={m.codigo} value={m.codigo}>{m.codigo === 'PEDIDO_INFO' ? 'Pedido de informação' : m.codigo} · {m.titulo}</option>)}
            </select>
          </label>
          {codigo && (
            <>
              <label className="campo"><span>Texto</span>
                <textarea id="mensagem-texto" style={{ minHeight: 140 }} value={texto} onChange={(e) => setTexto(e.target.value)} />
                {abertos.length > 0 && <small className="ajuda">Falta completar: {[...new Set(abertos)].join(', ')}</small>}
              </label>
              <p className="muted pequeno">Para: {empresa.contato_email ?? '—'} · WhatsApp {empresa.contato_whatsapp ?? '—'}</p>
              {erro && <p className="erro" role="alert">{erro}</p>}
              {aviso && <p className="aviso" role="status">{aviso}</p>}
              <div className="linha">
                <button className="botao primario" onClick={() => void enviar('email')}>Enviar por e-mail</button>
                <button className="botao" onClick={() => void enviar('whatsapp')}>Copiar para WhatsApp</button>
              </div>
            </>
          )}
        </div>
      )}
      {mensagens.carregando && !mensagens.dado ? <p className="muted">Carregando…</p> : lista.length === 0 ? (
        <div className="vazio">Nenhuma mensagem enviada ainda.</div>
      ) : (
        <ol className="tempo">
          {lista.map((m) => (
            <li key={m.id}>
              <time dateTime={m.em}>{formatarDataHora(m.em)}</time>
              <div className="pilha" style={{ gap: 4 }}>
                <div className="linha">
                  <span className="pill">{m.modelo === 'PEDIDO_INFO' ? 'Pedido de informação' : m.modelo ?? 'Livre'}</span>
                  <span className="pill">{m.canal === 'email' ? 'E-mail' : m.canal === 'whatsapp' ? 'WhatsApp' : 'Interno'}</span>
                  <span className={`pill ${m.situacao === 'aguardando_envio' ? 'alerta' : ''}`}>{rotuloSituacaoMensagem[m.situacao]}</span>
                  <span className="muted pequeno">{m.autor_id ? nomeDe(usuarios, m.autor_id) : 'Automática'}</span>
                </div>
                <p style={{ whiteSpace: 'pre-wrap' }}>{m.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
