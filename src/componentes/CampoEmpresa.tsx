import { camposLongos, opcoesBusca, opcoesDoCampo, rotuloCampo } from '../dados/campos'
import { rotuloOrigem, type Empresa, type Origem } from '../dados/tipos'

type Props = {
  campo: keyof Empresa
  valor: unknown
  mudar: (v: unknown) => void
  obrigatorio?: boolean
  erro?: string
  ajuda?: string
}

// Um campo da ficha da empresa, com o controle certo para o tipo.
export function CampoEmpresa({ campo, valor, mudar, obrigatorio, erro, ajuda }: Props) {
  const rotulo = rotuloCampo[campo] ?? campo
  const id = `campo-${campo}`
  const classe = `campo${erro ? ' invalido' : ''}`
  const cabeca = <span>{rotulo}{obrigatorio && <b> *</b>}</span>
  const rodape = <>{ajuda && <small className="ajuda">{ajuda}</small>}{erro && <small className="msg">{erro}</small>}</>

  if (campo === 'busca') {
    const lista = (valor as string[] | null) ?? []
    return (
      <fieldset className={classe} style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 5 }}>{rotulo}{obrigatorio && <b style={{ color: 'var(--danger)' }}> *</b>}</legend>
        <div className="grade-2" style={{ gap: 6 }}>
          {opcoesBusca.map((o) => (
            <label key={o} className="marcar">
              <input type="checkbox" checked={lista.includes(o)} onChange={(e) => mudar(e.target.checked ? [...lista, o] : lista.filter((x) => x !== o))} />
              <span>{o}</span>
            </label>
          ))}
        </div>
        {rodape}
      </fieldset>
    )
  }
  if (campo === 'origem') {
    return (
      <label className={classe}>{cabeca}
        <select id={id} value={(valor as string) ?? ''} onChange={(e) => mudar(e.target.value as Origem)}>
          {(Object.keys(rotuloOrigem) as Origem[]).map((o) => <option key={o} value={o}>{rotuloOrigem[o]}</option>)}
        </select>{rodape}
      </label>
    )
  }
  const opcoes = opcoesDoCampo[campo]
  if (opcoes) {
    return (
      <label className={classe}>{cabeca}
        <select id={id} value={(valor as string) ?? ''} onChange={(e) => mudar(e.target.value || null)}>
          <option value="">Escolha uma opção</option>
          {opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>{rodape}
      </label>
    )
  }
  if (camposLongos.includes(campo)) {
    return (
      <label className={classe}>{cabeca}
        <textarea id={id} maxLength={campo === 'motivo_parceria' ? 800 : undefined} value={(valor as string) ?? ''} onChange={(e) => mudar(e.target.value || null)} />{rodape}
      </label>
    )
  }
  return (
    <label className={classe}>{cabeca}
      <input id={id} type={campo === 'unidades' ? 'number' : campo === 'contato_email' || campo === 'decisor_email' ? 'email' : 'text'} min={campo === 'unidades' ? 0 : undefined}
        value={(valor as string | number | null) ?? ''}
        onChange={(e) => mudar(campo === 'unidades' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value || null)} />{rodape}
    </label>
  )
}

export function valorLegivel(campo: keyof Empresa, valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return '—'
  if (campo === 'busca') return (valor as string[]).join(', ') || '—'
  if (campo === 'origem') return rotuloOrigem[valor as Origem]
  return String(valor)
}
