import { Link } from 'react-router-dom'
import { Topo } from './Casca'

export function NaoEncontrada() {
  return (
    <>
      <Topo titulo="Página não encontrada" />
      <div className="vazio">Este endereço não existe no CRM. <Link to="/funil">Voltar ao funil</Link></div>
    </>
  )
}
