import { Navigate, Route, Routes } from 'react-router-dom'
import { Casca } from './componentes/Casca'
import { NaoEncontrada } from './componentes/NaoEncontrada'
import { Entrar } from './telas/acesso/Entrar'
import { RedefinirSenha } from './telas/acesso/RedefinirSenha'
import { Regras } from './telas/config/Regras'
import { Usuarios } from './telas/config/Usuarios'
import { Ficha } from './telas/empresa/Ficha'
import { NovaEmpresa } from './telas/empresas/NovaEmpresa'
import { TelaEmpresas } from './telas/empresas/TelaEmpresas'
import { MinhaFila } from './telas/fila/MinhaFila'
import { Calendario } from './telas/calendario/Calendario'
import { Operacoes } from './telas/operacoes/Operacoes'
import { Direcao } from './telas/direcao/Direcao'
import { Juridico } from './telas/juridico/Juridico'
import { Parcerias } from './telas/parcerias/Parcerias'
import { Renovacoes } from './telas/renovacoes/Renovacoes'
import { Prazos } from './telas/prazos/Prazos'
import { Painel } from './telas/painel/Painel'
import { Importar } from './telas/config/Importar'
import { Componentes } from './telas/config/Componentes'
import { Inicio } from './telas/inicio/Inicio'
import { Avisos } from './telas/avisos/Avisos'
import { MeuPerfil } from './telas/perfil/MeuPerfil'
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
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/funil" element={<TelaEmpresas key="funil" />} />
        <Route path="/fila" element={<MinhaFila />} />
        <Route path="/empresas" element={<TelaEmpresas key="empresas" forcarLista recorte="geral" />} />
        <Route path="/empresas/recusadas" element={<TelaEmpresas key="recusadas" forcarLista recorte="recusadas" />} />
        <Route path="/empresas/nova" element={<NovaEmpresa />} />
        <Route path="/empresas/:id" element={<Ficha />} />
        <Route path="/parcerias" element={<Parcerias />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/operacoes" element={<Operacoes />} />
        <Route path="/direcao" element={<Direcao />} />
        <Route path="/juridico" element={<Juridico />} />
        <Route path="/renovacoes" element={<Renovacoes />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/avisos" element={<Avisos />} />
        <Route path="/perfil" element={<MeuPerfil />} />
        <Route path="/prazos" element={<Prazos />} />
        <Route path="/config/usuarios" element={<Usuarios />} />
        <Route path="/config/regras" element={<Regras />} />
        <Route path="/config/importar" element={<Importar />} />
        <Route path="/config/componentes" element={<Componentes />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  )
}
