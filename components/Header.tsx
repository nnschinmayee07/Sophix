import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'

export default function Header(){ const router = useRouter()
  const links = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/features', label: 'Features' },
    { href: '/community', label: 'Community' },
    { href: '/participants', label: 'Participants' },
  ]
  return (
    <header className="site-header">
      <div className="brand">Sophix<span className="accent">.</span></div>
      <nav className="main-nav" role="navigation" aria-label="Main">
        {links.map(l => (
          <motion.span key={l.href} className={`nav-item ${router.pathname===l.href?'active':''}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link legacyBehavior href={l.href}><a className="nav-link">{l.label}</a></Link>
          </motion.span>
        ))}
      </nav>
    </header>
  )
}
