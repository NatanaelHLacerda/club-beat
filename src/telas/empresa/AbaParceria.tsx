import { useState } from 'react'
import { nomeDe } from '../../componentes/Filtros'
import { PadraoTag } from '../../componentes/Rotulos'
import {
  decidirMaterial, informarMedidas, listarCardapio, listarEntregas, listarMateriais, listarRelatorios, obterParceriaDaEmpresa,
  listarReclamacoes, registrarBalanco, registrarEntrega, registrarMaterial, registrarReclamacao, registrarRelatorio,
} from '../../dados/api'
import {
  avisoLimiteMes, contratadoFeito, exigePrivacidade, notaMedia, proximoBalanco, proximoRelatorio, textosAcompanhamento,
} from '../../regras/acompanhamento'
import { formatarData, formatarDataHora, formatarDinheiro, hojeISO } from '../../regras/formato'
import { rotuloTipoParceria, type TipoParceria } from '../../regras/proposta'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'
import type { PropsAba } from './Ficha'

export function AbaParceria({ empresa, usuarios }: PropsAba) {
  const { perfil } = useSessao()
  const hoje = hojeISO()
  const parceria = useConsulta(() => obterParceriaDaEmpresa(empresa.id), [empresa.id])
  const p = parceria.dado
  const cardapio = useConsulta(listarCardapio)
  const entregas = useConsulta(() => (p ? listarEntregas(p.id) : Promise.resolve([])), [p?.id])
  const doMes = useConsulta(() => listarEntregas(undefined, hoje.slice(0, 7)), [hoje])
  const materiais = useConsulta(() => (p ? listarMateriais(p.id) : Promise.resolve([])), [p?.id])
  const relatorios = useConsulta(() => (p ? listarRelatorios(p.id) : Promise.resolve([])), [p?.id])
  const reclamacoes = useConsulta(() => (p ? listarReclamacoes(p.id) : Promise.resolve([])), [p?.id])
  const [reclamacao, setReclamacao] = useState('')
  const [notaParceiro, setNotaParceiro] = useState('')
  const [nova, setNova] = useState({ item: '', data: hoje, descricao: '', privacidade_ok: false, nota: '' })
  const [material, setMaterial] = useState('')
  const [relatorio, setRelatorio] = useState({ tipo: 'relatorio' as 'relatorio' | 'balanco', resumo: '' })
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const podeEntregar = pode(perfil, 'registrar_entregas')
  const podeRelatar = pode(perfil, 'manter_parcerias')

  if (parceria.carregando && !parceria.dado) return <p className="muted">Carregando…</p>
  if (!p) return <div className="vazio">Nenhuma parceria registrada para esta empresa.</div>

  const rotulo = (item: string) => cardapio.dado?.find((c) => c.padrao === p.padrao && c.item === item)?.rotulo ?? cardapio.dado?.find((c) => c.item === item)?.rotulo ?? item
  const resumo = contratadoFeito(p.contrapartidas, entregas.dado ?? [])
  const rel = proximoRelatorio(p.padrao, p.inicio, relatorios.dado ?? [], hoje)
  const bal = proximoBalanco(p.inicio, relatorios.dado ?? [], hoje)
  const limite = nova.item ? avisoLimiteMes(nova.item, nova.data, doMes.dado ?? []) : null
  const media = notaMedia((entregas.dado ?? []).map((e) => e.nota_membros))

  const agir = async (f: () => Promise<unknown>, ok: string, depois: () => Promise<void>) => {
    setErro(''); setAviso('')
    try { await f(); setAviso(ok); await depois() } catch (e) { setErro((e as Error).message) }
  }

  function salvarEntrega() {
    if (!nova.item) { setErro('Escolha o que foi entregue.'); return }
    if (exigePrivacidade(nova.item) && !nova.privacidade_ok) { setErro(textosAcompanhamento.privacidade); return }
    void agir(() => registrarEntrega({ parceria_id: p!.id, item: nova.item, data: nova.data, descricao: nova.descricao || null, privacidade_ok: nova.privacidade_ok, nota_membros: nova.nota ? Number(nova.nota.replace(',', '.')) : null }),
      'Entrega registrada.', async () => { setNova({ item: '', data: hoje, descricao: '', privacidade_ok: false, nota: '' }); await entregas.recarregar(); await doMes.recarregar() })
  }

  return (
    <div className="pilha">
      <section className="cartao">
        <div className="linha entre"><h3>Registro da parceria</h3><PadraoTag padrao={p.padrao} /></div>
        <dl className="grade-3" style={{ margin: 0 }}>
          <div><dt className="muted pequeno">Vigência</dt><dd>{formatarData(p.inicio)} a {formatarData(p.fim)}</dd></div>
          <div><dt className="muted pequeno">Tipo e valor</dt><dd>{p.tipo_parceria ? rotuloTipoParceria[p.tipo_parceria as TipoParceria] : '—'} · {p.troca ? 'troca de serviços' : `${formatarDinheiro(p.valor_mensal_centavos)} por mês`}</dd></div>
          <div><dt className="muted pequeno">Responsável</dt><dd>{nomeDe(usuarios, p.responsavel_id)}</dd></div>
          <div><dt className="muted pequeno">Exclusividade</dt><dd>{p.exclusividade_categoria ? `${p.exclusividade_categoria} até ${formatarData(p.exclusividade_fim)}` : 'Não há'}</dd></div>
          <div><dt className="muted pequeno">Medidas do material</dt><dd>{p.medidas_informadas_em ? `informadas em ${formatarData(p.medidas_informadas_em)}` : <>não informadas {podeEntregar && <button className="botao leve" onClick={() => void agir(() => informarMedidas(p.id), 'Registrado.', parceria.recarregar)}>Marcar informadas</button>}</>}</dd></div>
          <div><dt className="muted pequeno">Opinião dos membros</dt><dd>{media !== null ? `${media.toLocaleString('pt-BR')} de 5` : '—'}</dd></div>
        </dl>
        {p.promessa_revisao && <p className="pequeno"><span className="muted">Prometido rever ao fim: </span>{p.promessa_revisao}</p>}
      </section>

      <section className="cartao">
        <h3>Contratado × entregue</h3>
        <div className="numeros">
          {resumo.map((r) => (
            <div key={r.item} className="numero"><small>{rotulo(r.item)}</small><b>{r.feito}{r.contratado !== null ? `/${r.contratado}` : ''}</b></div>
          ))}
        </div>
        {podeEntregar && (
          <div className="pilha">
            <div className="grade-3">
              <label className="campo"><span>O que foi entregue</span>
                <select id="e-item" value={nova.item} onChange={(e) => setNova({ ...nova, item: e.target.value })}>
                  <option value="">Escolha</option>
                  {p.contrapartidas.map((c) => <option key={c.item} value={c.item}>{rotulo(c.item)}</option>)}
                </select>
              </label>
              <label className="campo"><span>Data</span><input id="e-data" type="date" value={nova.data} onChange={(e) => setNova({ ...nova, data: e.target.value })} /></label>
              <label className="campo"><span>Nota dos membros (1 a 5)</span><input id="e-nota" inputMode="decimal" value={nova.nota} onChange={(e) => setNova({ ...nova, nota: e.target.value })} placeholder="pesquisa curta após a ação" /></label>
            </div>
            <label className="campo"><span>Descrição, fotos e registros combinados</span><input id="e-descricao" value={nova.descricao} onChange={(e) => setNova({ ...nova, descricao: e.target.value })} /></label>
            {exigePrivacidade(nova.item) && <label className="marcar"><input type="checkbox" checked={nova.privacidade_ok} onChange={(e) => setNova({ ...nova, privacidade_ok: e.target.checked })} /><span>Equipe do parceiro orientada: não grava membros, não coleta contatos; regra visível no local</span></label>}
            {limite && <p className="aviso alerta">{limite}</p>}
            <div><button className="botao primario" onClick={salvarEntrega}>Registrar entrega</button></div>
          </div>
        )}
        {(entregas.dado ?? []).length > 0 && (
          <div className="tabela-rolagem">
            <table>
              <thead><tr><th>Data</th><th>Entrega</th><th>Descrição</th><th>Nota</th><th>Privacidade</th></tr></thead>
              <tbody>{(entregas.dado ?? []).map((e) => (
                <tr key={e.id}><td className="num">{formatarData(e.data)}</td><td>{rotulo(e.item)}</td><td>{e.descricao ?? '—'}</td><td className="num">{e.nota_membros ?? '—'}</td><td>{exigePrivacidade(e.item) ? (e.privacidade_ok ? 'orientada' : '—') : ''}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      <section className="cartao">
        <h3>Material da marca</h3>
        <p className="muted pequeno">Todo material passa pela aprovação do Club antes de ir ao ar. O Club pode recusar o que não combina com a marca.</p>
        {(materiais.dado ?? []).map((m) => (
          <div key={m.id} className="linha entre">
            <span>{m.descricao} · <span className={`pill ${m.situacao === 'aprovado' ? 'ok' : m.situacao === 'recusado' ? 'perigo' : 'alerta'}`}>{m.situacao === 'aguardando' ? 'Aguardando' : m.situacao === 'aprovado' ? 'Aprovado' : `Recusado: ${m.motivo}`}</span></span>
            {m.situacao === 'aguardando' && podeEntregar && (
              <span className="linha">
                <button className="botao leve" onClick={() => void agir(() => decidirMaterial(m.id, true), 'Material aprovado.', materiais.recarregar)}>Aprovar</button>
                <button className="botao leve perigo" onClick={() => { const motivo = window.prompt('Motivo da recusa') ?? ''; void agir(() => decidirMaterial(m.id, false, motivo), 'Material recusado.', materiais.recarregar) }}>Recusar</button>
              </span>
            )}
          </div>
        ))}
        {podeEntregar && (
          <div className="linha">
            <input className="entrada" style={{ maxWidth: 360 }} aria-label="Novo material" placeholder="Ex.: vídeo de 30 s para as telas" value={material} onChange={(e) => setMaterial(e.target.value)} />
            <button className="botao" disabled={!material.trim()} onClick={() => void agir(() => registrarMaterial(p.id, material.trim()), 'Material recebido.', async () => { setMaterial(''); await materiais.recarregar() })}>Registrar material recebido</button>
          </div>
        )}
      </section>

      <section className="cartao">
        <h3>Relatórios e balanços</h3>
        <div className="numeros">
          <div className="numero"><small>Próximo relatório ({p.padrao === 'ouro' || p.padrao === 'master' ? 'mensal' : 'trimestral'})</small><b className="pequeno">{rel ? `até ${formatarData(rel.prazo)}` : 'em dia'}</b>{rel?.atrasado && <span className="pill perigo">{textosAcompanhamento.atrasado}</span>}</div>
          <div className="numero"><small>Próximo balanço (3 meses)</small><b className="pequeno">{bal ? `até ${formatarData(bal.prazo)}` : 'em dia'}</b>{bal?.atrasado && <span className="pill perigo">balanço atrasado</span>}</div>
        </div>
        {podeRelatar && (rel || bal) && (
          <div className="pilha">
            <div className="linha">
              <select className="entrada" style={{ width: 'auto' }} aria-label="Tipo" value={relatorio.tipo} onChange={(e) => setRelatorio({ ...relatorio, tipo: e.target.value as 'relatorio' | 'balanco' })}>
                {rel && <option value="relatorio">Relatório de {formatarData(rel.referencia)}</option>}
                {bal && <option value="balanco">Balanço de {formatarData(bal.referencia)}</option>}
              </select>
            </div>
            <label className="campo"><span>Resumo enviado à empresa (fotos, ações, conteúdos e resultados combinados)</span><textarea value={relatorio.resumo} onChange={(e) => setRelatorio({ ...relatorio, resumo: e.target.value })} /></label>
            {relatorio.tipo === 'balanco' && <label className="campo" style={{ maxWidth: 260 }}><span>Satisfação do parceiro (1 a 5)</span><input inputMode="decimal" value={notaParceiro} onChange={(e) => setNotaParceiro(e.target.value)} /></label>}
            <div><button className="botao primario" disabled={!relatorio.resumo.trim()} onClick={() => {
              const ref = relatorio.tipo === 'relatorio' ? rel?.referencia : bal?.referencia
              if (!ref) return
              const nota = notaParceiro.trim() ? Number(notaParceiro.replace(',', '.')) : null
              void agir(() => (relatorio.tipo === 'balanco' ? registrarBalanco(p.id, ref, relatorio.resumo.trim(), nota) : registrarRelatorio(p.id, relatorio.tipo, ref, relatorio.resumo.trim())),
                'Registrado.', async () => { setRelatorio({ tipo: 'relatorio', resumo: '' }); setNotaParceiro(''); await relatorios.recarregar() })
            }}>Registrar envio</button></div>
          </div>
        )}
        {(relatorios.dado ?? []).map((r) => (
          <p key={r.id} className="pequeno"><span className="pill">{r.tipo === 'relatorio' ? 'Relatório' : 'Balanço'}</span> {formatarData(r.referencia)} · enviado em {formatarDataHora(r.enviado_em)} · {r.resumo}</p>
        ))}
      </section>

      <section className="cartao">
        <h3>Reclamações de membros</h3>
        <p className="muted pequeno">Registro simples, sem identificar o membro.</p>
        {(reclamacoes.dado ?? []).map((r) => <p key={r.id} className="pequeno"><span className="muted">{formatarData(r.data)}</span> · {r.texto}</p>)}
        {podeEntregar && (
          <div className="linha">
            <input className="entrada" style={{ maxWidth: 420 }} aria-label="Nova reclamação" placeholder="O que foi reclamado" value={reclamacao} onChange={(e) => setReclamacao(e.target.value)} />
            <button className="botao" disabled={!reclamacao.trim()} onClick={() => void agir(() => registrarReclamacao(p.id, reclamacao.trim()), 'Reclamação registrada.', async () => { setReclamacao(''); await reclamacoes.recarregar() })}>Registrar</button>
          </div>
        )}
      </section>

      {erro && <div className="aviso perigo" role="alert">{erro}</div>}
      {aviso && <div className="aviso" role="status">{aviso}</div>}
    </div>
  )
}
