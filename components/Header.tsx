import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'

type Props = { adminMode?: boolean }

export default function Header({ adminMode = false }: Props) {
  const router = useRouter()

  const participantLinks = [
    { href: '/', label: 'Home' },
    { href: '/participants', label: 'Participants' },
    { href: '/features', label: 'Features' },
    { href: '/community', label: 'Community' },
  ]

  const adminLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/features', label: 'Features' },
    { href: '/community', label: 'Community' },
  ]

  const links = adminMode ? adminLinks : participantLinks

  return (
    <header className="site-header">
      <div className="brand">Sophix<span className="accent">.</span></div>
      <nav className="main-nav" role="navigation" aria-label="Main">
        {links.map(l => (
          <span key={l.href} className={`nav-item ${router.pathname === l.href ? 'active' : ''}`}>
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
              <Link legacyBehavior href={l.href}><a className="nav-link">{l.label}</a></Link>
            </motion.span>
          </span>
        ))}
      </nav>
    </header>
  )
}
