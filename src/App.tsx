import { Navigate, Route, Routes } from 'react-router-dom'
import { Casca } from './componentes/Casca'
import { EmBreve } from './componentes/EmBreve'
import { Entrar } from './telas/acesso/Entrar'
import { RedefinirSenha } from './telas/acesso/RedefinirSenha'
import { Usuarios } from './telas/config/Usuarios'

export function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route element={<Casca />}>
        <Route path="/" element={<Navigate to="/funil" replace />} />
        <Route path="/funil" element={<EmBreve titulo="Funil" />} />
        <Route path="/empresas" element={<EmBreve titulo="Empresas" />} />
        <Route path="/parcerias" element={<EmBreve titulo="Parcerias ativas" />} />
        <Route path="/calendario" element={<EmBreve titulo="Calendário" />} />
        <Route path="/renovacoes" element={<EmBreve titulo="Renovações" />} />
        <Route path="/painel" element={<EmBreve titulo="Painel" />} />
        <Route path="/avisos" element={<EmBreve titulo="Avisos" />} />
        <Route path="/config/usuarios" element={<Usuarios />} />
        <Route path="/config/regras" element={<EmBreve titulo="Regras e modelos" />} />
        <Route path="*" element={<EmBreve titulo="Página não encontrada" />} />
      </Route>
    </Routes>
  )
}
