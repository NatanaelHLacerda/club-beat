import { useState } from 'react'
import { encerrarComA5, listarCategorias, listarModelos, moverEtapa, salvarTriagem1 } from '../../dados/api'
import { pendenciaDecisor } from '../../regras/decisor'
import { formatarData, hojeISO, soDigitos } from '../../regras/formato'
import { preencherModelo } from '../../regras/mensagens'
import {
  alertaCategoria, bloqueioCategoriaSemReceita, bloqueioCnpj, diasDesdePedido, diasSemRetorno, itensTriagem1, pendenciasTriagem1,
  rotuloSituacaoReceita, textosTriagem1, type MarcasTriagem1, type SituacaoReceita,
} from '../../regras/triagem1'
import { pode } from '../../lib/permissoes'
import { useConsulta } from '../../lib/useConsulta'
import { useSessao } from '../../sessao'
import type { PropsAba } from './Ficha'

export function AbaTriagem1({ empresa, atualizar, abrirAba }: PropsAba) {
  const { perfil } = useSessao()
  const categorias = useConsulta(listarCategorias)
  const modelos = useConsulta(listarModelos)
  const [marcas, setMarcas] = useState<MarcasTriagem1>(empresa.triagem1 ?? {})
  const [categoria, setCategoria] = useState(empresa.categoria ?? '')
  const [receita, setReceita] = useState<string>(empresa.receita_situacao ?? '')
  const [porteReceita, setPorteReceita] = useState<string>(empresa.receita_porte ?? '')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const editavel = pode(perfil, 'triar') && ['recebida', 'triagem1'].includes(empresa.etapa)

  const situacaoCategoria = categorias.dado?.find((c) => c.nome === categoria)?.situacao
  const alerta = alertaCategoria(situacaoCategoria)
  const inativa = bloqueioCnpj(receita as SituacaoReceita)
  const bloqueioCategoria = bloqueioCategoriaSemReceita(receita as SituacaoReceita | '')
  const dias = diasDesdePedido(empresa.pedido_info_em, hojeISO())
  const pendencias = pendenciasTriagem1(marcas)
  const faltaDecisor = pendenciaDecisor(empresa)

  function marcar(id: keyof MarcasTriagem1, v: boolean) {
    setMarcas({ ...marcas, [id]: v })
  }

  async function salvar(concluir: boolean) {
    setErro(''); setAviso('')
    try {
      if (empresa.etapa === 'recebida') await moverEtapa(empresa.id, 'triagem1')
      await salvarTriagem1(empresa.id, marcas, categoria, receita, porteReceita)
      if (concluir) await moverEtapa(empresa.id, 'triagem2')
      setAviso(concluir ? 'Triagem 1 concluída. A empresa seguiu para a Triagem 2.' : 'Triagem salva.')
      await atualizar()
    } catch (e) { setErro((e as Error).message) }
  }

  async function encerrar() {
    setErro('')
    const modelo = modelos.dado?.find((m) => m.codigo === 'A5')
    if (!modelo) return
    try {
      await salvarTriagem1(empresa.id, marcas, categoria, receita, porteReceita)
      await encerrarComA5(empresa.id, preencherModelo(modelo.texto, { nome: empresa.contato_nome, empresa: empresa.marca }), `Categoria não aceita: ${categoria}`)
      await atualizar()
    } catch (e) { setErro((e as Error).message) }
  }

  return (
    <div className="pilha">
      {!editavel && <div className="aviso">A Triagem 1 só muda enquanto a empresa está em Recebida ou Triagem 1.</div>}
      <div className="grade-2">
        <section className="cartao">
          <h3>Lista de conferência</h3>
          {itensTriagem1.map((i) => {
            const bloqueado = i.id === 'cnpj' && Boolean(inativa)
            return (
              <label key={i.id} className="marcar">
                <input type="checkbox" disabled={!editavel || bloqueado} checked={Boolean(marcas[i.id]) && !bloqueado} onChange={(e) => marcar(i.id, e.target.checked)} />
                <span>{i.rotulo}{bloqueado && <span className="erro"> · {textosTriagem1.inativa}</span>}</span>
              </label>
            )
          })}
          {pendencias.length > 0 && <p className="muted pequeno">Faltam {pendencias.length} de {itensTriagem1.length}.</p>}
          {faltaDecisor && (
            <div className="aviso alerta" role="alert">
              {faltaDecisor} <button className="botao leve" onClick={() => abrirAba('resumo')}>Abrir o Resumo</button>
            </div>
          )}
        </section>
        <div className="pilha">
          <section className="cartao">
            <h3>Receita Federal</h3>
            <p className="muted pequeno">Confira na <a href={`https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp?cnpj=${soDigitos(empresa.cnpj)}`} target="_blank" rel="noreferrer">consulta pública do CNPJ</a> e registre aqui.</p>
            <div className="grade-2">
              <label className="campo"><span>Situação</span>
                <select id="t1-receita" disabled={!editavel} value={receita} onChange={(e) => setReceita(e.target.value)}>
                  <option value="">—</option>
                  {(Object.keys(rotuloSituacaoReceita) as SituacaoReceita[]).map((s) => <option key={s} value={s}>{rotuloSituacaoReceita[s]}</option>)}
                </select>
              </label>
              <label className="campo"><span>Porte declarado</span>
                <select id="t1-porte-receita" disabled={!editavel} value={porteReceita} onChange={(e) => setPorteReceita(e.target.value)}>
                  <option value="">—</option>
                  <option value="ME">Microempresa</option>
                  <option value="EPP">Empresa de pequeno porte</option>
                  <option value="demais">Demais</option>
                </select>
              </label>
            </div>
            {inativa && <div className="aviso perigo">{inativa}</div>}
          </section>
          <section className="cartao">
            <h3>Categoria</h3>
            <label className="campo"><span>Categoria da empresa</span>
              <select id="t1-categoria" disabled={!editavel || Boolean(bloqueioCategoria)} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="">Escolha a categoria</option>
                {(categorias.dado ?? []).map((c) => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
              </select>
            </label>
            {bloqueioCategoria && editavel && <div className="aviso alerta" role="status">{bloqueioCategoria}</div>}
            {alerta && <div className={`aviso ${situacaoCategoria === 'nao_aceita' ? 'perigo' : 'alerta'}`} role="status">{alerta}</div>}
            {situacaoCategoria === 'nao_aceita' && editavel && (
              <button className="botao perigo" onClick={() => void encerrar()}>Encerrar com A5</button>
            )}
          </section>
          <section className="cartao">
            <h3>Pedido de informação</h3>
            {empresa.pedido_info_em ? (
              <p className={dias !== null && dias >= diasSemRetorno ? 'erro' : ''}>
                Pedido em {formatarData(empresa.pedido_info_em)} · {dias !== null && dias >= diasSemRetorno ? `Sem retorno há ${dias} dias` : `${dias} de ${diasSemRetorno} dias`}
              </p>
            ) : <p className="muted">Nenhum pedido feito.</p>}
            {editavel && <button className="botao" onClick={() => abrirAba('mensagens', 'PEDIDO_INFO')}>Pedir informação</button>}
          </section>
        </div>
      </div>
      {erro && <div className="aviso perigo" role="alert">{erro}</div>}
      {aviso && <div className="aviso" role="status">{aviso}</div>}
      {editavel && (
        <div className="linha">
          <button className="botao" onClick={() => void salvar(false)}>Salvar</button>
          <button className="botao primario" onClick={() => void salvar(true)}>Concluir triagem 1</button>
        </div>
      )}
    </div>
  )
}
