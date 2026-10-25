// REQ-018 — ícones de traço fino (1,5 px), cor herdada. Guia da marca: "traço fino, em dourado ou azul".
const caminhos = {
  inicio: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
  funil: 'M4 5h16l-6 7v6l-4 2v-8z',
  empresas: 'M4 20V6l6-2v16M10 9h10v11M14 13h2M14 16h2M6 9h2M6 13h2M6 16h2',
  fila: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  direcao: 'M12 3 4 7v2h16V7zM6 9v8M10 9v8M14 9v8M18 9v8M4 20h16',
  parcerias: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 2.5-5 5-5s5 2 5 5M11 20c0-3 2.5-5 5-5s5 2 5 5',
  calendario: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  operacoes: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  juridico: 'M12 4v16M6 20h12M5 8h14M5 8l-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z',
  renovacoes: 'M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4',
  painel: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  prazos: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  avisos: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  usuarios: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-7 8-7s8 3 8 7',
  regras: 'M5 4h14v16H5zM9 8h6M9 12h6M9 16h4',
  importar: 'M12 3v12M7 10l5 5 5-5M4 19h16',
  componentes: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  busca: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  ver: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  editar: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  excluir: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  mover: 'M5 12h14M13 6l6 6-6 6',
  copiar: 'M9 9h11v11H9zM5 15H4V4h11v1',
  sobe: 'M12 19V5M6 11l6-6 6 6',
  desce: 'M12 5v14M6 13l6 6 6-6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  recolher: 'M15 6l-6 6 6 6',
  expandir: 'M9 6l6 6-6 6',
  sair: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  mais: 'M12 5v14M5 12h14',
  fechar: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12l4 4 10-10',
  alerta: 'M12 4 2 20h20zM12 10v4M12 17h.01',
  mensagem: 'M4 5h16v11H8l-4 4z',
  anexo: 'M16 7l-7 7a2 2 0 0 0 3 3l7-7a4 4 0 0 0-6-6l-7 7a6 6 0 0 0 8 8l6-6',
  ativacao: 'M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z',
} as const

export type NomeIcone = keyof typeof caminhos

export function Icone({ nome, tamanho = 18, className }: { nome: NomeIcone; tamanho?: number; className?: string }) {
  return (
    <svg className={`icone${className ? ` ${className}` : ''}`} width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={caminhos[nome]} />
    </svg>
  )
}
