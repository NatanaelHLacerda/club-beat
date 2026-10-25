import { Link } from 'react-router-dom'

export function Privacidade() {
  return (
    <div className="publico">
      <header className="marca" style={{ padding: 0 }}><b>Club Beat</b><span>Parcerias</span></header>
      <h1>Como usamos os dados da ficha de parceria</h1>
      <p className="aviso alerta">Versão provisória, até a revisão do advogado que apoia o Club.</p>
      <div className="cartao">
        <p>Usamos as informações da ficha só para avaliar a parceria e entrar em contato com a pessoa responsável.</p>
        <p>Não compartilhamos os dados com terceiros.</p>
        <p>O formulário não pede CPF, dados financeiros detalhados nem dados sensíveis. Pedimos que os anexos tragam só material que a empresa pode compartilhar.</p>
        <p>O Club não compartilha nem recebe pedidos de contato dos seus membros.</p>
        <p>Para pedir a correção ou a exclusão dos dados enviados, fale com a equipe de parcerias do Club.</p>
      </div>
      <Link to="/seja-parceiro">← Voltar ao formulário</Link>
    </div>
  )
}
