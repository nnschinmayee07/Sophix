import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = { adminMode?: boolean; onLogout?: () => void }

export default function Header({ adminMode = false, onLogout }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()
  const isParticipant = !adminMode && (session?.user as any)?.role === 'participant'

  const baseParticipantLinks = [
    { href: '/', label: 'Home' },
    { href: '/participants', label: 'Participants' },
  ]

  const participantLinks = isParticipant
    ? [...baseParticipantLinks, { href: '/my/profile', label: 'My Profile' }]
    : [...baseParticipantLinks, { href: '/login', label: 'Login' }]

  const adminLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/host/profile', label: 'Host Profile' },
  ]

  const links = adminMode ? adminLinks : participantLinks
  const showLogout = onLogout ? true : isParticipant
  const handleLogout = onLogout || (() => signOut({ callbackUrl: '/' }))

  return (
    <header className="site-header">
      <div className="brand">Sophix<span className="accent">.</span></div>

      <nav className="main-nav desktop-nav" role="navigation" aria-label="Main">
        {links.map(l => (
          <span key={l.href} className={`nav-item ${router.pathname === l.href ? 'active' : ''}`}>
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-block' }}>
              <Link legacyBehavior href={l.href}><a className="nav-link">{l.label}</a></Link>
            </motion.span>
          </span>
        ))}
        {showLogout && (
          <button className="btn nav-logout" onClick={handleLogout}>Logout</button>
        )}
      </nav>

      <button
        className="mobile-menu-btn"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(o => !o)}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            role="navigation"
            aria-label="Mobile"
          >
            {links.map(l => (
              <Link legacyBehavior key={l.href} href={l.href}>
                <a className={`mobile-nav-link ${router.pathname === l.href ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                  {l.label}
                </a>
              </Link>
            ))}
            {showLogout && (
              <button className="btn nav-logout mobile-nav-link" onClick={() => { setMenuOpen(false); handleLogout() }}>Logout</button>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
