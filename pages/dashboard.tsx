import { useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Dashboard from '../components/Dashboard'
import { motion } from 'framer-motion'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (!name.trim()) return setError('ACCESS_DENIED: name required')
      if (!EMAIL_RE.test(email.trim())) return setError('ACCESS_DENIED: valid email required')
      if (password.length < 8) return setError('ACCESS_DENIED: password too short (min 8 chars)')

      setSubmitting(true)
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'admin' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitting(false)
        setError(`ACCESS_DENIED: ${data.error || 'signup failed'}`)
        return
      }
    }

    setSubmitting(true)
    const res = await signIn('credentials', { redirect: false, email, password })
    if (res?.error) {
      setSubmitting(false)
      setError('ACCESS_DENIED: invalid credentials')
      return
    }
    // Verify the authenticated account is actually an admin before granting access
    const check = await fetch('/api/auth/session')
    const data = await check.json()
    setSubmitting(false)
    if (data?.user?.role !== 'admin') {
      setError('ACCESS_DENIED: this account is not an admin')
      await signOut({ redirect: false })
    }
  }

  const isAdmin = (session?.user as any)?.role === 'admin'

  if (status === 'loading') {
    return (
      <div className="page">
        <Header adminMode />
        <main className="container">
          <div className="admin-login">
            <p className="muted">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!session || !isAdmin) {
    return (
      <div className="page">
        <Header adminMode />
        <main className="container">
          <motion.div className="admin-login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glitch-form-wrapper">
              <form className="glitch-card" onSubmit={login}>
                <div className="card-header">
                  <div className="card-title">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24" height="24" viewBox="0 0 24 24"
                      strokeWidth="1.5" stroke="currentColor" fill="none"
                      strokeLinecap="round" strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                      <path d="M12 11.5a3 3 0 0 0 -3 2.824v1.176a3 3 0 0 0 6 0v-1.176a3 3 0 0 0 -3 -2.824z" />
                    </svg>
                    <span>{mode === 'login' ? 'SECURE_ADMIN' : 'CREATE_ADMIN'}</span>
                  </div>
                  <div className="card-dots"><span /><span /><span /></div>
                </div>

                <div className="card-body">
                  {mode === 'signup' && (
                    <div className={`glitch-form-group ${name ? 'has-value' : ''}`}>
                      <input
                        id="admin-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                        required
                      />
                      <label htmlFor="admin-name" className="glitch-form-label" data-text="NAME">NAME</label>
                    </div>
                  )}

                  <div className={`glitch-form-group ${email ? 'has-value' : ''}`}>
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoFocus={mode === 'login'}
                      required
                    />
                    <label htmlFor="admin-email" className="glitch-form-label" data-text="EMAIL">EMAIL</label>
                  </div>

                  <div className={`glitch-form-group ${password ? 'has-value' : ''}`}>
                    <input
                      id="admin-password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <label htmlFor="admin-password" className="glitch-form-label" data-text="ACCESS_KEY">ACCESS_KEY</label>
                  </div>

                  {error && <p className="glitch-error">{error}</p>}

                  <button
                    data-text={submitting ? 'AUTHENTICATING...' : mode === 'login' ? 'INITIATE_CONNECTION' : 'PROVISION_ACCESS'}
                    type="submit"
                    className="glitch-submit-btn"
                    disabled={submitting}
                  >
                    <span className="btn-text">
                      {submitting ? 'AUTHENTICATING...' : mode === 'login' ? 'INITIATE_CONNECTION' : 'PROVISION_ACCESS'}
                    </span>
                  </button>

                  <p className="glitch-toggle">
                    {mode === 'login' ? 'NO_ADMIN_ACCOUNT?' : 'ALREADY_PROVISIONED?'}{' '}
                    <button
                      type="button"
                      className="glitch-toggle-link"
                      onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                    >
                      {mode === 'login' ? 'CREATE_ONE' : 'LOG_IN'}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <Header adminMode onLogout={() => signOut({ callbackUrl: '/' })} />
      <main className="container">
        <Dashboard />
      </main>
      <Footer />
    </div>
  )
}
