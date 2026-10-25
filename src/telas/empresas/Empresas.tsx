import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topo } from '../../componentes/Casca'
import { Filtros, nomeDe } from '../../componentes/Filtros'
import { EtapaTag, Exemplo, PadraoTag } from '../../componentes/Rotulos'
import { listarEmpresas, listarUsuarios } from '../../dados/api'
import { rotuloOrigem, type FiltrosEmpresas } from '../../dados/tipos'
import { formatarCnpj, formatarData } from '../../regras/formato'
import { useConsulta } from '../../lib/useConsulta'

export function Empresas() {
  const navegar = useNavigate()
  const [filtros, setFiltros] = useState<FiltrosEmpresas>({})
  const empresas = useConsulta(() => listarEmpresas(filtros), [JSON.stringify(filtros)])
  const usuarios = useConsulta(listarUsuarios)
  const lista = empresas.dado ?? []

  return (
    <>
      <Topo eyebrow="Funil de parcerias" titulo="Empresas">
        <span className="muted num">{lista.length} empresas</span>
      </Topo>
      <Filtros filtros={filtros} mudar={setFiltros} usuarios={usuarios.dado ?? []} busca />
      {empresas.erro && <div className="aviso perigo" role="alert">{empresas.erro}</div>}
      {empresas.carregando && !empresas.dado ? <p className="muted">Carregando…</p> : lista.length === 0 ? (
        <div className="vazio">Nenhuma empresa encontrada.</div>
      ) : (
        <div className="tabela-rolagem">
          <table>
            <thead><tr><th>Chegada</th><th>Marca</th><th>CNPJ</th><th>Segmento</th><th>Etapa</th><th>Padrão</th><th>Responsável</th><th>Origem</th></tr></thead>
            <tbody>
              {lista.map((e) => (
                <tr key={e.id} className="clicavel" onClick={() => navegar(`/empresas/${e.id}`)}>
                  <td className="num">{formatarData(e.criado_em)}</td>
                  <td><b style={{ color: 'var(--ink)', fontWeight: 500 }}>{e.marca}</b> <Exemplo mostrar={e.exemplo} /></td>
                  <td className="num muted">{formatarCnpj(e.cnpj)}</td>
                  <td>{e.segmento}</td>
                  <td><EtapaTag etapa={e.etapa} /></td>
                  <td><PadraoTag padrao={e.padrao_final} /></td>
                  <td>{nomeDe(usuarios.dado, e.responsavel_id ?? e.gerente1_id)}</td>
                  <td className="muted">{rotuloOrigem[e.origem]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
