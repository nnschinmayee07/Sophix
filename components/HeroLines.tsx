export default function HeroLines() {
  const sideCount = 14
  const topCount = 10

  return (
    <>
      <div className="hero-lines hero-lines-left" aria-hidden="true">
        {Array.from({ length: sideCount }, (_, i) => (
          <span
            key={i}
            className="hero-line hero-line-side"
            style={{ width: 60 + i * 10, animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>
      <div className="hero-lines hero-lines-right" aria-hidden="true">
        {Array.from({ length: sideCount }, (_, i) => (
          <span
            key={i}
            className="hero-line hero-line-side hero-line-right"
            style={{ width: 60 + i * 10, animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>
      <div className="hero-lines hero-lines-top" aria-hidden="true">
        {Array.from({ length: topCount }, (_, i) => (
          <span
            key={i}
            className="hero-line hero-line-top"
            style={{ height: 60 + i * 10, animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>
    </>
  )
}
