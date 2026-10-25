import { Topo } from './Casca'

export function EmBreve({ titulo }: { titulo: string }) {
  return (
    <>
      <Topo titulo={titulo} />
      <div className="vazio">Esta área ainda está sendo construída.</div>
    </>
  )
}
