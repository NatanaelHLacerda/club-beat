import { useState } from 'react'
import {
  enviarAnexo, enviarProposta, listarAnexos, listarCardapio, listarCategorias, moverEtapa, registrarAceite, salvarProposta, salvarReuniao,
} from '../../dados/api'
import { formatarData, formatarDataHora, formatarDinheiro, hojeISO } from '../../regras/formato'
import {
  itensDoPadrao, motivosDirecao, respostaVencida, retomarEmSeisMeses, rotuloFormato, rotuloTipoParceria, textosProposta, validarItens,
  type Formato, type ItemProposta, type Proposta, type Reuniao, type TipoParceria,
} from '../../regras/proposta'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'
import type { PropsAba } from './Ficha'

export function AbaProposta({ empresa, atualizar, abrirAba }: PropsAba) {
  const { perfil } = useSessao()
  const cardapio = useConsulta(listarCardapio)
  const categorias = useConsulta(listarCategorias)
  const anexos = useConsulta(() => listarAnexos(empresa.id), [empresa.id])
  const [reuniao, setReuniao] = useState<Reuniao>(empresa.reuniao ?? {})
  const [proposta, setProposta] = useState<Proposta>(empresa.proposta ?? {})
  const [formato, setFormato] = useState<string>(empresa.formato ?? '')
  const [tipo, setTipo] = useState<string>(empresa.tipo_parceria ?? '')
  const [valorTexto, setValorTexto] = useState(empresa.proposta?.valor_mensal_centavos ? String(empresa.proposta.valor_mensal_centavos / 100) : '')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const hoje = hojeISO()
  const conduz = pode(perfil, 'conduzir')
  const podeReuniao = conduz && ['triagem2', 'reuniao', 'proposta'].includes(empresa.etapa)
  const enviada = Boolean(empresa.proposta?.enviada_em)
  const podeProposta = conduz && ['reuniao', 'proposta', 'direcao'].includes(empresa.etapa) && !enviada

  const meusItens = itensDoPadrao(cardapio.dado ?? [], empresa.padrao_final)
  const itens = proposta.itens ?? []
  const qtd = (item: string) => itens.find((i) => i.item === item)?.quantidade ?? 0
  const sensivel = categorias.dado?.find((c) => c.nome === empresa.categoria)?.situacao === 'sensivel'
  const motivos = motivosDirecao({ padrao: empresa.padrao_final, candidataMaster: empresa.candidata_master, tipo: (tipo || null) as TipoParceria | null, categoriaSensivel: sensivel, proposta })
  const temAceite = (anexos.dado ?? []).some((a) => a.tipo === 'aceite')
  const vencida = respostaVencida(empresa.proposta?.prazo_resposta, empresa.proposta?.aceite_em, hoje)

  const agir = async (f: () => Promise<unknown>, ok: string) => {
    setErro(''); setAviso('')
    try { await f(); setAviso(ok); await atualizar() } catch (e) { setErro((e as Error).message) }
  }

  function mudarItem(item: string, quantidade: number) {
    const resto = itens.filter((i) => i.item !== item)
    setProposta({ ...proposta, itens: quantidade > 0 ? [...resto, { item, quantidade }] : resto })
  }

  async function salvarPropostaAgora() {
    const v = validarItens(cardapio.dado ?? [], empresa.padrao_final, itens as ItemProposta[])
    if (v) { setErro(v); return }
    const valor = valorTexto.trim() ? Math.round(Number(valorTexto.replace(/\./g, '').replace(',', '.')) * 100) : null
    await agir(async () => {
      if (empresa.etapa === 'reuniao') await moverEtapa(empresa.id, 'proposta')
      await salvarProposta(empresa.id, { ...proposta, valor_mensal_centavos: Number.isFinite(valor) ? valor : null }, formato, tipo)
    }, 'Proposta salva. Operações confirma a viabilidade antes do envio.')
  }

  return (
    <div className="pilha">
      <p className="aviso">{textosProposta.naoPromete}</p>

      <section className="cartao">
        <div className="linha entre"><h3>Reunião de alinhamento</h3>{conduz && <button className="botao leve" onClick={() => abrirAba('mensagens', 'A3')}>Convidar com A3</button>}</div>
        <div className="grade-3">
          <label className="campo"><span>Quando</span><input id="r-quando" type="datetime-local" disabled={!podeReuniao} value={reuniao.quando ?? ''} onChange={(e) => setReuniao({ ...reuniao, quando: e.target.value })} /></label>
          <label className="campo"><span>Local</span><input id="r-local" disabled={!podeReuniao} value={reuniao.local ?? ''} onChange={(e) => setReuniao({ ...reuniao, local: e.target.value })} placeholder="Club (presencial)" /></label>
          <label className="marcar" style={{ alignSelf: 'end' }}><input type="checkbox" disabled={!podeReuniao} checked={Boolean(reuniao.presencial)} onChange={(e) => setReuniao({ ...reuniao, presencial: e.target.checked })} /><span>Presencial</span></label>
        </div>
        <div className="grade-2">
          {([['objetivo', 'O que a empresa espera conquistar'], ['sucesso', 'Como vão medir o sucesso'], ['quem_decide', 'Quem decide do lado dela'], ['datas_interesse', 'Datas de interesse'], ['pedidos_extra', 'Pedidos além do padrão'], ['notas', 'Outras anotações']] as const).map(([c, r]) => (
            <label key={c} className="campo"><span>{r}</span><textarea id={`r-${c}`} disabled={!podeReuniao} value={reuniao[c] ?? ''} onChange={(e) => setReuniao({ ...reuniao, [c]: e.target.value })} /></label>
          ))}
        </div>
        {podeReuniao && (
          <div className="linha">
            <button className="botao" onClick={() => void agir(() => salvarReuniao(empresa.id, reuniao), 'Reunião salva.')}>Salvar</button>
            {empresa.etapa === 'triagem2' && <button className="botao primario" onClick={() => void agir(async () => { await salvarReuniao(empresa.id, reuniao); await moverEtapa(empresa.id, 'reuniao') }, 'Reunião marcada.')}>Marcar reunião</button>}
            {empresa.etapa === 'reuniao' && !reuniao.realizada && <button className="botao primario" onClick={() => void agir(() => salvarReuniao(empresa.id, { ...reuniao, realizada: true }), 'Reunião registrada como realizada.')}>Reunião realizada</button>}
            {reuniao.realizada && <span className="pill ok">Realizada</span>}
          </div>
        )}
      </section>

      <section className="cartao">
        <h3>Proposta</h3>
        <div className="grade-2">
          <label className="campo"><span>Formato</span>
            <select id="p-formato" disabled={!podeProposta} value={formato} onChange={(e) => setFormato(e.target.value)}>
              <option value="">Escolha</option>
              {(Object.keys(rotuloFormato) as Formato[]).map((f) => <option key={f} value={f}>{rotuloFormato[f]}</option>)}
            </select>
          </label>
          <label className="campo"><span>Tipo de parceria</span>
            <select id="p-tipo" disabled={!podeProposta} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Escolha</option>
              {(Object.keys(rotuloTipoParceria) as TipoParceria[]).map((t) => <option key={t} value={t}>{rotuloTipoParceria[t]}</option>)}
            </select>
          </label>
        </div>
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Contrapartida do cardápio</th><th>O que é</th><th>Máximo</th><th>Na proposta</th></tr></thead>
            <tbody>
              {meusItens.map((c) => (
                <tr key={c.item}>
                  <td>{c.rotulo}</td>
                  <td className="muted pequeno">{c.descricao}</td>
                  <td className="num">{c.maximo ?? 'a combinar'}</td>
                  <td>
                    {c.maximo === 1 || c.maximo === null ? (
                      <input type="checkbox" aria-label={c.rotulo} disabled={!podeProposta} checked={qtd(c.item) > 0} onChange={(e) => mudarItem(c.item, e.target.checked ? 1 : 0)} />
                    ) : (
                      <input className="entrada num" style={{ width: 80 }} type="number" min={0} max={c.maximo} aria-label={c.rotulo} disabled={!podeProposta} value={qtd(c.item)} onChange={(e) => mudarItem(c.item, Number(e.target.value))} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grade-3">
          <label className="campo"><span>Valor mensal (R$)</span><input id="p-valor" disabled={!podeProposta} inputMode="decimal" value={valorTexto} onChange={(e) => setValorTexto(e.target.value)} placeholder="R$ … (a Direção define)" /></label>
          <label className="campo"><span>Prazo (meses)</span><input id="p-prazo" type="number" min={1} disabled={!podeProposta} value={proposta.prazo_meses ?? ''} onChange={(e) => setProposta({ ...proposta, prazo_meses: e.target.value ? Number(e.target.value) : null })} /></label>
          <label className="campo"><span>Início</span><input id="p-inicio" type="date" disabled={!podeProposta} value={proposta.inicio ?? ''} onChange={(e) => setProposta({ ...proposta, inicio: e.target.value })} /></label>
        </div>
        <label className="marcar"><input type="checkbox" disabled={!podeProposta} checked={Boolean(proposta.troca)} onChange={(e) => setProposta({ ...proposta, troca: e.target.checked })} /><span>Troca de serviços (sem dinheiro)</span></label>
        <div className="grade-2">
          <label className="campo"><span>Fora do cardápio (vai para a Direção)</span><textarea id="p-fora" disabled={!podeProposta} value={proposta.fora_do_cardapio ?? ''} onChange={(e) => setProposta({ ...proposta, fora_do_cardapio: e.target.value })} /></label>
          <label className="campo"><span>O que prometemos rever ao fim do contrato</span><textarea id="p-promessa" disabled={!podeProposta} value={proposta.promessa_revisao ?? ''} onChange={(e) => setProposta({ ...proposta, promessa_revisao: e.target.value })} /></label>
          <label className="campo"><span>Exclusividade pedida (categoria)</span>
            <select id="p-exclusividade" disabled={!podeProposta} value={proposta.exclusividade_categoria ?? ''} onChange={(e) => setProposta({ ...proposta, exclusividade_categoria: e.target.value })}>
              <option value="">Sem exclusividade</option>
              {(categorias.dado ?? []).filter((c) => c.situacao !== 'nao_aceita').map((c) => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
            </select>
          </label>
          <div className="pilha">
            <label className="marcar"><input type="checkbox" disabled={!podeProposta} checked={Boolean(proposta.nao_pode_perder)} onChange={(e) => setProposta({ ...proposta, nao_pode_perder: e.target.checked })} /><span>Parceiro que não pode perder</span></label>
            {proposta.nao_pode_perder && <textarea className="entrada" aria-label="Justificativa" disabled={!podeProposta} placeholder="Por que a empresa é especial e o que pede a mais" value={proposta.justificativa ?? ''} onChange={(e) => setProposta({ ...proposta, justificativa: e.target.value })} />}
          </div>
        </div>
        {motivos.length > 0 && (
          <div className="aviso alerta">Precisa da Direção: {motivos.join(', ')}.{empresa.proposta?.direcao_aprovada_em ? ` Aprovada em ${formatarDataHora(empresa.proposta.direcao_aprovada_em)}.` : ''}</div>
        )}
        {podeProposta && <div className="linha"><button className="botao primario" onClick={() => void salvarPropostaAgora()}>Salvar proposta</button></div>}
      </section>

      <section className="cartao">
        <h3>Operações</h3>
        {empresa.operacoes?.confirmada_em ? (
          <p className="ok">Viabilidade confirmada em {formatarDataHora(empresa.operacoes.confirmada_em)}{empresa.operacoes.custo_centavos ? ` · custo interno ${formatarDinheiro(empresa.operacoes.custo_centavos)}` : ''}.{empresa.operacoes.observacao ? ` ${empresa.operacoes.observacao}` : ''}</p>
        ) : <p className="muted">{empresa.etapa === 'proposta' ? 'Aguardando a confirmação de Operações.' : 'Operações confirma quando a proposta estiver montada.'}</p>}
      </section>

      <section className="cartao">
        <h3>Envio e resposta</h3>
        {enviada ? (
          <p className={vencida ? 'erro' : ''}>Enviada em {formatarDataHora(empresa.proposta.enviada_em)} · resposta até {formatarData(empresa.proposta.prazo_resposta)}{vencida ? ' · prazo vencido' : ''}{empresa.proposta.aceite_em ? ` · aceite em ${formatarDataHora(empresa.proposta.aceite_em)}` : ''}</p>
        ) : <p className="muted">Ainda não enviada.</p>}
        {conduz && empresa.etapa === 'proposta' && (
          <div className="linha">
            {!enviada && <button className="botao primario" onClick={() => void agir(() => enviarProposta(empresa.id), 'Envio registrado. Prazo de resposta: 7 dias.')}>Registrar envio</button>}
            {enviada && <button className="botao leve" onClick={() => abrirAba('mensagens', 'A4')}>Mensagem A4</button>}
            {enviada && (
              <>
                <label className="botao">Anexar aceite<input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void agir(async () => { await enviarAnexo(empresa.id, 'aceite', f); await anexos.recarregar() }, 'Aceite anexado.') }} /></label>
                {temAceite && <span className="pill ok">aceite anexado</span>}
                <button className="botao primario" onClick={() => void agir(async () => { const destino = await registrarAceite(empresa.id); if (destino === 'direcao') setAviso('Aceite registrado. O caso foi para a Direção.') }, 'Aceite registrado. A empresa seguiu para Em contrato.')}>Registrar aceite</button>
                <button className="botao perigo" onClick={() => void agir(() => moverEtapa(empresa.id, 'espera', 'Sem acordo depois da contraproposta', retomarEmSeisMeses(hoje)), 'Empresa em espera; retomar em 6 meses.')}>Sem acordo</button>
              </>
            )}
          </div>
        )}
      </section>

      {erro && <div className="aviso perigo" role="alert">{erro}</div>}
      {aviso && <div className="aviso" role="status">{aviso}</div>}
    </div>
  )
}
