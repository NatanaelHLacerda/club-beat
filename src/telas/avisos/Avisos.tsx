import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { BotaoIcone, Carregando, CartaoNumero, Icone, Vazio, type NomeIcone } from '../../componentes/ui'
import { listarAvisos, marcarAvisoLido, marcarTodosAvisosLidos } from '../../dados/api'
import type { Aviso } from '../../dados/tipos'
import { formatarDataHora } from '../../regras/formato'
import { useConsulta } from '../../lib/useConsulta'

function iconeDoAviso(tipo: string): NomeIcone {
  if (/prazo|parada|reserva/.test(tipo)) return 'prazos'
  if (/renov/.test(tipo)) return 'renovacoes'
  if (/decis/.test(tipo)) return 'direcao'
  if (/contrato|divergencia/.test(tipo)) return 'juridico'
  if (/relatorio/.test(tipo)) return 'painel'
  if (/ficha|empresa|indicacao|passagem/.test(tipo)) return 'empresas'
  if (/reuniao/.test(tipo)) return 'calendario'
  if (/operacoes|parceria_ativa/.test(tipo)) return 'operacoes'
  return 'avisos'
}

// REQ-024 — avisos no estilo "Task overview" do kit.
export function Avisos() {
  const navegar = useNavigate()
  const avisos = useConsulta(listarAvisos)
  const [so, setSo] = useState<'todos' | 'nao_lidos'>('nao_lidos')
  const lista = (avisos.dado ?? []).filter((a) => so === 'todos' || !a.lido_em)
  const naoLidos = (avisos.dado ?? []).filter((a) => !a.lido_em).length

  async function atualizar(f: () => Promise<void>) {
    await f()
    await avisos.recarregar()
    window.dispatchEvent(new Event('avisos-mudaram'))
  }

  return (
    <>
      <Topo eyebrow="Acompanhamento" titulo="Avisos">
        <div className="alternar" role="group" aria-label="Mostrar">
          <button className={so === 'nao_lidos' ? 'ativo' : ''} aria-pressed={so === 'nao_lidos'} onClick={() => setSo('nao_lidos')}>Não lidos</button>
          <button className={so === 'todos' ? 'ativo' : ''} aria-pressed={so === 'todos'} onClick={() => setSo('todos')}>Todos</button>
        </div>
        <button className="botao" disabled={!naoLidos} onClick={() => void atualizar(marcarTodosAvisosLidos)}><Icone nome="check" tamanho={14} /> Marcar todos como lidos</button>
      </Topo>
      <div className="numeros">
        <CartaoNumero rotulo="Não lidos" icone="avisos" valor={avisos.dado ? naoLidos : '—'} />
        <CartaoNumero rotulo="Total recente" icone="fila" valor={avisos.dado ? avisos.dado.length : '—'} />
      </div>
      {avisos.erro && <div className="aviso perigo">{avisos.erro}</div>}
      {avisos.carregando && !avisos.dado ? <Carregando /> : lista.length === 0 ? <Vazio texto={so === 'nao_lidos' ? 'Nenhum aviso não lido.' : 'Nenhum aviso por enquanto.'} icone="avisos" /> : (
        <section className="cartao">
          <ul className="lista-tarefas">
            {lista.map((a: Aviso) => (
              <li key={a.id} style={{ opacity: a.lido_em ? 0.6 : 1 }}>
                <div className="item-fixo">
                  <span className="icone-redondo"><Icone nome={iconeDoAviso(a.tipo)} tamanho={14} /></span>
                  <span className="pilha" style={{ gap: 2, minWidth: 0 }}>
                    <span>{!a.lido_em && <span className="pill ouro" style={{ marginRight: 6 }}>Novo</span>}{a.texto}</span>
                    <span className="muted pequeno"><Icone nome="calendario" tamanho={12} /> {formatarDataHora(a.em)}</span>
                  </span>
                  <span className="linha" style={{ gap: 2, flexWrap: 'nowrap' }}>
                    {a.empresa_id && <BotaoIcone icone="ver" rotulo="Abrir empresa" aoClicar={() => navegar(`/empresas/${a.empresa_id}`)} />}
                    {!a.lido_em && <BotaoIcone icone="check" rotulo="Marcar como lido" aoClicar={() => void atualizar(() => marcarAvisoLido(a.id))} />}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
