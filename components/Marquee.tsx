export default function Marquee({ items, className = '' }: { items: string[]; className?: string }) {
  const loop = [...items, ...items]

  return (
    <div className={`marquee-mask ${className}`}>
      <div className="marquee-track">
        {[0, 1].map(dup => (
          <div className="marquee-row" key={dup} aria-hidden={dup === 1}>
            {loop.map((item, i) => (
              <span className="marquee-chip" key={`${dup}-${i}`}>{item}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
