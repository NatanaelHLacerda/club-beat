// Campos da ficha da empresa (documento-base cap. 5): rótulos e opções. Usado pela ficha, pelo formulário e pela entrada manual.
import type { Empresa } from './tipos'

export const segmentos = [
  'saúde e bem-estar', 'nutrição e alimentação', 'beleza e estética', 'moda e acessórios', 'tecnologia',
  'mobilidade e automotivo', 'imobiliário e construção', 'serviços financeiros', 'cultura e experiências', 'indústria', 'outro',
]

export const temposAtuacao = ['menos de 1', '1 a 3', '3 a 10', 'mais de 10']

export const faixasFaturamento = [
  'até R$ 360 mil', 'R$ 360 mil a R$ 4,8 mi', 'R$ 4,8 mi a R$ 90 mi', 'R$ 90 mi a R$ 300 mi', 'acima de R$ 300 mi',
  'prefiro informar na reunião',
]

export const faixasFuncionarios = ['até 9', '10 a 49', '50 a 99', '100 a 499', '500 ou mais']

export const opcoesBusca = [
  'telas do Club', 'ativações dentro do Club', 'eventos', 'conteúdo e redes sociais', 'presença de marca',
  'troca de serviços', 'patrocínio', 'outro',
]

export const objetivos = [
  'dar a conhecer a marca', 'gerar vendas ou contatos', 'lançar um produto',
  'criar relacionamento com público de alto padrão', 'oferecer uma experiência', 'outro',
]

export const duracoes = ['piloto curto', '6 meses', '12 meses', 'mais de 12 meses']

export const quemDecideOpcoes = ['eu mesmo', 'outra pessoa']

export const ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

export const rotuloCampo: Partial<Record<keyof Empresa | string, string>> = {
  cnpj: 'CNPJ', razao_social: 'Razão social', marca: 'Nome da marca', cidade: 'Cidade', uf: 'Estado', bairro: 'Bairro',
  segmento: 'Segmento', site: 'Site', instagram: 'Instagram', tempo_atuacao: 'Tempo de atuação (anos)',
  faixa_faturamento: 'Faturamento anual aproximado', faixa_funcionarios: 'Número de funcionários', unidades: 'Unidades ou lojas',
  contato_nome: 'Nome do responsável', contato_cargo: 'Cargo', contato_whatsapp: 'WhatsApp', contato_email: 'E-mail',
  quem_decide: 'Quem decide a parceria', busca: 'O que a empresa busca', motivo_parceria: 'Por que busca a parceria com o Club',
  objetivo: 'Objetivo principal', publico: 'Público da marca', parcerias_anteriores: 'Parcerias ou patrocínios anteriores',
  investimento_faixa: 'Investimento previsto', inicio_desejado: 'Quando quer começar', duracao: 'Duração pretendida',
  datas_interesse: 'Datas de interesse', origem: 'Origem', indicado_por: 'Indicada por',
  gerente1_id: 'Gerente 1', gerente2_id: 'Gerente 2', responsavel_id: 'Responsável final', porte: 'Porte', padrao_final: 'Padrão',
  categoria: 'Categoria', triagem1: 'Lista da Triagem 1', receita_situacao: 'Situação na Receita', receita_porte: 'Porte na Receita', pedido_info_em: 'Pedido de informação',
  classificacao: 'Ficha de classificação', estudo: 'Estudo da empresa', candidata_master: 'Candidata a Master', triagem2_concluida_em: 'Triagem 2 concluída',
  passada_em: 'Passada à Gerente', distribuicao: 'Distribuição', passagem: 'Ficha de passagem',
}

export const blocosFicha: { titulo: string; campos: (keyof Empresa)[] }[] = [
  { titulo: 'Sobre a empresa', campos: ['cnpj', 'razao_social', 'marca', 'cidade', 'uf', 'bairro', 'segmento', 'site', 'instagram', 'tempo_atuacao', 'faixa_faturamento', 'faixa_funcionarios', 'unidades'] },
  { titulo: 'Responsável', campos: ['contato_nome', 'contato_cargo', 'contato_whatsapp', 'contato_email', 'quem_decide'] },
  { titulo: 'Sobre a parceria', campos: ['busca', 'motivo_parceria', 'objetivo', 'publico', 'parcerias_anteriores', 'investimento_faixa', 'inicio_desejado', 'duracao', 'datas_interesse', 'origem', 'indicado_por'] },
]

export const opcoesDoCampo: Partial<Record<keyof Empresa, string[]>> = {
  segmento: segmentos, tempo_atuacao: temposAtuacao, faixa_faturamento: faixasFaturamento,
  faixa_funcionarios: faixasFuncionarios, objetivo: objetivos, duracao: duracoes, quem_decide: quemDecideOpcoes, uf: ufs,
}

export const camposLongos: (keyof Empresa)[] = ['motivo_parceria', 'publico', 'parcerias_anteriores']
