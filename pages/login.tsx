import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (status !== 'loading' && session && (session.user as any)?.role === 'participant') {
    if (typeof window !== 'undefined') router.replace('/my/profile')
  }

  const submit = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSubmitting(false)
        setError(`ACCESS_DENIED: ${data.error || 'signup failed'}`)
        return
      }
    }

    setSubmitting(true)
    const result = await signIn('credentials', { redirect: false, email, password })
    setSubmitting(false)
    if (result?.error) {
      setError('ACCESS_DENIED: invalid credentials')
      return
    }
    router.push('/my/profile')
  }

  return (
    <div className="page">
      <Header />
      <main className="container">
        <motion.div className="admin-login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glitch-form-wrapper">
            <form className="glitch-card" onSubmit={submit}>
              <div className="card-header">
                <div className="card-title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24" height="24" viewBox="0 0 24 24"
                    strokeWidth="1.5" stroke="currentColor" fill="none"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                  </svg>
                  <span>{mode === 'login' ? 'SECURE_PARTICIPANT' : 'CREATE_PARTICIPANT'}</span>
                </div>
                <div className="card-dots"><span /><span /><span /></div>
              </div>

              <div className="card-body">
                {mode === 'signup' && (
                  <div className={`glitch-form-group ${name ? 'has-value' : ''}`}>
                    <input
                      id="participant-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      autoFocus
                      required
                    />
                    <label htmlFor="participant-name" className="glitch-form-label" data-text="NAME">NAME</label>
                  </div>
                )}

                <div className={`glitch-form-group ${email ? 'has-value' : ''}`}>
                  <input
                    id="participant-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus={mode === 'login'}
                    required
                  />
                  <label htmlFor="participant-email" className="glitch-form-label" data-text="EMAIL">EMAIL</label>
                </div>

                <div className={`glitch-form-group ${password ? 'has-value' : ''}`}>
                  <input
                    id="participant-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="participant-password" className="glitch-form-label" data-text="ACCESS_KEY">ACCESS_KEY</label>
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
                  {mode === 'login' ? 'NO_ACCOUNT?' : 'ALREADY_REGISTERED?'}{' '}
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
      <Footer />
    </div>
  )
}
