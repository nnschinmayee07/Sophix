import Header from '../components/Header'
import Dashboard from '../components/Dashboard'
import { useState } from 'react'

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234'

export default function DashboardPage() {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      setAuthed(true)
      setError('')
    } else {
      setError('Incorrect PIN. Try again.')
    }
  }

  if (!authed) {
    return (
      <div className="page">
        <Header />
        <main className="container">
          <div className="admin-login">
            <div className="admin-login-card">
              <div className="admin-lock-icon">🔐</div>
              <h2>Admin Access</h2>
              <p className="muted">Enter your admin PIN to continue</p>
              <form onSubmit={login}>
                <div className="form-row" style={{ marginTop: 20 }}>
                  <label>Admin PIN</label>
                  <input
                    type="password"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Enter PIN"
                    autoFocus
                  />
                </div>
                {error && <p className="error-msg">{error}</p>}
                <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 14, padding: '12px' }}>
                  Login as Admin
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <Header />
      <main className="container">
        <Dashboard />
      </main>
    </div>
  )
}
