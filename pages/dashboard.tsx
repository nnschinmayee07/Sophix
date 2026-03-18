import Header from '../components/Header'
import Dashboard from '../components/Dashboard'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim() && password.trim()) setAuthed(true)
  }

  if (!authed) {
    return (
      <div className="page">
        <Header adminMode />
        <main className="container">
          <motion.div className="admin-login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="admin-login-card">
              <div className="admin-lock-icon">🔐</div>
              <h2>Admin Login</h2>
              <p className="muted">Enter any credentials to continue</p>
              <form onSubmit={login}>
                <div className="form-row" style={{ marginTop: 20 }}>
                  <label>Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" autoFocus required />
                </div>
                <div className="form-row" style={{ marginTop: 12 }}>
                  <label>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
                </div>
                <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 20, padding: '12px' }}>
                  Login as Admin
                </button>
              </form>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <Header adminMode />
      <main className="container">
        <Dashboard />
      </main>
    </div>
  )
}
