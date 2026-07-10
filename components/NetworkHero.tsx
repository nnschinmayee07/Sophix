import { useEffect, useRef } from 'react'

type Node = { x: number; y: number; vx: number; vy: number }

export default function NetworkHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let nodes: Node[] = []
    let raf = 0

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function resize() {
      if (!canvas) return
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      ctx!.scale(devicePixelRatio, devicePixelRatio)
      const count = Math.min(60, Math.floor((width * height) / 18000))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }))
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height)
      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 140) {
            ctx!.strokeStyle = `rgba(77,107,255,${0.16 * (1 - dist / 140)})`
            ctx!.lineWidth = 1
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }
      for (const n of nodes) {
        ctx!.fillStyle = 'rgba(102,132,255,0.7)'
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, 1.6, 0, Math.PI * 2)
        ctx!.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    if (!prefersReducedMotion) draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-network-canvas" aria-hidden="true" />
}
