import { Navigate, Route, Routes } from 'react-router-dom'
import { Casca } from './componentes/Casca'
import { EmBreve } from './componentes/EmBreve'
import { Entrar } from './telas/acesso/Entrar'
import { RedefinirSenha } from './telas/acesso/RedefinirSenha'
import { Regras } from './telas/config/Regras'
import { Usuarios } from './telas/config/Usuarios'
import { Ficha } from './telas/empresa/Ficha'
import { Empresas } from './telas/empresas/Empresas'
import { NovaEmpresa } from './telas/empresas/NovaEmpresa'
import { Funil } from './telas/funil/Funil'
import { MinhaFila } from './telas/fila/MinhaFila'
import { Calendario } from './telas/calendario/Calendario'
import { Operacoes } from './telas/operacoes/Operacoes'
import { Direcao } from './telas/direcao/Direcao'
import { Juridico } from './telas/juridico/Juridico'
import { Avisos } from './telas/avisos/Avisos'
import { Formulario } from './telas/publico/Formulario'
import { Privacidade } from './telas/publico/Privacidade'

export function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/seja-parceiro" element={<Formulario />} />
      <Route path="/seja-parceiro/privacidade" element={<Privacidade />} />
      <Route element={<Casca />}>
        <Route path="/" element={<Navigate to="/funil" replace />} />
        <Route path="/funil" element={<Funil />} />
        <Route path="/fila" element={<MinhaFila />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/empresas/nova" element={<NovaEmpresa />} />
        <Route path="/empresas/:id" element={<Ficha />} />
        <Route path="/parcerias" element={<EmBreve titulo="Parcerias ativas" />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/operacoes" element={<Operacoes />} />
        <Route path="/direcao" element={<Direcao />} />
        <Route path="/juridico" element={<Juridico />} />
        <Route path="/renovacoes" element={<EmBreve titulo="Renovações" />} />
        <Route path="/painel" element={<EmBreve titulo="Painel" />} />
        <Route path="/avisos" element={<Avisos />} />
        <Route path="/config/usuarios" element={<Usuarios />} />
        <Route path="/config/regras" element={<Regras />} />
        <Route path="*" element={<EmBreve titulo="Página não encontrada" />} />
      </Route>
    </Routes>
  )
}
